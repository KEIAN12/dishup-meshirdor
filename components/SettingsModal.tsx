import React, { useState, useEffect } from 'react';
import { X, Settings, CreditCard, LogOut, User, Calendar, Ticket, ExternalLink, Loader2, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { PlanType, UserState } from '../types';
import { PLANS } from '../constants';
import { createPortalSession, createCheckoutSession } from '../services/stripeService';
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
  const [showPlanSelection, setShowPlanSelection] = useState<boolean>(false);
  const [isChangingPlan, setIsChangingPlan] = useState<boolean>(false);

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

  const handlePlanChange = async (planType: PlanType) => {
    if (planType === userState.plan) {
      return; // 同じプランの場合は何もしない
    }

    if (planType === PlanType.FREE) {
      // 無料プランへの切り替えは直接可能（デバッグ用）
      alert('無料プランへの切り替えは、Stripe Customer Portalから行ってください。');
      return;
    }

    try {
      setIsChangingPlan(true);
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('認証が必要です。ログインしてください。');
      }

      const { url } = await createCheckoutSession(planType, idToken);
      window.location.href = url;
    } catch (error: any) {
      console.error('Error changing plan:', error);
      alert(error.message || 'プランの変更に失敗しました');
      setIsChangingPlan(false);
    }
  };

  if (!isOpen) return null;

  const currentPlan = PLANS[userState.plan];
  const creditsRemaining = Math.max(0, currentPlan.limit - userState.creditsUsed);
  const hasStripeCustomer = userInfo?.stripeCustomerId && userState.plan !== PlanType.FREE;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border-4 border-slate-900">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {showPlanSelection && (
              <button
                onClick={() => setShowPlanSelection(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
            )}
            <Settings className="w-6 h-6 text-brand-yellow" />
            <h2 className="text-2xl font-black text-slate-900">
              {showPlanSelection ? 'プラン切り替え' : '設定'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {showPlanSelection ? (
            /* プラン切り替え画面 */
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">プランを選択してください</h3>
                <p className="text-slate-600">現在のプラン: <span className="font-bold text-brand-yellow">{currentPlan.name}</span></p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(PlanType).map((plan) => {
                  const planConfig = PLANS[plan];
                  const isSelected = userState.plan === plan;
                  const isChanging = isChangingPlan;
                  
                  return (
                    <div
                      key={plan}
                      className={`relative rounded-2xl p-6 border-4 transition-all ${
                        isSelected
                          ? 'border-brand-yellow bg-brand-yellow/10 shadow-lg scale-105'
                          : 'border-slate-300 bg-white hover:border-slate-500 hover:shadow-md'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-3 -right-3 bg-brand-yellow text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                          現在のプラン
                        </div>
                      )}
                      {planConfig.badge && (
                        <div className="absolute -top-3 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-full">
                          {planConfig.badge}
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-xl font-black text-slate-900 mb-1">{planConfig.name}</h4>
                        <p className="text-3xl font-black text-slate-900 mb-2">{planConfig.price}</p>
                        <p className="text-sm text-slate-600 font-medium">{planConfig.description}</p>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {planConfig.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-brand-yellow mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handlePlanChange(plan)}
                        disabled={isSelected || isChanging}
                        className={`w-full py-4 px-6 rounded-lg font-bold text-base transition-all ${
                          isSelected
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isChanging ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                            処理中...
                          </>
                        ) : isSelected ? (
                          '現在のプラン'
                        ) : (
                          'このプランに変更'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* 利用状況 */}
              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Ticket className="w-6 h-6 text-brand-yellow" />
                  利用状況
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-2">現在のプラン</p>
                      <p className="text-2xl font-black text-slate-900">{currentPlan.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-2">月間上限</p>
                      <p className="text-2xl font-black text-slate-900">{currentPlan.limit}枚</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-2">使用済み</p>
                      <p className="text-2xl font-black text-slate-900">{userState.creditsUsed}枚</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-2">残り</p>
                      <p className="text-2xl font-black text-brand-yellow">{creditsRemaining}枚</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* プラン切り替えボタン */}
              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-brand-yellow" />
                  プラン管理
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                  <p className="text-base text-slate-600 font-medium mb-4">
                    プランを変更する場合は、以下のボタンから選択してください。
                  </p>
                  <button
                    onClick={() => setShowPlanSelection(true)}
                    className="w-full bg-brand-yellow text-slate-900 font-black py-4 px-8 rounded-lg hover:bg-yellow-400 transition-colors text-lg flex items-center justify-center gap-3"
                  >
                    <Zap className="w-5 h-5" />
                    プランを切り替える
                  </button>
                </div>
              </section>

              {/* サブスクリプション管理 */}
              {hasStripeCustomer && (
                <section>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-brand-yellow" />
                    サブスクリプション管理
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <p className="text-base text-slate-600 font-medium mb-4">
                      Stripe Customer Portalで、プランの変更、解約、支払い方法の変更ができます。
                    </p>
                    <button
                      onClick={handleOpenPortal}
                      disabled={isOpeningPortal}
                      className="w-full bg-slate-900 text-white font-bold py-4 px-8 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                    >
                      {isOpeningPortal ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          開いています...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5" />
                          サブスクリプションを管理
                        </>
                      )}
                    </button>
                  </div>
                </section>
              )}

              {/* アカウント情報 */}
              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-brand-yellow" />
                  アカウント情報
                </h3>
                <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-slate-500">メールアドレス</p>
                    <p className="text-base font-bold text-slate-900">{currentUser?.email || '未設定'}</p>
                  </div>
                  {userInfo && (
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-500 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        登録日
                      </p>
                      <p className="text-base font-bold text-slate-900">
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
                  className="w-full bg-red-50 text-red-600 font-bold py-4 px-8 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-3 text-lg"
                >
                  <LogOut className="w-5 h-5" />
                  ログアウト
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

