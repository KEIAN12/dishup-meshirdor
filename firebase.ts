import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase設定（環境変数から読み込む）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy-api-key-for-local-dev',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// デバッグ用：環境変数が正しく読み込まれているか確認（常に表示）
const hasValidConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                       import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                       import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                       import.meta.env.VITE_FIREBASE_APP_ID;

if (!hasValidConfig) {
  console.warn('⚠️ Firebase環境変数が設定されていません。ローカル開発の場合は.env.localファイルを作成してください。');
  console.warn('⚠️ 本番環境では、Render Dashboardで環境変数を設定し、再デプロイしてください。');
  console.warn('⚠️ ダミー設定で初期化しています。Firebase機能は使用できません。');
} else {
  console.log('Firebase Config Check:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
    authDomain: firebaseConfig.authDomain || 'MISSING',
    projectId: firebaseConfig.projectId || 'MISSING',
    appId: firebaseConfig.appId || 'MISSING',
  });
}

// Firebase初期化（ダミー設定でも初期化できるようにする）
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase初期化エラー:', error);
  // エラーが発生してもアプリは動作を続ける（Firebase機能は使用不可）
  app = initializeApp({
    apiKey: 'dummy-api-key',
    authDomain: 'dummy.firebaseapp.com',
    projectId: 'dummy-project',
    appId: '1:123456789:web:dummy',
  });
}

// Authentication初期化
export const auth = getAuth(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();

export default app;


