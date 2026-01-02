import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Google Apps ScriptのWebアプリURL（環境変数から取得、または直接指定）
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || '';
      
      if (!scriptUrl) {
        alert('Google Apps ScriptのURLが設定されていません。\n\nスプレッドシートに記録するには、.env.localファイルに以下を追加してください：\nVITE_GOOGLE_SCRIPT_URL=あなたのGoogle Apps ScriptのURL\n\n設定後、開発サーバーを再起動してください。\n\n現在は送信できませんが、フォームは正常に動作しています。');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors', // CORSを回避（Google Apps Scriptは自動的にCORSを処理）
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback,
          email: email || '未入力',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });

      // no-corsモードではレスポンスを読めないため、常に成功とみなす
      // 実際の送信は成功しているはず（Google Apps Scriptが正常に動作していれば）
      setIsSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setEmail('');
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      // より詳細なエラーメッセージを表示
      const errorMessage = error.message || '送信に失敗しました';
      alert(`送信エラー: ${errorMessage}\n\n考えられる原因:\n1. Google Apps ScriptのURLが正しく設定されていない\n2. スプレッドシートへのアクセス権限がない\n3. ネットワークエラー\n\nブラウザのコンソール（F12）で詳細なエラーを確認してください。`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border-4 border-slate-900">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-brand-yellow" />
            <h2 className="text-xl font-black text-slate-900">意見・要望を送る</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-slate-900" />
              </div>
              <p className="text-lg font-bold text-slate-900 mb-2">送信完了しました！</p>
              <p className="text-sm text-slate-600">ご意見ありがとうございます。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
                  メールアドレス（任意）
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none transition-colors bg-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-bold text-slate-900 mb-2">
                  意見・要望 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none transition-colors resize-none bg-white"
                  placeholder="ご意見・ご要望をお聞かせください..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="flex-1 px-6 py-3 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      送信する
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

