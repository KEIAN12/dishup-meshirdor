import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { verifyToken } from '../services/userService';
import { getIdToken } from '../services/authService';

interface CheckoutSuccessProps {
  onNavigate?: (view: 'dashboard') => void;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ onNavigate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URLパラメータからsession_idを取得
  const getSessionId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('session_id');
  };
  
  const sessionId = getSessionId();

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (!sessionId) {
          setError('セッションIDが見つかりません');
          setIsLoading(false);
          return;
        }

        // ID Tokenを取得してユーザー情報を更新
        const idToken = await getIdToken();
        if (idToken) {
          await verifyToken(idToken);
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Error verifying session:', err);
        setError(err.message || 'セッションの確認に失敗しました');
        setIsLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const handleGoToDashboard = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
            <p className="text-slate-600 font-medium">決済を確認中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h2 className="text-2xl font-black text-slate-900">エラーが発生しました</h2>
            <p className="text-slate-600 text-center">{error}</p>
            <button
              onClick={handleGoToDashboard}
              className="mt-4 bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-all"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h2 className="text-3xl font-black text-slate-900">決済が完了しました！</h2>
          <p className="text-slate-600">
            ご登録ありがとうございます。プランが有効化されました。
          </p>
          <button
            onClick={handleGoToDashboard}
            className="mt-6 bg-brand-yellow text-slate-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-all shadow-md"
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
    </div>
  );
};

