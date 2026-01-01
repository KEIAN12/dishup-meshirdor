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
    return admin.apps.length > 0 ? admin : null;
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
      initialized = true;
      console.log('Firebase Admin SDK initialized');
      return admin;
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
        initialized = true;
        console.log('Firebase Admin SDK initialized');
        return admin;
      } else {
        // プロジェクトIDのみで初期化（開発環境用）
        const projectId = process.env.FIREBASE_PROJECT_ID;
        if (projectId) {
          admin.initializeApp({
            projectId: projectId,
          });
          initialized = true;
          console.log('Firebase Admin SDK initialized (project ID only)');
          return admin;
        } else {
          // 環境変数が設定されていない場合は警告のみ出してスキップ
          console.warn('⚠️  Firebase Admin SDK: 環境変数が設定されていません。認証機能は使用できません。');
          console.warn('⚠️  環境変数 FIREBASE_PROJECT_ID または FIREBASE_SERVICE_ACCOUNT_KEY を設定してください。');
          initialized = true; // 初期化済みとしてマーク（エラーを防ぐため）
          return null; // nullを返す
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.warn('⚠️  Firebase Admin SDKの初期化に失敗しましたが、サーバーは起動を続けます。');
    initialized = true; // 初期化済みとしてマーク（エラーを防ぐため）
    return null;
  }
}

// ID Tokenを検証
export async function verifyIdToken(idToken) {
  try {
    const adminInstance = initializeFirebaseAdmin();
    if (!adminInstance) {
      throw new Error('Firebase Admin SDKが初期化されていません。環境変数を設定してください。');
    }
    const decodedToken = await adminInstance.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw error;
  }
}

// 起動時の自動初期化をスキップ（環境変数がない場合でもサーバーを起動できるように）
// export default initializeFirebaseAdmin();


