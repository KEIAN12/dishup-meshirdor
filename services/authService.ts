import { 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  onAuthStateChanged,
  IdTokenResult
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Googleログイン
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Googleログインに失敗しました');
  }
};

// ログアウト
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error(error.message || 'ログアウトに失敗しました');
  }
};

// ID Tokenを取得
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// 認証状態の監視
export const onAuthStateChange = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });
    } else {
      callback(null);
    }
  });
};

// 現在のユーザーを取得
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};


