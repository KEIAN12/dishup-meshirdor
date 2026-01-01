import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Admin SDKの初期化
let initialized = false;

export function initializeFirebaseAdmin() {
  if (initialized) {
    return admin;
  }

  try {
    // 環境変数からサービスアカウントキーを取得
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey) {
      // JSON文字列として提供されている場合
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // ファイルパスとして提供されている場合
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
        path.join(__dirname, '../config/firebase-service-account.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8')
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // プロジェクトIDのみで初期化（開発環境用）
        const projectId = process.env.FIREBASE_PROJECT_ID;
        if (projectId) {
          admin.initializeApp({
            projectId: projectId,
          });
        } else {
          throw new Error('Firebase Admin SDKの初期化に失敗しました。環境変数を確認してください。');
        }
      }
    }
    
    initialized = true;
    console.log('Firebase Admin SDK initialized');
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

// ID Tokenを検証
export async function verifyIdToken(idToken) {
  try {
    const admin = initializeFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

export default initializeFirebaseAdmin();


