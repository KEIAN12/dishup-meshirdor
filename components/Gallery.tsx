import React, { useState, useEffect } from 'react';
import { X, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { GalleryItem, GenerationMode } from '../types';
import { galleryService } from '../services/galleryService';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface GalleryProps {
  onClose?: () => void;
  onSelect?: (item: GalleryItem) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onClose, onSelect }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const galleryItems = await galleryService.getAll();
      // 最新の生成順（降順）でソート
      const sortedItems = [...galleryItems].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(sortedItems);
    } catch (err: any) {
      setError(err.message || '生成履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この画像を削除しますか？')) return;

    try {
      setDeleting(id);
      await galleryService.delete(id);
      setItems(items.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err: any) {
      alert(err.message || '削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  };

  const handleItemClick = (item: GalleryItem) => {
    if (onSelect) {
      onSelect(item);
      if (onClose) onClose();
    } else {
      setSelectedItem(item);
    }
  };

  if (selectedItem) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
            <h3 className="text-xl font-black text-slate-900">ギャラリー詳細</h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 min-h-[400px]">
                <BeforeAfterSlider
                  beforeImage={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${selectedItem.originalImageUrl}`}
                  afterImage={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${selectedItem.generatedImageUrl}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-bold text-slate-500 mb-1">スタイル</div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedItem.mode === GenerationMode.MENU ? 'メニュー用' : 'SNS用'}
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-xs font-bold text-slate-500 mb-1">用途</div>
                <div className="text-sm font-bold text-slate-900">
                  {selectedItem.aspectRatio === '4:3' ? 'メニュー表用' : 
                   selectedItem.aspectRatio === '1:1' ? 'インスタ投稿用' : 
                   'ストーリーズ用'}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => handleDelete(selectedItem.id)}
                disabled={deleting === selectedItem.id}
                className="flex-1 bg-red-50 text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting === selectedItem.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                削除
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onClose && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">生成履歴</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-bold">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">生成履歴はありません</p>
          <p className="text-slate-400 text-sm mt-2">生成した画像の履歴がここに表示されます</p>
        </div>
      ) : (
        <div className={items.length <= 5 ? "grid grid-cols-1 gap-4 max-w-md mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className={`${items.length <= 5 ? 'aspect-[4/3]' : 'aspect-square'} rounded-lg overflow-hidden border-2 border-slate-200 hover:border-slate-900 transition-colors bg-slate-100 max-w-md mx-auto`}>
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${item.generatedImageUrl}`}
                  alt="Gallery item"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                disabled={deleting === item.id}
                className="absolute top-2 right-2 p-3 bg-white/90 backdrop-blur-sm rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
              >
                {deleting === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-slate-900">
                {item.mode === GenerationMode.MENU ? 'メニュー' : 'SNS'} • {item.aspectRatio === '4:3' ? 'メニュー表' : item.aspectRatio === '1:1' ? 'インスタ' : 'ストーリーズ'}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="text-center text-xs text-slate-500 font-medium pt-2">
          直近 {items.length} 件の生成履歴
        </div>
      )}
    </div>
  );
};

