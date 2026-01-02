import React, { useState } from 'react';
import { Camera, ArrowRight, ArrowLeft, Zap, Image as ImageIcon, Smartphone, ChefHat, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { PLANS } from '../constants';
import { PlanType } from '../types';
import { FeedbackModal } from './FeedbackModal';
import { LoginButton } from './LoginButton';
import { getIdToken } from '../services/authService';
import { createCheckoutSession } from '../services/stripeService';

interface LandingPageProps {
  onLogin: () => void;
  onNavigate?: (view: 'privacy' | 'terms' | 'commerce') => void;
}

interface BeforeAfterSliderProps {
  imgBefore: string;
  imgAfter: string;
  labelBefore?: string;
  labelAfter?: string;
  className?: string;
}

// Custom Component for Before/After Toggle (Replaces Slider)
const ImageToggle: React.FC<BeforeAfterSliderProps> = ({ 
  imgBefore, 
  imgAfter,
  labelBefore = "BEFORE",
  labelAfter = "AFTER",
  className = ""
}) => {
  const [showAfter, setShowAfter] = useState(true);

  return (
    <div className={`relative rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-900 bg-slate-200 group ${className}`}>
      <img 
        src={showAfter ? imgAfter : imgBefore} 
        alt={showAfter ? "After" : "Before"} 
        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      <div className={`absolute top-4 left-4 font-black px-3 py-1 rounded border-2 border-slate-900 z-10 text-xs md:text-sm shadow-sm transition-colors ${
        showAfter ? 'bg-brand-yellow text-slate-900' : 'bg-slate-900 text-white border-white'
      }`}>
        {showAfter ? labelAfter : labelBefore}
      </div>

      <button
        onClick={() => setShowAfter(!showAfter)}
        className="absolute bottom-6 right-6 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-3 rounded-lg font-bold text-sm hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all flex items-center gap-2 z-20"
      >
        <Zap className={`w-4 h-4 ${showAfter ? 'text-slate-400' : 'text-brand-yellow fill-brand-yellow'}`} />
        {showAfter ? "元の写真を見る" : "生成結果を見る"}
      </button>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSnsBefore, setShowSnsBefore] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePlanClick = async (plan: typeof PLANS[keyof typeof PLANS]) => {
    if (plan.id === PlanType.FREE) {
      onLogin();
    } else {
      // 有料プランの場合、Stripe Checkoutを開始
      try {
        const idToken = await getIdToken();
        if (!idToken) {
          // 未ログインの場合はログインを促す
          onLogin();
          return;
        }
        
        const { url } = await createCheckoutSession(plan.id, idToken);
        // Stripe Checkoutページにリダイレクト
        window.location.href = url;
      } catch (error: any) {
        console.error('Error starting checkout:', error);
        alert(error.message || '決済の開始に失敗しました。ログインしてください。');
        onLogin();
      }
    }
  };

  // Updated Images for better reliability and quality
  const meatBefore = "/IMG_5714.JPG"; // Raw meat
  const meatAfter = "/dishup-menu-1766770435925.png"; // Nice Steak

  // Gallery Items Data
  const GALLERY_ITEMS = [
    {
      title: "海鮮居酒屋の盛り合わせ",
      category: "Menu Mode",
      before: "/IMG_3721.JPG",
      after: "/dishup-menu-1766765226165.png"
    },
    {
      title: "濃厚豚骨ラーメン",
      category: "Menu Mode",
      before: "/IMG_5782.jpg",
      after: "/dishup-menu-1766771467908.png"
    },
    {
      title: "グルメバーガー",
      category: "SNS Mode",
      before: "/IMG_6818.JPG",
      after: "/dishup-menu-1766771335789.png"
    },
    {
      title: "カフェのパンケーキ",
      category: "SNS Mode",
      before: "/IMG_7565.png",
      after: "/dishup-menu-1767277540401.png"
    },
    {
      title: "本格スパイスカレー",
      category: "Menu Mode",
      before: "/IMG_5733.JPG",
      after: "/dishup-menu-1766772016831.png"
    }
  ];

  return (
    <div className="font-sans text-slate-900 bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 mt-4">
            <img 
              src="/logo.svg" 
              alt="メシドリAI" 
              className="h-[34px] w-auto"
              onError={(e) => {
                // フォールバック: ロゴ画像が読み込めない場合は元のアイコンを表示
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="bg-brand-yellow w-10 h-10 flex items-center justify-center rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hidden">
              <Camera className="w-6 h-6 text-slate-900" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900">機能</a>
            <a href="#pricing" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900">料金</a>
            <LoginButton onLoginSuccess={onLogin} />
          </div>
        </div>
      </nav>

      {/* 1. Hero Area */}
      <section className="pt-32 pb-20 bg-brand-yellow relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="max-w-3xl">
            <div className="inline-block bg-white border-2 border-slate-900 px-3 py-1 rounded-full text-xs font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Google 最新AI技術搭載
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-[1.15] mb-6 tracking-tight text-slate-900">
              その写真で、<br/>損するのはもう終わり。
            </h1>
            <p className="text-lg md:text-xl font-bold mb-8 opacity-90 leading-relaxed max-w-lg">
              スマホ写真を、3秒で<br className="md:hidden"/>「行列店のメニュー」へ。<br/>
              プロのカメラマンの知識を搭載したAIが、<br className="md:hidden"/>あなたの料理を最高の一枚に。<br/>
              誰でも、簡単に、いつでも。<br/>月額980円〜で始める、<br className="md:hidden"/>お店の「売れる」写真改革。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onLogin}
                className="bg-slate-900 text-brand-yellow font-black py-5 px-10 rounded-2xl text-xl hover:bg-slate-800 hover:scale-105 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] border-4 border-slate-900 transform hover:-translate-y-1"
              >
                今すぐ無料で試してみる
                <span className="block text-sm font-bold opacity-90 mt-2">（登録30秒・クレカ不要）</span>
              </button>
            </div>
          </div>
          
          {/* Right: Before/After Vertical Stack */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-4 max-w-[70%] mx-auto">
              <div className="relative rounded-xl overflow-hidden border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] aspect-[4/3]">
                <div className="absolute top-2 left-2 bg-slate-900 text-white text-sm font-black px-3 py-1.5 rounded z-10">
                  BEFORE
                </div>
                <img 
                  src={meatBefore} 
                  alt="Before" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] aspect-[4/3]">
                <div className="absolute top-2 left-2 bg-brand-yellow text-slate-900 text-sm font-black px-3 py-1.5 rounded z-10">
                  AFTER
                </div>
                <img 
                  src={meatAfter} 
                  alt="After" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">
              「美味しいのに、写真で伝わらない」<br/>
              そんな悩みはありませんか？
            </h2>
            {/* 悩んでいる女性店員のイラスト */}
            <div className="flex justify-center mb-8">
              <svg 
                id="_レイヤー_1" 
                data-name="レイヤー 1" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1600 1200"
                className="max-w-[300px] w-full h-auto"
              >
                <defs>
                  <style>
                    {`.cls-1 {
                      fill: #fff;
                    }

                    .cls-1, .cls-2, .cls-3, .cls-4 {
                      stroke: #231815;
                      stroke-width: 9.69px;
                    }

                    .cls-1, .cls-2, .cls-3, .cls-4, .cls-5 {
                      stroke-linecap: round;
                      stroke-linejoin: round;
                    }

                    .cls-2, .cls-6 {
                      fill: #fabe00;
                    }

                    .cls-3, .cls-5 {
                      fill: none;
                    }

                    .cls-4 {
                      fill: #231815;
                    }

                    .cls-5 {
                      stroke: #9fa0a0;
                      stroke-width: 7.71px;
                    }`}
                  </style>
                </defs>
                <g>
                  <path className="cls-1" d="M768.3,725.64c8.78,3.51,61.61,78.88,45.8,106.99-15.81,28.11-151.8,147.16-151.8,147.16l-26.35-93.11,64.42-74.37-11.71-36.31,79.64-50.36Z"/>
                  <path className="cls-1" d="M155.99,715.09c-8.78,3.51-75.13,99.35-57.54,126.39,42.13,64.73,208.59,158.24,208.59,158.24l5.14-112-90.21-68.21,31.65-28.38-97.61-76.04Z"/>
                  <path className="cls-1" d="M658.86,494.7c-24.84-17.08-69.96-15.37-101.09-12.09-33.38,3.51-42.49,6.45-89.6,6.15-26.1-.17-55.34-11.67-82.57-8.78-29.39,3.12-86.4,8.11-109.39,20.36-41.79,22.26-127.41,169.54-159.27,217.83,0,0,46.28,48.91,71.93,63.71,26.72,15.41,67.82,32.88,67.82,32.88l43.65-59.18c1.03,6.85,1.94,13.67,2.7,20.42,4.17,46.73,15.25,315.54,12.41,321.22-2.84,5.67,82.13,19.41,140.34,17.75,109.46-3.12,221.43-17.21,221.43-17.21,0,0-1.74-190.19-3.36-315.55l14.81,21.89s28.11-4.68,55.05-22.25c26.94-17.57,56.54-48.27,56.54-48.27-25.93-46.46-105.49-213.04-141.39-238.89Z"/>
                  <path className="cls-1" d="M539.33,365.78s-20.71,74.36.62,104.92c12.96,18.56,30.9,31.7,30.9,31.7,0,0-2.62,48.59-89.5,47.86-67.8-.57-102.78-57.1-102.78-57.1,0,0,11.39,2.25,31.62-32.5,23.91-41.06,15.81-88.72,15.81-88.72"/>
                  <path className="cls-2" d="M560.95,478.08s19.7,37.8,23.97,68.13c4.4,31.28,4.19,62.31,4.19,62.31l-177.44,8.78s-9.65-41.96-15.99-68.53c-8.97-37.59-25.2-69.12-25.2-69.12l-57.78,9.11s9.41,11.06,18.74,36.02c11.96,31.98,25.16,83.41,32.73,127.6,8.69,50.74-25.05,173.11-64.22,231.77,0,0-24.73,255.53-26.01,277.88l429.67,6.2s-18.3-232.1-21.96-281.54c-5.27-71.15-4.39-101.9-21.96-165.14-7.64-27.5-23.72-112.44-23.72-112.44,0,0-2.64-38.65-8.78-69.69-5.47-27.63-24.2-60.88-24.2-60.88l-42.01-.46Z"/>
                  <path className="cls-1" d="M499.77,649.13c-.21,8.26,6.32,15.13,14.58,15.34,8.26.21,15.13-6.32,15.34-14.58.21-8.26-6.32-15.13-14.58-15.34-8.26-.21-15.13,6.32-15.34,14.58Z"/>
                  <path className="cls-1" d="M503.29,724.68c-.21,8.26,6.32,15.13,14.58,15.34,8.26.21,15.13-6.32,15.34-14.58.21-8.26-6.32-15.13-14.58-15.34-8.26-.21-15.13,6.32-15.34,14.58Z"/>
                  <path className="cls-2" d="M457.19,971.72l-149.1-4.22s-44.15,130.15,68.22,130.15c73.2,0,80.88-125.94,80.88-125.94Z"/>
                  <path className="cls-2" d="M577.02,971.72l99.96-4.22s3.7,120.81-42.29,120.81c-73.2,0-57.67-116.59-57.67-116.59Z"/>
                  <path className="cls-1" d="M563.01,345.73c21.5-1.31,41.1-29.15,35.37-57.78-3.59-17.93-31.63-28.04-43.85-10.98-4.5,6.28-9.27,15.53-10.63,19.67"/>
                  <path className="cls-1" d="M577.1,302.91c-3.84,2.94-8.53,6.88-8.35,14.32"/>
                  <path className="cls-1" d="M357.83,407.09c-19.27,9.64-50.17-4.63-59.57-32.28-5.88-17.32,13.32-40.11,32.44-31.47,7.04,3.18,15.8,8.79,19.05,11.69"/>
                  <path className="cls-1" d="M323.31,373.15c4.74.97,10.68,2.47,13.76,9.24"/>
                  <path className="cls-1" d="M310.12,265.8c2.35,29.17,12.93,65.35,27.28,103.23,37.7,99.56,107.41,105.17,132.86,105.98,20.71.66,45.54-9.27,56.02-15.98,34.38-22.04,46-66.85,44.84-119.44-.76-34.48-6.21-91.71-27.41-125.22-21.2-33.5-86.92-115.82-161.18-41.69-43.55,43.47-76.65,40.41-72.4,93.11Z"/>
                  <path className="cls-1" d="M479.77,360.29l11.14-14.28s-20.69-33.82-25.31-47.36"/>
                  <path className="cls-4" d="M544.43,236.78c10.41,26.97,24,56.64,24,56.64,0,0,5.56-48.62-.94-76.87-8.71-37.91-24.62-79.19-56.6-90.82-20.04-7.29-70.89-14.93-92.87-15.49-35.74-.91-72.8,19.83-94.12,42.1-23.83,24.9-16.03,50.72-16.03,50.72,0,0-30.63,4.83-32.38,31.51-5.41,82.36,64.59,136.31,61.91,134.47,0,0-23.28-36.99-8.24-77.4,14.14-37.96,26.89-75.76,19.72-98.96,0,0,25.55,28.02,91.62,39.67,0,0,.48-13.69.76-35.22,0,0,38.17-2.48,61.55,19.78l-6.01-30.55s37.68,24.68,47.62,50.43Z"/>
                  <path className="cls-5" d="M511.21,174.5c13.1,4.68,25.25,14.94,33.75,27.61"/>
                  <path className="cls-5" d="M394.4,151.04c13.79,2.75,63.42,9.66,72.04,15.69"/>
                  <path className="cls-5" d="M436.1,180.03c-11.72-3.66-58.75-12.59-69.84-16.62"/>
                  <path className="cls-1" d="M390.25,333.34c9.72,15.31,29.24,3.19,24.6-10.44"/>
                  <path className="cls-1" d="M516.71,289c1.79,18.05-21.05,20.55-25.8,6.96"/>
                  <path className="cls-1" d="M366.47,288.9c11.87-3.62,24.07-12.88,29.71-23.69"/>
                  <path className="cls-1" d="M462.52,425.85c5.58-14.93,38.6-30.6,56.19-17.96"/>
                  <line className="cls-1" x1="289.23" y1="694.54" x2="298.82" y2="728.79"/>
                  <line className="cls-1" x1="671.47" y1="654.81" x2="657.77" y2="687.69"/>
                  <path className="cls-3" d="M95.26,207.53c-8.31-.08-14.93-8.06-16-16.31-1.07-8.24,2.15-16.44,6.16-23.72,16.78-30.52,49.16-51.89,83.81-55.33,10.84-1.08,22.56-.26,31.34,6.19,11.77,8.63,15.07,25.54,11.24,39.62-3.82,14.09-13.41,25.85-23.53,36.38-8.62,8.97-18.02,17.53-29.31,22.77-11.29,5.24-29.95,11.05-36.16,1.74s2.85-24.22,9.96-33.92c11.62-15.87,33.23-24.47,52.06-18.79,18.83,5.68,32.39,26.57,27.94,45.73-4.45,19.16-41.98,31.77-45.78,23.63s17.09-25.5,30.2-19.91c13.12,5.59,16.82,25.67,6.56,35.57"/>
                </g>
                <g>
                  <path className="cls-1" d="M976.98,691.46c-7.43,2.97-50.74,82.84-37.37,106.6,13.37,23.77,144.24,154.04,144.24,154.04l8.22-78.78-83.57-99.33,34.94-30.83-66.45-51.72Z"/>
                  <path className="cls-1" d="M1446.14,714.45c6.74,2.7,74.55,73.4,61.05,94.15-32.33,49.68-159.95,167.14-159.95,167.14l-30.14-76.72,83.23-96.59,21.58-34.94,24.24-53.05Z"/>
                  <path className="cls-1" d="M1532.87,773.66c-3.14-34.59-147.16-210.64-173.65-231.19-27.84-21.6-39.4-8.91-93.86-8.03-23.27.38-80.66-2.95-145.56,1.87-29.76,2.21-61.99-2.97-89.85,23.52-16.86,16.03-111.2,190.27-111.2,218.29,0,32.2,35.62,64.39,64.39,88.02,24.66-10.28,48.1-41,61.65-65.76-13.36-10.62-18.5-26.72-18.5-26.72l42.16-45.75c17.76,59.92,35.27,113.09,35.27,113.09,75.74,140.44,9.38,223.48-3.3,258.64-1.91,5.3,99.43,2.57,150.35-6.67,95.76-17.36,144.06-84.71,134.47-157.32-9.59-72.61-39.41-123.43-42.47-143.85-2.42-16.16,3.66-39.46,8.22-60.28l56.51,42.13-23.63,33.91s71.93,77.06,80.15,69.87c30.32-26.53,72.27-66.1,68.84-103.78Z"/>
                  <path className="cls-1" d="M1212.06,439.69s.39,55.36,19.08,78.92c11.35,14.31,26.45,24.01,26.45,24.01,0,0-7.79,42.34-77.9,43.34-81.6,1.17-79.26-30.48-79.26-30.48,0,0,19.29-4.12,33.88-33.12,17.24-34.25,4.01-76.67,4.01-76.67"/>
                  <path className="cls-2" d="M1218.11,194.21s-2.68-7.84-15.39-19.11c-37.8-33.54-85.79,22.92-115.26,63.6-15.21,20.99-45.67,53.16-52.39,96.13-5.59,35.8,21.24,82.32,49.74,101.33,28.49,19.01,20.12,10.96,20.12,10.96,0,0-9.78-77.82-4.59-102.24,5.19-24.42,14.37-39.14,48.07-67.45,33.7-28.32,61.77-61.73,69.7-83.21Z"/>
                  <path className="cls-1" d="M1093.88,323.55s-34.51-18.12-37.69,17.2c-3.18,35.32,32.81,45.14,32.81,45.14"/>
                  <path className="cls-1" d="M1095.6,285.47c-10.37,24.43-13.95,55.57-21.04,91.56-10.78,54.74,26.24,118.65,80.77,126.55,50.77,7.35,88.28-15,115.8-52.87,18.37-25.28,36.83-85.85,34.42-121.53-2.42-35.68-53.31-103.53-107.39-99.94-54.09,3.59-83.83,12.1-102.56,56.23Z"/>
                  <path className="cls-1" d="M1158.26,362.3c-15.23,19.04-28.01,18.9-28.01,18.9l8.96,15.88"/>
                  <path className="cls-6" d="M1154.86,213.96c-9.05,36.82-3.64,78.14,17.54,99.93l42.23,10.83s-5.59-16-7.3-38.39c0,0,23.22,31.55,47.16,51.79,13.5,11.41,38.77,25.94,39.67,25.1-4.07,40.98-31.5,98.23-51.81,124.86,0,0,127.21-11.57,125.67-158.25-.47-45.15-33.14-116.35-83.62-145.02-71.63-40.68-120.49-7.68-129.54,29.14Z"/>
                  <path className="cls-3" d="M1273.66,263.05c12.89,25.09,21.53,49.43,22.95,71.5"/>
                  <path className="cls-3" d="M1152.19,256.28c-1.25,16.13,2.03,43.44,21.38,63.26"/>
                  <path className="cls-3" d="M1244.79,326.85s29.27,31.42,49.37,36.38c-4.07,40.98-31.5,98.23-51.81,124.86,0,0,129.22-9.4,125.67-158.25-1.08-45.14-33.14-116.35-83.62-145.02-62.05-35.24-107.02-15.18-123.82,14.75"/>
                  <path className="cls-3" d="M1205.08,231.95c-2.73,21.32-1.34,74.46,10.72,98.43"/>
                  <path className="cls-2" d="M1118.4,534.19s-12.18,18.32-16.74,35.22c-4.57,16.9-14.28,74.97-14.28,74.97l158.82.84,11.26-119.57,47.43,2.64s-6.21,51.61-9.66,130.01c-2.22,50.57,36.98,223.36,94.13,259.56,3.71-8.88,8.22,123.3-17.81,242.5h-341.14s19.8-117.45,31.85-196.6c9.28-60.91,24.74-114.72,15.09-133.59-22.19-43.4-29.81-74.84-35.4-102.34s5.67-74.57,5.67-74.57c0,0,17.96-69.69,20.7-77.91,2.74-8.22,14.16-38.82,14.16-38.82l35.92-2.34Z"/>
                  <path className="cls-1" d="M1090.17,685.07c1.22,8.03-4.3,15.54-12.33,16.76s-15.54-4.3-16.76-12.33c-1.22-8.03,4.3-15.54,12.33-16.76,8.03-1.22,15.54,4.3,16.76,12.33Z"/>
                  <path className="cls-1" d="M1273.07,684.11c1.22,8.03-4.3,15.54-12.33,16.76-8.03,1.22-15.54-4.3-16.76-12.33-1.22-8.03,4.3-15.54,12.33-16.76,8.03-1.22,15.54,4.3,16.76,12.33Z"/>
                  <path className="cls-3" d="M1108.87,916.93l189.23,1.98s12.69,125.91-97.73,122.57c-99.93-3.03-91.5-124.55-91.5-124.55Z"/>
                  <path className="cls-1" d="M1230.44,378.8c-10.83,15.24-28.76,6.2-25.55-7.84"/>
                  <path className="cls-1" d="M1122.65,342.99c-1.78,18.05,16.91,17.89,21.66,4.29"/>
                  <path className="cls-1" d="M1146.95,294.72c-9.52,7.95-18,10.21-30.14,9.01"/>
                  <path className="cls-1" d="M1168.79,460.16c-9.22-20.23-27.13-21.04-34.07-12.44"/>
                  <line className="cls-1" x1="1424.3" y1="766.81" x2="1445.53" y2="761.33"/>
                  <line className="cls-1" x1="982.12" y1="753.11" x2="999.59" y2="763.73"/>
                  <path className="cls-3" d="M1391.92,109.77c3.25-6.8,10.99-10.58,18.51-11,7.52-.42,14.9,1.99,21.91,4.77,22.73,9.04,43.72,22.42,61.51,39.2,7.31,6.89,14.54,15.56,13.97,25.59-.5,8.85-7.33,16.42-15.42,20.05-8.09,3.62-17.27,3.93-26.12,3.42-27.46-1.58-54.45-10.58-77.36-25.79-6.91-4.59-14.23-12.68-10.47-20.07,3.47-6.81,13.22-6.51,20.64-4.71,16.42,3.97,33.19,11.17,42.59,25.2,9.4,14.04,7.89,36.19-6.69,44.71-9.5,5.55-21.84,4.01-31.57-1.12-9.73-5.13-26.9-10.38-24.89-21.41,2.01-11.03,27.24,5.7,27.52,18.66.28,12.96-14.37,23.83-26.7,19.82"/>
                </g>
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "スマホで美味しそうに撮れない…", desc: "店内が暗いと、スマホで撮るとどうしても暗く沈んでしまう。湯気も照りも写らない。「本当はもっと美味しそうなのに…」と、投稿をためらってしまう。", icon: AlertTriangle },
              { title: "撮影費用が高すぎる", desc: "プロに撮影を頼むと1回3万円〜。季節メニューが変わるたびに呼んでいられない。", icon: Camera },
              { title: "加工アプリだと不自然", desc: "フィルターをかけすぎて、嘘っぽい写真になってしまう。素人感が抜けない。", icon: Smartphone },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-slate-900 transition-colors">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <item.icon className="w-6 h-6 text-slate-900" />
                </div>
                <h3 className="text-xl font-black mb-3 text-center">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Solution & Features (Zigzag) */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <span className="text-brand-yellow font-black tracking-widest uppercase mb-2 block">SOLUTION</span>
            <h2 className="text-4xl font-black text-slate-900">
              アップロードするだけ。<br/>AIが「2人のプロ」の視点で再撮影。
            </h2>
          </div>

          {/* Menu Mode */}
          <div className="flex flex-col md:flex-row items-center gap-12 mb-24">
            <div className="flex-1 order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-brand-yellow text-slate-900 px-4 py-2 rounded-lg font-bold mb-6">
                <ChefHat className="w-5 h-5 text-slate-900" />
                メニュー・広告用モード
              </div>
              <h3 className="text-3xl font-black mb-6">プロ品質の写真で、<br/>高単価メニューを売る。</h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                店内メニュー表、ポスター、UberEatsに最適。
                散らかったテーブルを消去し、高級感のある背景と完璧なライティングで再構築します。
              </p>
              <ul className="space-y-3">
                {['清潔感のあるボケ背景', '45度/真上からの構図補正', '食材の色味を鮮やかに'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-brand-yellow fill-slate-900" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 order-1 md:order-2">
              <div className="relative rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(250,204,21,1)]">
                <img src="/dishup-menu-1766774316686.png" alt="Menu Quality" className="w-full h-auto" />
              </div>
            </div>
          </div>

          {/* SNS Mode */}
          <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(250,204,21,1)] aspect-[3/4]">
                <img 
                  src={showSnsBefore ? "/IMG_4958_2.JPG" : "/dishup-sns-1766774627521.png"} 
                  alt={showSnsBefore ? "SNS Before" : "SNS Quality"} 
                  className="w-full h-full object-cover" 
                />
                <button
                  onClick={() => setShowSnsBefore(!showSnsBefore)}
                  className="absolute bottom-4 right-4 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-3 rounded-lg font-bold text-sm hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all flex items-center gap-2 z-20"
                >
                  {showSnsBefore ? (
                    <>
                      生成結果を見る
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4" />
                      元の写真を見る
                    </>
                  )}
                </button>
                {!showSnsBefore && (
                  <div className="absolute top-4 left-4 bg-brand-yellow text-slate-900 text-sm font-black px-3 py-1.5 rounded z-10">
                    AFTER
                  </div>
                )}
                {showSnsBefore && (
                  <div className="absolute top-4 left-4 bg-slate-900 text-white text-sm font-black px-3 py-1.5 rounded z-10">
                    BEFORE
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-brand-yellow text-slate-900 px-4 py-2 rounded-lg font-bold mb-6">
                <Smartphone className="w-5 h-5 text-slate-900" />
                SNS・インスタ用モード
              </div>
              <h3 className="text-3xl font-black mb-6">「センスの良い店」を作る、<br/>インフルエンサー品質。</h3>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-6">
                Instagram、ストーリーズ、TikTokに最適。
                スマホ撮影のリアルな質感を残しつつ、トレンドの色味と空気感を演出します。
              </p>
              <ul className="space-y-3">
                {['自然光・カフェの雰囲気', 'iPhone Pro風のリアルな質感', 'トレンドのカラーグレーディング'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-brand-yellow fill-slate-900" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quality Section */}
      <section className="py-20 bg-brand-yellow text-slate-900 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            その一枚で、<br/>お客様が「食べたい」と思う。
          </h2>
          <p className="text-slate-800 max-w-2xl mx-auto mb-8 font-bold text-lg leading-relaxed">
            プロのカメラマンが撮ったような、<br/>
            本物の「美味しそう」を再現。<br/>
            メニュー表にも、SNSにも、<br/>
            そのまま使える高品質な写真をお届けします。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-white border-4 border-slate-900 px-8 py-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">プロ品質</h3>
              <p className="text-sm text-slate-600 font-medium">プロカメラマン級の<br/>仕上がりを実現</p>
            </div>
            <div className="bg-white border-4 border-slate-900 px-8 py-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">すぐ使える</h3>
              <p className="text-sm text-slate-600 font-medium">メニュー表・SNSに<br/>そのまま使える</p>
            </div>
            <div className="bg-white border-4 border-slate-900 px-8 py-10 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-black text-slate-900 mb-2">売れる写真</h3>
              <p className="text-sm text-slate-600 font-medium">注文が増える<br/>「美味しそう」を実現</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Use Case (Gallery) - 5 Comparisons */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              写真が変われば、注文が変わる。
            </h2>
             <p className="text-lg text-slate-600 font-bold opacity-80">
              あらゆるジャンルの料理に対応。AIがシズル感を最大限に引き出します。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {GALLERY_ITEMS.map((item, idx) => (
               <div key={idx} className="flex flex-col gap-3">
                 <ImageToggle 
                    imgBefore={item.before}
                    imgAfter={item.after}
                    className="w-full aspect-[4/3] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                    labelBefore="BEFORE"
                    labelAfter="AFTER"
                 />
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing */}
      <section id="pricing" className="py-24 bg-brand-yellow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">ランチ3回分の投資で、<br/>集客を変えよう。</h2>
            <p className="text-slate-900 font-bold opacity-80">必要な時だけ契約。いつでも解約可能です。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
            {/* Free */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 shadow-sm">
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">{PLANS[PlanType.FREE].badge}</div>
                <h3 className="font-bold text-slate-500 mb-2">{PLANS[PlanType.FREE].name}</h3>
                <div className="text-4xl font-black text-slate-900">{PLANS[PlanType.FREE].price}</div>
                <p className="text-xs text-slate-400 font-bold mt-1">月間 {PLANS[PlanType.FREE].limit}枚</p>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS[PlanType.FREE].features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanClick(PLANS[PlanType.FREE])}
                className="w-full py-3 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                無料で試す
              </button>
            </div>

            {/* Light */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-500 mb-2">{PLANS[PlanType.LIGHT].name}</h3>
                <div className="text-4xl font-black text-slate-900 mb-1">{PLANS[PlanType.LIGHT].price} <span className="text-base font-bold text-slate-400">/ 月</span></div>
                <p className="text-xs text-slate-400 font-bold">月間 {PLANS[PlanType.LIGHT].limit}枚</p>
                <p className="text-xs text-slate-500 font-medium mt-1">1枚あたり {Math.round(PLANS[PlanType.LIGHT].priceValue / PLANS[PlanType.LIGHT].limit)}円</p>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS[PlanType.LIGHT].features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanClick(PLANS[PlanType.LIGHT])}
                className="w-full py-3 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                ライトを始める
              </button>
            </div>

            {/* Standard (Featured) */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative transform md:-translate-y-4 z-10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-brand-yellow text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider border-2 border-brand-yellow">
                一番人気
              </div>
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-500 mb-2">{PLANS[PlanType.STANDARD].name}</h3>
                <div className="text-5xl font-black text-slate-900 mb-1">{PLANS[PlanType.STANDARD].price} <span className="text-base font-bold text-slate-400">/ 月</span></div>
                <p className="text-xs text-slate-400 font-bold">月間 {PLANS[PlanType.STANDARD].limit}枚</p>
                <p className="text-xs text-slate-500 font-medium mt-1">1枚あたり 約{Math.round(PLANS[PlanType.STANDARD].priceValue / PLANS[PlanType.STANDARD].limit)}円</p>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS[PlanType.STANDARD].features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0 mt-0.5 fill-slate-900" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanClick(PLANS[PlanType.STANDARD])}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all hover:shadow-lg text-sm"
              >
                スタンダードを始める
              </button>
              <div className="text-center mt-3 text-xs text-slate-400 font-medium">
                追加チケット購入可能 (5枚 550円)
              </div>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-900 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="font-bold text-slate-500 mb-2">{PLANS[PlanType.PRO].name}</h3>
                <div className="text-4xl font-black text-slate-900 mb-1">{PLANS[PlanType.PRO].price} <span className="text-base font-bold text-slate-400">/ 月</span></div>
                <p className="text-xs text-slate-400 font-bold">月間 {PLANS[PlanType.PRO].limit}枚</p>
                <p className="text-xs text-slate-500 font-medium mt-1">1枚あたり {Math.round(PLANS[PlanType.PRO].priceValue / PLANS[PlanType.PRO].limit)}円</p>
              </div>
              <ul className="space-y-3 mb-6">
                {PLANS[PlanType.PRO].features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handlePlanClick(PLANS[PlanType.PRO])}
                className="w-full py-3 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-50 transition-colors text-sm"
              >
                プロを始める
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: "実際の料理と全然違うものになりませんか？", a: "AIは元の形状を維持するよう調整されていますが、具材の細部が微修正される場合があります。「イメージ写真」としてお使いいただくことを推奨します。" },
              { q: "印刷に使えますか？", a: "はい。A4サイズ程度のメニュー表やチラシであれば、十分綺麗に印刷できる高解像度データ(2K)をお渡しします。" },
              { q: "スマホだけで使えますか？", a: "はい、ブラウザ（SafariやChrome）から全ての機能をご利用いただけます。アプリのインストールも不要です。" },
              { q: "解約はすぐにできますか？", a: "はい、マイページからいつでも解約可能です。契約期間の縛りはありません。" }
            ].map((item, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 bg-slate-50 text-left font-bold hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-4">
                    <span className="text-brand-yellow font-black text-xl">Q.</span>
                    {item.q}
                  </span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {openFaq === i && (
                  <div className="p-6 bg-white border-t border-slate-100 text-slate-600 font-medium leading-relaxed">
                     <span className="font-bold text-slate-900 mr-2">A.</span>
                     {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA */}
      <section className="py-24 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            あなたの自慢の料理を、<br/>
            もっと多くの人に届けたい。
          </h2>
          <p className="text-lg text-slate-400 mb-12 font-medium">
            まずは無料で、その変化を体験してください。<br/>クレジットカード登録は不要です。
          </p>
          <button 
            onClick={onLogin}
            className="bg-brand-yellow text-slate-900 font-bold py-6 px-16 rounded-xl text-xl hover:scale-105 transition-all shadow-[0px_0px_40px_rgba(250,204,21,0.4)] inline-flex items-center gap-3"
          >
            無料でプロ級写真を作ってみる <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <img 
              src="/logo-white.svg" 
              alt="メシドリAI" 
              className="h-[43px] w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="flex items-center gap-2 hidden">
              <Camera className="w-5 h-5 text-slate-700" />
              <span className="text-lg font-black text-slate-700 tracking-tighter">DISH UP</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 text-xs font-bold items-center">
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="bg-brand-yellow text-slate-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              意見・要望
            </button>
            <button 
              onClick={() => onNavigate?.('commerce')}
              className="hover:text-white transition-colors"
            >
              特定商取引法に基づく表記
            </button>
            <button 
              onClick={() => onNavigate?.('privacy')}
              className="hover:text-white transition-colors"
            >
              プライバシーポリシー
            </button>
            <button 
              onClick={() => onNavigate?.('terms')}
              className="hover:text-white transition-colors"
            >
              利用規約
            </button>
          </div>
            <p className="text-xs font-medium">© 2026 株式会社CONTE. All rights reserved.</p>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </div>
  );
}