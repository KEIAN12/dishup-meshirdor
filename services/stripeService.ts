const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Checkout Sessionを作成
export const createCheckoutSession = async (
  planType: string,
  idToken: string
): Promise<CheckoutSessionResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Checkout Sessionの作成に失敗しました');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// 顧客ポータルセッションを作成
export const createPortalSession = async (
  idToken: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'ポータルセッションの作成に失敗しました');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};


