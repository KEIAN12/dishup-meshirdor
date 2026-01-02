import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyIdToken } from '../services/firebaseAdmin.js';

// PlanType定数（TypeScriptから移植）
const PlanType = {
  FREE: 'お試し',
  LIGHT: 'ライト',
  STANDARD: 'スタンダード',
  PRO: 'プロ',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const STORAGE_FILE = path.join(__dirname, '../storage/users.json');

// ストレージディレクトリの確保
async function ensureDirectories() {
  await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
}

// ストレージファイルの初期化
async function initStorage() {
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(STORAGE_FILE, JSON.stringify([]), 'utf-8');
  }
}

// ユーザーデータの読み込み
async function readUsers() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ユーザーデータの書き込み
async function writeUsers(users) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// ユーザーを取得または作成
async function getOrCreateUser(decodedToken) {
  const users = await readUsers();
  const userId = decodedToken.uid;
  const email = decodedToken.email;
  
  let user = users.find(u => u.userId === userId);
  
  if (!user) {
    // 新規ユーザーを作成
    user = {
      userId: userId,
      email: email || '',
      stripeCustomerId: null,
      plan: PlanType.FREE,
      creditsUsed: 0,
      subscriptionId: null,
      subscriptionPeriodEnd: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(user);
    await writeUsers(users);
  } else {
    // 既存ユーザーの情報を更新（メールアドレスなど）
    user.email = email || user.email;
    
    
    // サブスクリプションの有効期限をチェック
    if (user.subscriptionPeriodEnd) {
      const periodEnd = new Date(user.subscriptionPeriodEnd);
      const now = new Date();
      
      // 有効期限が過ぎている場合はFREEプランに戻す
      if (periodEnd < now && user.plan !== PlanType.FREE) {
        user.plan = PlanType.FREE;
        user.subscriptionId = null;
        user.subscriptionPeriodEnd = null;
        console.log(`User ${userId} subscription expired, switching to FREE plan`);
      }
    } else if (user.plan !== PlanType.FREE && !user.subscriptionId) {
      // 有料プランなのにsubscriptionPeriodEndがnullでsubscriptionIdもnullの場合
      // これは異常な状態なので、FREEプランに戻す
      user.plan = PlanType.FREE;
      console.log(`User ${userId} has paid plan without subscription, switching to FREE plan`);
    }
    
    user.updatedAt = new Date().toISOString();
    await writeUsers(users);
  }
  
  return user;
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

// 初期化
ensureDirectories().then(() => initStorage());

// POST /api/auth/verify - ID Tokenを検証してユーザー情報を取得/作成
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'ID Tokenが必要です' });
    }
    
    const decodedToken = await verifyIdToken(idToken);
    const user = await getOrCreateUser(decodedToken);
    
    res.json(user);
  } catch (error) {
    console.error('Error in /verify:', error);
    res.status(500).json({ error: error.message || 'トークンの検証に失敗しました' });
  }
});

// GET /api/auth/user - 現在のユーザー情報を取得
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const decodedToken = req.user;
    const user = await getOrCreateUser(decodedToken);
    
    res.json(user);
  } catch (error) {
    console.error('Error in /user:', error);
    res.status(500).json({ error: error.message || 'ユーザー情報の取得に失敗しました' });
  }
});

// POST /api/auth/logout - ログアウト（フロントエンドで処理）
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // サーバー側での特別な処理は不要（Firebase Authが管理）
    res.json({ message: 'ログアウトしました' });
  } catch (error) {
    console.error('Error in /logout:', error);
    res.status(500).json({ error: error.message || 'ログアウトに失敗しました' });
  }
});

export default router;

