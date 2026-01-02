const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface UserResponse {
  userId: string;
  email: string;
  stripeCustomerId?: string;
  plan: string;
  creditsUsed: number;
  subscriptionId?: string;
  subscriptionPeriodEnd?: string; // ISO 8601形式の日時（UTC）
  createdAt: string;
  updatedAt: string;
}

// ユーザー情報を取得
export const getUserInfo = async (idToken: string): Promise<UserResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'ユーザー情報の取得に失敗しました');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

// ID Tokenを検証してユーザー情報を取得
export const verifyToken = async (idToken: string): Promise<UserResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'トークンの検証に失敗しました');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error verifying token:', error);
    throw error;
  }
};


