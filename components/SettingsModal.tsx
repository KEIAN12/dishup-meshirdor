import React, { useState, useEffect } from 'react';
import { X, Settings, CreditCard, LogOut, User, Calendar, Ticket, ExternalLink, Loader2 } from 'lucide-react';
import { PlanType, UserState } from '../types';
import { PLANS } from '../constants';
import { createPortalSession } from '../services/stripeService';
import { logout } from '../services/authService';
import { getIdToken } from '../services/authService';
import { getUserInfo, UserResponse } from '../services/userService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
  currentUser: { displayName: string | null; email: string | null; photoURL: string | null } | null;
  onLogout?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  userState,
  currentUser,
  onLogout 
}) => {
  const [userInfo, setUserInfo] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadUserInfo();
    }
  }, [isOpen]);

  const loadUserInfo = async () => {
    try {
      setIsLoading(true);
      const idToken = await getIdToken();
      if (idToken) {
        const info = await getUserInfo(idToken);
        setUserInfo(info);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setIsOpeningPortal(true);
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('認証が必要です。ログインしてください。');
      }

      const { url } = await createPortalSession(idToken);
      window.location.href = url;
    } catch (error: any) {
      console.error('Error opening portal:', error);
      alert(error.message || 'ポータルの開封に失敗しました');
      setIsOpeningPortal(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return;

    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
      onClose();
    } catch (error: any) {
      console.error('Error logging out:', error);
      alert(error.message || 'ログアウトに失敗しました');
    }
  };

  if (!isOpen) return null;

  const currentPlan = PLANS[userState.plan];
  const creditsRemaining = Math.max(0, currentPlan.limit - userState.creditsUsed);
  const hasStripeCustomer = userInfo?.stripeCustomerId && userState.plan !== PlanType.FREE;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-slate-900">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-brand-yellow" />
            <h2 className="text-xl font-black text-slate-900">設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 利用状況 */}
          <section>
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-brand-yellow" />
              利用状況
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">現在のプラン</p>
                  <p className="text-lg font-black text-slate-900">{currentPlan.name}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">月間上限</p>
                  <p className="text-lg font-black text-slate-900">{currentPlan.limit}枚</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">使用済み</p>
                  <p className="text-lg font-black text-slate-900">{userState.creditsUsed}枚</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">残り</p>
                  <p className="text-lg font-black text-brand-yellow">{creditsRemaining}枚</p>
                </div>
              </div>
            </div>
          </section>

          {/* サブスクリプション管理 */}
          {hasStripeCustomer && (
            <section>
              <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-yellow" />
                サブスクリプション管理
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                <p className="text-sm text-slate-600 font-medium mb-4">
                  Stripe Customer Portalで、プランの変更、解約、支払い方法の変更ができます。
                </p>
                <button
                  onClick={handleOpenPortal}
                  disabled={isOpeningPortal}
                  className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isOpeningPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      開いています...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      サブスクリプションを管理
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* アカウント情報 */}
          <section>
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-yellow" />
              アカウント情報
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">メールアドレス</p>
                <p className="text-sm font-bold text-slate-900">{currentUser?.email || '未設定'}</p>
              </div>
              {userInfo && (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    登録日
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(userInfo.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ログアウト */}
          <section>
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 font-bold py-3 px-6 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              ログアウト
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

