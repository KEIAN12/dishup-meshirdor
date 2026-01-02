import { GalleryItem } from '../types';
import { getIdToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const galleryService = {
  /**
   * ギャラリー一覧を取得
   */
  async getAll(): Promise<GalleryItem[]> {
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('認証が必要です。ログインしてください。');
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'サーバーエラーが発生しました' }));
        throw new Error(errorData.error || 'ギャラリーの取得に失敗しました');
      }
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching gallery:', error);
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        throw new Error('サーバーに接続できません。サーバーが起動しているか確認してください。');
      }
      throw error;
    }
  },

  /**
   * ギャラリーに画像を保存
   */
  async save(
    originalImageUrl: string,
    generatedImageUrl: string,
    mode: string,
    aspectRatio: string
  ): Promise<GalleryItem> {
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('認証が必要です。ログインしてください。');
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImageUrl,
          generatedImageUrl,
          mode,
          aspectRatio,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'サーバーエラーが発生しました' }));
        throw new Error(error.error || 'ギャラリーへの保存に失敗しました');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error saving to gallery:', error);
      throw error;
    }
  },

  /**
   * ギャラリーから画像を削除
   */
  async delete(id: string): Promise<void> {
    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('認証が必要です。ログインしてください。');
      }

      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete from gallery');
      }
    } catch (error) {
      console.error('Error deleting from gallery:', error);
      throw error;
    }
  },
};

