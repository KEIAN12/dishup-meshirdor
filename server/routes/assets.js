import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const STORAGE_FILE = path.join(__dirname, '../storage/assets.json');
const UPLOAD_DIR = path.join(__dirname, '../uploads/assets');

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

// Read assets data
async function readAssets() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write assets data
async function writeAssets(data) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Save base64 image to file
async function saveImage(base64Data, filename) {
  const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Content, 'base64');
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/assets/${filename}`;
}

// Initialize on startup
ensureDirectories().then(() => initStorage());

// GET /api/assets - Get all assets
router.get('/', async (req, res) => {
  try {
    const assets = await readAssets();
    res.json(assets);
  } catch (error) {
    console.error('Error reading assets:', error);
    res.status(500).json({ error: 'Failed to read assets' });
  }
});

// POST /api/assets - Save new asset
router.post('/', async (req, res) => {
  try {
    const { name, imageUrl, type } = req.body;

    if (!name || !imageUrl || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (type !== 'store' && type !== 'table') {
      return res.status(400).json({ error: 'Invalid type. Must be "store" or "table"' });
    }

    const assets = await readAssets();

    // Save image
    const filename = `${type}_${Date.now()}.png`;
    const imagePath = await saveImage(imageUrl, filename);

    // Create new item
    const newItem = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      imageUrl: imagePath,
      type,
      createdAt: new Date().toISOString()
    };

    assets.push(newItem);
    await writeAssets(assets);

    res.json(newItem);
  } catch (error) {
    console.error('Error saving asset:', error);
    res.status(500).json({ error: 'Failed to save asset' });
  }
});

// DELETE /api/assets/:id - Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assets = await readAssets();
    const itemIndex = assets.findIndex(item => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const item = assets[itemIndex];

    // Delete image file
    try {
      if (item.imageUrl) {
        const imagePath = path.join(__dirname, '..', item.imageUrl);
        await fs.unlink(imagePath);
      }
    } catch (fileError) {
      console.warn('Error deleting image file:', fileError);
    }

    // Remove from assets
    assets.splice(itemIndex, 1);
    await writeAssets(assets);

    res.json({ message: 'Asset deleted', id });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

export default router;





