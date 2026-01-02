import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import * as githubService from '../services/githubService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const STORAGE_FILE = path.join(__dirname, '../storage/gallery.json');
const UPLOAD_DIR = path.join(__dirname, '../storage/uploads/gallery');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

// Initialize storage file if it doesn't exist
async function initStorage() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(STORAGE_FILE, JSON.stringify([]), 'utf-8');
  }
}

// Read gallery data
async function readGallery() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write gallery data
async function writeGallery(data) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
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
ensureDirectories().then(() => initStorage());

// GET /api/gallery - Get all gallery items
router.get('/', async (req, res) => {
  try {
    // まずローカルから読み込み
    let gallery = await readGallery();
    
    // GitHub連携が有効な場合は、GitHubからも取得を試みる
    if (githubService.isGitHubEnabled()) {
      try {
        const gistId = await githubService.getGistId();
        if (gistId) {
          const githubGallery = await githubService.getGist(gistId);
          // GitHubのデータが新しい場合はマージ（GitHubを優先）
          if (githubGallery && githubGallery.length > 0) {
            // 最新のデータを優先（GitHubのデータを使用）
            gallery = githubGallery;
            // ローカルにも保存（同期）
            await writeGallery(gallery);
          }
        }
      } catch (githubError) {
        console.warn('Failed to sync from GitHub, using local data:', githubError.message);
        // GitHubエラーは無視してローカルデータを使用
      }
    }
    
    res.json(gallery);
  } catch (error) {
    console.error('Error reading gallery:', error);
    res.status(500).json({ error: 'Failed to read gallery' });
  }
});

// POST /api/gallery - Save new gallery item
router.post('/', async (req, res) => {
  try {
    const { originalImageUrl, generatedImageUrl, mode, aspectRatio } = req.body;

    if (!originalImageUrl || !generatedImageUrl || !mode || !aspectRatio) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const gallery = await readGallery();

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
    await writeGallery(gallery);

    // GitHub連携が有効な場合は、GitHubにも保存
    if (githubService.isGitHubEnabled()) {
      try {
        let gistId = await githubService.getGistId();
        
        if (gistId) {
          // 既存のGistを更新
          await githubService.updateGist(gistId, gallery);
        } else {
          // 新しいGistを作成
          gistId = await githubService.createGist(gallery);
          await githubService.saveGistId(gistId);
        }
        
        console.log('Gallery saved to GitHub Gist:', gistId);
      } catch (githubError) {
        console.warn('Failed to save to GitHub, but local save succeeded:', githubError.message);
        // GitHubエラーは無視（ローカル保存は成功している）
      }
    }

    res.json(newItem);
  } catch (error) {
    console.error('Error saving gallery item:', error);
    res.status(500).json({ error: 'Failed to save gallery item' });
  }
});

// DELETE /api/gallery/:id - Delete gallery item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await readGallery();
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
    await writeGallery(gallery);

    // GitHub連携が有効な場合は、GitHubからも削除
    if (githubService.isGitHubEnabled()) {
      try {
        const gistId = await githubService.getGistId();
        if (gistId) {
          await githubService.updateGist(gistId, gallery);
        }
      } catch (githubError) {
        console.warn('Failed to delete from GitHub, but local delete succeeded:', githubError.message);
        // GitHubエラーは無視（ローカル削除は成功している）
      }
    }

    res.json({ message: 'Gallery item deleted', id });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

export default router;

