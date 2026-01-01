import { AssetItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const assetService = {
  /**
   * アセット一覧を取得
   */
  async getAll(): Promise<AssetItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  /**
   * アセットを保存
   */
  async save(
    name: string,
    imageUrl: string,
    type: 'store' | 'table'
  ): Promise<AssetItem> {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          imageUrl,
          type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save asset');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error saving asset:', error);
      throw error;
    }
  },

  /**
   * アセットを削除
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },
};




