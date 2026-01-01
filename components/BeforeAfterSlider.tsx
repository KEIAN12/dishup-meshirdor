import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  onShare?: () => void;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
  beforeImage, 
  afterImage,
  onShare 
}) => {
  const [showAfter, setShowAfter] = useState(true);

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // デフォルトのシェア機能
      if (navigator.share) {
        navigator.share({
          title: 'メシドリAIで生成した料理写真',
          text: 'AIで生成したプロ品質の料理写真をチェック！',
          url: window.location.href
        }).catch(console.error);
      } else {
        // フォールバック: クリップボードにコピー
        navigator.clipboard.writeText(window.location.href);
        alert('リンクをクリップボードにコピーしました！');
      }
    }
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-100 border-2 border-slate-200">
      {/* Image Container */}
      <div className="relative w-full h-full">
        <img 
          src={showAfter ? afterImage : beforeImage} 
          alt={showAfter ? "生成後" : "生成前"} 
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
          style={{ opacity: 1 }}
        />
      </div>

      {/* Label Badge */}
      <div className={`absolute top-4 left-4 font-black px-3 py-1.5 rounded border-2 border-slate-900 z-10 text-xs md:text-sm shadow-sm transition-all ${
        showAfter ? 'bg-brand-yellow text-slate-900' : 'bg-slate-900 text-white'
      }`}>
        {showAfter ? 'AFTER' : 'BEFORE'}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setShowAfter(!showAfter)}
        className="absolute bottom-6 right-6 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-3 rounded-lg font-bold text-sm hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all flex items-center gap-2 z-20"
      >
        {showAfter ? (
          <>
            <ArrowLeft className="w-4 h-4" />
            元の写真を見る
          </>
        ) : (
          <>
            生成結果を見る
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Share Button */}
      {showAfter && onShare && (
        <button
          onClick={handleShare}
          className="absolute bottom-6 left-6 bg-brand-yellow border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-3 rounded-lg font-bold text-sm hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 transition-all flex items-center gap-2 z-20"
        >
          <Share2 className="w-4 h-4" />
          SNSでシェア
        </button>
      )}
    </div>
  );
};





