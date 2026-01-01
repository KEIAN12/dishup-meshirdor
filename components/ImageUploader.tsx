import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  selectedImage: File | null;
  onImageSelect: (file: File | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ selectedImage, onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  };

  if (selectedImage) {
    return (
      <div className="relative group rounded-xl overflow-hidden border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white transition-transform">
        <div className="aspect-[4/3] w-full relative bg-slate-100 flex items-center justify-center overflow-hidden">
             <img 
               src={URL.createObjectURL(selectedImage)} 
               alt="Original" 
               className="w-full h-full object-cover"
             />
        </div>
        <button
          onClick={() => {
            onImageSelect(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="absolute top-3 right-3 bg-slate-900 text-white p-2 rounded-full shadow-lg hover:bg-red-500 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-3 left-3 bg-brand-yellow text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          オリジナル画像
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-900 hover:bg-yellow-50/50 transition-all h-72 bg-slate-50 group"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="bg-white p-4 rounded-full shadow-md mb-6 group-hover:scale-110 transition-transform border border-slate-100">
        <Upload className="w-8 h-8 text-slate-900" />
      </div>
      <p className="text-slate-900 font-bold text-lg mb-2">画像をアップロード</p>
      <p className="text-slate-500 text-sm font-medium">または ドラッグ＆ドロップ</p>
      <p className="text-slate-400 text-xs mt-4 bg-slate-100 px-3 py-1 rounded-full">JPG, PNG (最大 10MB)</p>
    </div>
  );
};