import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyIdToken } from '../services/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const GALLERY_DIR = path.join(__dirname, '../storage/gallery');
const UPLOAD_DIR = path.join(__dirname, '../storage/uploads/gallery');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(GALLERY_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Get user-specific storage file path
function getUserGalleryFile(userId) {
  return path.join(GALLERY_DIR, `${userId}.json`);
}

// Read gallery data for a specific user
async function readGallery(userId) {
  try {
    const storageFile = getUserGalleryFile(userId);
    const data = await fs.readFile(storageFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write gallery data for a specific user
async function writeGallery(userId, data) {
  const storageFile = getUserGalleryFile(userId);
  await fs.writeFile(storageFile, JSON.stringify(data, null, 2), 'utf-8');
}

// 認証ミドルウェア
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: '認証トークンが提供されていません' });
  }
  
  try {
    const decodedToken = await verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: '無効なトークンです' });
  }
}

// Save base64 image to file
async function saveImage(base64Data, filename) {
  try {
    // Handle both data URLs and plain base64 strings
    let base64Content = base64Data;
    if (base64Data.startsWith('data:')) {
      base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    }
    
    const buffer = Buffer.from(base64Content, 'base64');
    if (buffer.length === 0) {
      throw new Error('Invalid base64 data: empty buffer');
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);
    return `/uploads/gallery/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

// Initialize on startup
ensureDirectories();

// GET /api/gallery - Get all gallery items for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    let gallery = await readGallery(userId);
    
    res.json(gallery);
  } catch (error) {
    console.error('Error reading gallery:', error);
    res.status(500).json({ error: 'Failed to read gallery' });
  }
});

// POST /api/gallery - Save new gallery item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { originalImageUrl, generatedImageUrl, mode, aspectRatio } = req.body;

    if (!originalImageUrl || !generatedImageUrl || !mode || !aspectRatio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const gallery = await readGallery(userId);

    // Save images
    const originalFilename = `original_${Date.now()}.png`;
    const generatedFilename = `generated_${Date.now()}.png`;

    const originalPath = await saveImage(originalImageUrl, originalFilename);
    const generatedPath = await saveImage(generatedImageUrl, generatedFilename);

    // Create new item
    const newItem = {
      id: `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalImageUrl: originalPath,
      generatedImageUrl: generatedPath,
      mode,
      aspectRatio,
      createdAt: new Date().toISOString()
    };

    // If gallery is at limit (5 items), remove the oldest item
    if (gallery.length >= 5) {
      // Sort by createdAt to find the oldest item
      const sortedGallery = [...gallery].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const oldestItem = sortedGallery[0];
      
      // Delete the oldest item's image files
      try {
        if (oldestItem.originalImageUrl) {
          const originalPath = path.join(__dirname, '..', oldestItem.originalImageUrl);
          await fs.unlink(originalPath);
        }
        if (oldestItem.generatedImageUrl) {
          const generatedPath = path.join(__dirname, '..', oldestItem.generatedImageUrl);
          await fs.unlink(generatedPath);
        }
      } catch (fileError) {
        console.warn('Error deleting oldest item image files:', fileError);
      }
      
      // Remove the oldest item from gallery
      gallery.splice(gallery.findIndex(item => item.id === oldestItem.id), 1);
    }

    gallery.push(newItem);
    await writeGallery(userId, gallery);

    res.json(newItem);
  } catch (error) {
    console.error('Error saving gallery item:', error);
    res.status(500).json({ error: 'Failed to save gallery item' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const gallery = await readGallery(userId);
    const itemIndex = gallery.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    const item = gallery[itemIndex];

    // Delete image files
    try {
      if (item.originalImageUrl) {
        const originalPath = path.join(__dirname, '..', item.originalImageUrl);
        await fs.unlink(originalPath);
      }
      if (item.generatedImageUrl) {
        const generatedPath = path.join(__dirname, '..', item.generatedImageUrl);
        await fs.unlink(generatedPath);
      }
    } catch (fileError) {
      console.warn('Error deleting image files:', fileError);
    }

    // Remove from gallery
    gallery.splice(itemIndex, 1);
    await writeGallery(userId, gallery);

    res.json({ message: 'Gallery item deleted', id });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

export default router;

