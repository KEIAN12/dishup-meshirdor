import React, { useState } from 'react';
import { PlanType, UserState } from '../types';
import { PLANS } from '../constants';
import { Settings, Menu, User, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { Gallery } from './Gallery';
import { SettingsModal } from './SettingsModal';

interface SidebarProps {
  userState: UserState;
  currentUser: { displayName: string | null; email: string | null; photoURL: string | null } | null;
  onPlanChange: (plan: PlanType) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userState, currentUser, onPlanChange, isOpen, onClose, onLogout }) => {
  const currentPlan = PLANS[userState.plan];
  const creditsRemaining = Math.max(0, currentPlan.limit - userState.creditsUsed);
  const [showGallery, setShowGallery] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50
        w-80 md:w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen md:h-auto md:max-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        font-sans
      `}>
        <div className="p-4 md:p-8 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
          <img 
            src="/logo-white.svg" 
            alt="メシドリAI" 
            className="h-12 w-[150px]"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
              <div className="bg-brand-yellow w-8 h-8 flex items-center justify-center rounded-sm hidden">
                <Menu className="w-5 h-5 text-slate-900" />
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-3 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-xs text-slate-400 pl-0 md:pl-10 font-medium">メシドリAI - 画像生成SaaS</p>
        </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-10">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            現在のステータス
          </h2>
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg">
            <div className="flex justify-between items-end mb-3">
              <span className="text-3xl font-black text-brand-yellow">{creditsRemaining}</span>
              <span className="text-sm font-bold text-slate-400">/ {currentPlan.limit} 枚</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full ${creditsRemaining === 0 ? 'bg-red-500' : 'bg-brand-yellow'}`} 
                style={{ width: `${Math.min(100, 100 - ((creditsRemaining / currentPlan.limit) * 100))}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 text-right">残りチケット</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            マイ・ギャラリー
          </h2>
          <button
            onClick={() => setShowGallery(true)}
            className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all border bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">保存済み画像を見る</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-500 mt-1">最大5枚まで保存可能</p>
          </button>
        </div>

      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          {currentUser?.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
              <User className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {currentUser?.displayName ? `${currentUser.displayName} 様` : currentUser?.email || 'ユーザー'}
            </p>
            <p className="text-xs text-slate-400 truncate font-medium">{currentPlan.name}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            title="設定"
          >
            <Settings className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userState={userState}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      )}

      {showGallery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-black text-slate-900">マイ・ギャラリー</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-6">
              <Gallery />
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};