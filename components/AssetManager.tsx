import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Trash2, Store, Table, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { AssetItem } from '../types';
import { assetService } from '../services/assetService';

interface AssetManagerProps {
  selectedAssetId?: string | null;
  onAssetSelect?: (asset: AssetItem | null) => void;
  onClose?: () => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ 
  selectedAssetId,
  onAssetSelect,
  onClose 
}) => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<'store' | 'table'>('store');
  const [uploadName, setUploadName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const assetItems = await assetService.getAll();
      setAssets(assetItems);
    } catch (err: any) {
      setError(err.message || '写真の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      // ファイルをbase64に変換
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const name = uploadName || (uploadType === 'store' ? '店舗写真' : 'テーブル写真');
        
        const newAsset = await assetService.save(name, base64Data, uploadType);
        setAssets([...assets, newAsset]);
        setShowUpload(false);
        setUploadName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setError('画像の読み込みに失敗しました');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || '写真のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この写真を削除しますか？')) return;

    try {
      setDeleting(id);
      await assetService.delete(id);
      setAssets(assets.filter(item => item.id !== id));
      if (selectedAssetId === id && onAssetSelect) {
        onAssetSelect(null);
      }
    } catch (err: any) {
      alert(err.message || '削除に失敗しました');
    } finally {
      setDeleting(null);
    }
  };

  const handleAssetClick = (asset: AssetItem) => {
    if (onAssetSelect) {
      onAssetSelect(asset);
    }
  };

  return (
    <div className="space-y-4">
      {onClose && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900">店舗の雰囲気を管理</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      )}

      {/* Upload Section */}
      {!showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-900 hover:bg-slate-50 transition-all"
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-900 font-bold">店舗の雰囲気を追加</p>
          <p className="text-xs text-slate-500 mt-1">店舗やテーブルの写真をアップロード</p>
        </button>
      ) : (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900">店舗の雰囲気を追加</h4>
            <button
              onClick={() => {
                setShowUpload(false);
                setUploadName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1 hover:bg-slate-200 rounded"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">種類</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUploadType('store')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    uploadType === 'store'
                      ? 'border-slate-900 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Store className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  <div className="text-xs font-bold text-slate-900">店舗写真</div>
                </button>
                <button
                  onClick={() => setUploadType('table')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    uploadType === 'table'
                      ? 'border-slate-900 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <Table className="w-5 h-5 mx-auto mb-1 text-slate-600" />
                  <div className="text-xs font-bold text-slate-900">テーブル写真</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">名前（任意）</label>
              <input
                type="text"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder={uploadType === 'store' ? '例: 本店の外観' : '例: メインカウンター'}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">画像を選択</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-slate-300 rounded-lg p-4 text-center hover:border-slate-900 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-bold text-slate-900">画像を選択</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assets List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-bold">
          {error}
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-bold">写真がありません</p>
          <p className="text-slate-400 text-sm mt-2">店舗写真やテーブル写真をアップロードしてください</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
            保存済み写真 ({assets.length})
          </h4>
          <div className="space-y-2">
            {assets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const Icon = asset.type === 'store' ? Store : Table;
              
              return (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={`http://localhost:3001${asset.imageUrl}`}
                        alt={asset.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span className="font-bold text-slate-900 truncate">{asset.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-yellow" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {asset.type === 'store' ? '店舗の雰囲気' : 'テーブルの雰囲気'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(asset.id);
                      }}
                      disabled={deleting === asset.id}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {deleting === asset.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

