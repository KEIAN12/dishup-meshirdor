
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ImageUploader } from './ImageUploader';
import { PlanType, GenerationMode, UserState, AspectRatio } from '../types';
import { PLANS, STRIPE_LINK } from '../constants';
import { generateFoodImage, generateFoodImageRetake } from '../services/geminiService';
import { galleryService } from '../services/galleryService';
import { Camera, Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2, Download, X, Menu, FileText, Square, Smartphone, Store, Table, MessageSquare } from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { AssetManager } from './AssetManager';
import { AssetItem } from '../types';
import { FeedbackModal } from './FeedbackModal';
import { onAuthStateChange, getCurrentUser, getIdToken } from '../services/authService';
import { getUserInfo } from '../services/userService';

interface DashboardProps {
  onNavigate?: (view: 'privacy' | 'terms' | 'commerce') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<{ displayName: string | null; email: string | null; photoURL: string | null } | null>(null);
  
  // App State
  const [userState, setUserState] = useState<UserState>({
    plan: PlanType.FREE,
    creditsUsed: 0
  });
  
  // 認証状態の監視とユーザー情報の取得
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        try {
          const idToken = await getIdToken();
          if (idToken) {
            const userInfo = await getUserInfo(idToken);
            setUserState({
              plan: userInfo.plan as PlanType,
              creditsUsed: userInfo.creditsUsed,
            });
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsLoadingUser(false);
        setCurrentUser(null);
        // 未認証の場合はランディングページにリダイレクト
        if (onNavigate) {
          // ランディングページに戻す処理はApp.tsxで管理
        }
      }
    });
    
    return () => unsubscribe();
  }, [onNavigate]);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.MENU);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.FOUR_THREE);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);
  const [showAssetManager, setShowAssetManager] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [retakePrompt, setRetakePrompt] = useState<string>('');
  const [isRetaking, setIsRetaking] = useState<boolean>(false);
  const [foodDescription, setFoodDescription] = useState<string>('');

  const currentPlan = PLANS[userState.plan];
  const creditsRemaining = Math.max(0, currentPlan.limit - userState.creditsUsed);

  // Helper function to convert image URL to base64
  const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
    // If it's already a base64 data URL, return as is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's a blob URL or regular URL, fetch and convert
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('画像の変換に失敗しました');
    }
  };

  // Check API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      try {
        // 環境変数からAPIキーをチェック（Viteのprocess.env経由）
        const envApiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                         (window as any).process?.env?.GEMINI_API_KEY || 
                         (window as any).process?.env?.API_KEY;
        
        if (envApiKey && envApiKey.trim() !== '') {
          setHasApiKey(true);
          setIsCheckingKey(false);
          return;
        }

        // Google AI Studioのaistudioオブジェクトをチェック（フォールバック）
        const aistudio = (window as any).aistudio;
        if (aistudio && await aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        } else {
          // どちらもない場合は、とりあえずダッシュボードを表示（APIキーは後で設定可能）
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
        // エラーが発生しても、ダッシュボードを表示
        setHasApiKey(true);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelection = async () => {
    try {
      // Google AI Studioのaistudioオブジェクトをチェック
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      } else {
        // aistudioが存在しない場合は、環境変数の設定を促す
        setError("APIキーを環境変数（VITE_GEMINI_API_KEY）に設定するか、.env.localファイルに追加してください。");
      }
    } catch (e) {
      console.error("Error selecting API key:", e);
      setError("APIキーの選択に失敗しました。環境変数（VITE_GEMINI_API_KEY）を設定してください。");
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    if (creditsRemaining <= 0) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const result = await generateFoodImage(selectedImage, mode, aspectRatio, selectedAsset, foodDescription);
      setGeneratedImageUrl(result);
      setUserState(prev => ({ ...prev, creditsUsed: prev.creditsUsed + 1 }));

      // 自動保存: ギャラリーに保存
      if (originalImageUrl) {
        try {
          // Convert originalImageUrl to base64 if needed
          const originalBase64 = await imageUrlToBase64(originalImageUrl);
          await galleryService.save(originalBase64, result, mode, aspectRatio);
        } catch (saveError: any) {
          // ギャラリー保存エラーは警告のみ（生成は成功している）
          console.warn('Failed to save to gallery:', saveError);
          // 5枚制限の場合はユーザーに通知
          if (saveError.message && saveError.message.includes('上限')) {
            setError(saveError.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "画像の生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetake = async () => {
    if (!generatedImageUrl) return;
    if (creditsRemaining <= 0) {
      setError("クレジットが不足しています。");
      return;
    }
    if (!retakePrompt.trim()) {
      setError("調整指示を入力してください。");
      return;
    }

    setIsRetaking(true);
    setError(null);

    try {
      const result = await generateFoodImageRetake(
        generatedImageUrl,
        mode,
        aspectRatio,
        retakePrompt
      );
      setGeneratedImageUrl(result);
      setUserState(prev => ({ ...prev, creditsUsed: prev.creditsUsed + 1 }));
      setRetakePrompt(''); // 入力欄をクリア

      // 自動保存: ギャラリーに保存
      if (originalImageUrl) {
        try {
          // Convert originalImageUrl to base64 if needed
          const originalBase64 = await imageUrlToBase64(originalImageUrl);
          await galleryService.save(originalBase64, result, mode, aspectRatio);
        } catch (saveError: any) {
          console.warn('Failed to save to gallery:', saveError);
          if (saveError.message && saveError.message.includes('上限')) {
            setError(saveError.message);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "画像の再生成に失敗しました。もう一度お試しください。");
    } finally {
      setIsRetaking(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <Loader2 className="w-10 h-10 text-brand-yellow animate-spin" />
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gray p-4 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/logo.svg" 
              alt="メシドリAI" 
              className="h-20 w-auto mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-logo') as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="bg-brand-yellow p-4 rounded-lg w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-md fallback-logo hidden">
              <Camera className="w-10 h-10 text-slate-900" />
            </div>
          </div>
          <p className="text-slate-600 mb-10 font-medium leading-relaxed">
            プロ仕様のAI料理写真生成サービス。<br/>
            あなたのメニューを、売れる写真へ。
          </p>
          
          <button
            onClick={handleApiKeySelection}
            className="w-full bg-slate-900 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
          >
            <Sparkles className="w-5 h-5 text-brand-yellow" />
            Google AI Studio と連携して開始
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              ※ Gemini APIへのアクセス権限を持つGoogle Cloudプロジェクトが必要です。
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-xs text-slate-900 font-bold underline mt-2 inline-block hover:text-brand-yellow transition-colors">
              料金設定についてのドキュメント
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white font-sans text-slate-900">
      <Sidebar 
        userState={userState}
        currentUser={currentUser}
        onPlanChange={(plan) => setUserState({ plan, creditsUsed: 0 })} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={() => {
          // ログアウト後、ランディングページにリダイレクト
          window.location.href = '/';
        }}
      />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-[#FAFAFA]">
          {/* Mobile Header with Menu Button */}
          <div className="md:hidden mb-4 flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-900" />
              </button>
              <div>
                <h1 className="text-lg font-black text-slate-900">メシドリAI</h1>
                <p className="text-xs text-slate-500">残り {creditsRemaining} / {currentPlan.limit} 枚</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">残り</span>
                <div className="w-12 h-12 rounded-full bg-brand-yellow/10 border-2 border-brand-yellow flex items-center justify-center">
                  <span className="text-xl font-black text-brand-yellow">{creditsRemaining}</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">チケット</span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto space-y-10">
          {/* Main Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Input */}
            <div className="space-y-4 md:space-y-8">
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">STEP 1</span>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">写真をアップロード</h3>
                </div>
                <ImageUploader 
                  selectedImage={selectedImage} 
                  onImageSelect={(file) => {
                    setSelectedImage(file);
                    if (file) {
                      setOriginalImageUrl(URL.createObjectURL(file));
                    } else {
                      setOriginalImageUrl(null);
                    }
                    setGeneratedImageUrl(null);
                    setError(null);
                  }} 
                />
                
                {/* Food Description Input */}
                <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    商品の概要（任意）
                  </label>
                  <p className="text-xs text-slate-500 mb-3 font-medium">
                    商品名を入力すると、生成精度が向上します
                  </p>
                  <input
                    type="text"
                    value={foodDescription}
                    onChange={(e) => setFoodDescription(e.target.value)}
                    placeholder="例：豚骨ラーメン、海鮮盛り合わせセット、とんかつ定食など"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* Asset Selection */}
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-brand-yellow text-slate-900 text-xs font-bold px-2 py-1 rounded">オプション</span>
                    <h3 className="text-lg font-bold text-slate-900">店舗の雰囲気を使う</h3>
                  </div>
                  <button
                    onClick={() => setShowAssetManager(true)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
                  >
                    管理
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  店舗やテーブルの写真を選ぶと、実際の店で撮ったような写真になります
                </p>
                {selectedAsset ? (
                  <div className="border-2 border-slate-900 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${selectedAsset.imageUrl}`}
                          alt={selectedAsset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                          {selectedAsset.type === 'store' ? <Store className="w-4 h-4" /> : <Table className="w-4 h-4" />}
                          {selectedAsset.name}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {selectedAsset.type === 'store' ? '店舗の雰囲気' : 'テーブルの雰囲気'}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAsset(null)}
                        className="p-3 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAssetManager(true)}
                    className="w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <p className="text-slate-600 font-bold text-sm">店舗の雰囲気を選ぶ（任意）</p>
                    <p className="text-xs text-slate-400 mt-1">クリックして写真を選択</p>
                  </button>
                )}
              </div>

              {selectedImage && (
                <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">STEP 2</span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900">スタイルを選択</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => setMode(GenerationMode.MENU)}
                      className={`relative p-5 rounded-lg border-2 text-left transition-all group ${
                        mode === GenerationMode.MENU 
                          ? 'border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] translate-x-[-2px] translate-y-[-2px]' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-slate-900">メニュー用</span>
                        {mode === GenerationMode.MENU && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        スタジオ照明・45度アングル。<br/>メニューやUberEatsに最適化。
                      </p>
                    </button>

                    <button
                      onClick={() => setMode(GenerationMode.SNS)}
                      className={`relative p-5 rounded-lg border-2 text-left transition-all group ${
                        mode === GenerationMode.SNS 
                          ? 'border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] translate-x-[-2px] translate-y-[-2px]' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-slate-900">SNS用</span>
                        {mode === GenerationMode.SNS && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        自然光・トレンド感。<br/>Instagramやストーリーズ向け。
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {selectedImage && (
                <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">STEP 3</span>
                    <h3 className="text-base md:text-lg font-bold text-slate-900">アスペクト比を選択</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <button
                      onClick={() => setAspectRatio(AspectRatio.FOUR_THREE)}
                      className={`relative p-5 rounded-lg border-2 text-left transition-all group ${
                        aspectRatio === AspectRatio.FOUR_THREE 
                          ? 'border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] translate-x-[-2px] translate-y-[-2px]' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-slate-900">4:3</span>
                        {aspectRatio === AspectRatio.FOUR_THREE && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        メニュー表用<br/>横長のレイアウトに最適
                      </p>
                    </button>

                    <button
                      onClick={() => setAspectRatio(AspectRatio.ONE_ONE)}
                      className={`relative p-5 rounded-lg border-2 text-left transition-all group ${
                        aspectRatio === AspectRatio.ONE_ONE 
                          ? 'border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] translate-x-[-2px] translate-y-[-2px]' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-slate-900">1:1</span>
                        {aspectRatio === AspectRatio.ONE_ONE && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        インスタ投稿用<br/>正方形のフォーマット
                      </p>
                    </button>

                    <button
                      onClick={() => setAspectRatio(AspectRatio.NINE_SIXTEEN)}
                      className={`relative p-5 rounded-lg border-2 text-left transition-all group ${
                        aspectRatio === AspectRatio.NINE_SIXTEEN 
                          ? 'border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] translate-x-[-2px] translate-y-[-2px]' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg text-slate-900">9:16</span>
                        {aspectRatio === AspectRatio.NINE_SIXTEEN && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        ストーリーズ用<br/>縦長のフォーマット
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {selectedImage && (
                <div className="pt-2">
                  {creditsRemaining > 0 ? (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full bg-brand-yellow text-slate-900 font-bold py-5 px-6 rounded-lg shadow-lg hover:bg-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 text-lg hover:-translate-y-1 active:translate-y-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
                          AIが調理中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6 text-slate-900" />
                          写真を生成する
                          <span className="text-sm font-normal opacity-70 ml-2">(残り {creditsRemaining}回)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-100 rounded-xl p-6 text-center">
                      <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 text-lg">クレジットが不足しています</h4>
                      <p className="text-sm text-slate-600 mb-6 font-medium">
                        {currentPlan.name} の今月の上限に達しました。
                      </p>
                      <a 
                        href={STRIPE_LINK} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                      >
                        プランをアップグレード <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Result */}
            <div className="space-y-4 md:space-y-6 h-full">
              <div className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-100 h-full min-h-[400px] md:min-h-[600px] flex flex-col relative">
                 <div className="flex items-center gap-3 mb-6">
                  <span className="bg-brand-yellow text-slate-900 text-xs font-bold px-2 py-1 rounded">RESULT</span>
                  <h3 className="text-lg font-bold text-slate-900">生成結果</h3>
                </div>
                
                <div className="flex-1 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group min-h-[500px]">
                  {(isGenerating || isRetaking) && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 border-4 border-brand-yellow border-t-slate-900 rounded-full animate-spin mb-6"></div>
                      <p className="text-slate-900 font-bold text-xl animate-pulse">
                        {isRetaking ? 'AIが調整中...' : 'AIが生成中...'}
                      </p>
                      <p className="text-sm text-slate-500 mt-2 font-medium">
                        {isRetaking ? '調整指示に基づいて再生成しています' : '最高の1枚に仕上げています'}
                      </p>
                    </div>
                  )}
                  
                  {generatedImageUrl && originalImageUrl ? (
                    <BeforeAfterSlider 
                      beforeImage={originalImageUrl}
                      afterImage={generatedImageUrl}
                    />
                  ) : generatedImageUrl ? (
                    <img 
                      src={generatedImageUrl} 
                      alt="Generated Food" 
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="bg-slate-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                        <Camera className="w-10 h-10 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">プレビューエリア</p>
                      <p className="text-slate-400 text-sm mt-2">左側のパネルから画像を生成してください</p>
                    </div>
                  )}
                </div>

                {generatedImageUrl && (
                  <>
                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        生成完了
                      </div>
                      <a
                        href={generatedImageUrl}
                        download={`dishup-${mode === GenerationMode.MENU ? 'menu' : 'sns'}-${Date.now()}.png`}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-all shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        画像を保存する
                      </a>
                    </div>

                    {/* Retake Section */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <h4 className="text-lg font-black text-slate-900 mb-3">調整して再生成</h4>
                      <p className="text-xs text-slate-500 mb-4 font-medium">
                        生成された画像に対して調整指示を入力してください（例：「もっと明るく」「背景を変更」「色味を鮮やかに」）
                      </p>
                      <div className="space-y-3">
                        <textarea
                          value={retakePrompt}
                          onChange={(e) => setRetakePrompt(e.target.value)}
                          placeholder="例：もっと明るく、背景を変更、色味を鮮やかに..."
                          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-slate-900 focus:outline-none resize-none text-sm font-medium bg-white"
                          rows={3}
                          disabled={isRetaking || creditsRemaining <= 0}
                        />
                        <button
                          onClick={handleRetake}
                          disabled={isRetaking || creditsRemaining <= 0 || !retakePrompt.trim()}
                          className="w-full bg-brand-yellow text-slate-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          {isRetaking ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              調整中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              調整して再生成（チケット1枚消費）
                            </>
                          )}
                        </button>
                        {creditsRemaining <= 0 && (
                          <p className="text-xs text-red-600 font-medium text-center">
                            クレジットが不足しています
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                
                {error && (
                   <div className="mt-6 bg-red-50 text-red-600 px-6 py-4 rounded-lg text-sm font-bold flex items-center gap-3 border border-red-100">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     {error}
                   </div>
                )}
              </div>
            </div>

          </div>
        </div>
        </main>

        {/* Asset Manager Modal */}
        {showAssetManager && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-black text-slate-900">店舗の雰囲気を管理</h3>
                <button
                  onClick={() => setShowAssetManager(false)}
                  className="p-3 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="p-6">
                <AssetManager
                  selectedAssetId={selectedAsset?.id || null}
                  onAssetSelect={(asset) => {
                    setSelectedAsset(asset);
                    setShowAssetManager(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 md:py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.svg" 
                  alt="メシドリAI" 
                  className="h-[29px] w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-bold text-slate-600 items-center">
                <button 
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-brand-yellow text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  意見・要望
                </button>
                <button 
                  onClick={() => onNavigate?.('commerce')}
                  className="hover:text-slate-900 transition-colors"
                >
                  特定商取引法に基づく表記
                </button>
                <button 
                  onClick={() => onNavigate?.('privacy')}
                  className="hover:text-slate-900 transition-colors"
                >
                  プライバシーポリシー
                </button>
                <button 
                  onClick={() => onNavigate?.('terms')}
                  className="hover:text-slate-900 transition-colors"
                >
                  利用規約
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">© 2026 株式会社CONTE. All rights reserved.</p>
            </div>
          </div>
        </footer>

        {/* Feedback Modal */}
        <FeedbackModal 
          isOpen={showFeedbackModal} 
          onClose={() => setShowFeedbackModal(false)} 
        />
      </div>
    </div>
  );
};
