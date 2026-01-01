import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase設定（環境変数から読み込む）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Authentication初期化
export const auth = getAuth(app);

// Google認証プロバイダー
export const googleProvider = new GoogleAuthProvider();

export default app;


