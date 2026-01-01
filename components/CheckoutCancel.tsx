import React from 'react';
import { XCircle } from 'lucide-react';

interface CheckoutCancelProps {
  onNavigate?: (view: 'landing' | 'dashboard') => void;
}

export const CheckoutCancel: React.FC<CheckoutCancelProps> = ({ onNavigate }) => {
  const handleGoToLanding = () => {
    if (onNavigate) {
      onNavigate('landing');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <XCircle className="w-16 h-16 text-slate-400" />
          <h2 className="text-3xl font-black text-slate-900">決済がキャンセルされました</h2>
          <p className="text-slate-600">
            決済は完了していません。いつでも再度お試しいただけます。
          </p>
          <button
            onClick={handleGoToLanding}
            className="mt-6 bg-slate-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-800 transition-all"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    </div>
  );
};


