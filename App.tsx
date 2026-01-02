
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CommerceLaw } from './components/CommerceLaw';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { CheckoutCancel } from './components/CheckoutCancel';
import { onAuthStateChange, getCurrentUser } from './services/authService';

const App: React.FC = () => {
  // URLパスに基づいてビューを決定
  const getInitialView = (): 'landing' | 'dashboard' | 'privacy' | 'terms' | 'commerce' | 'checkout-success' | 'checkout-cancel' => {
    const path = window.location.pathname;
    if (path === '/checkout/success') return 'checkout-success';
    if (path === '/checkout/cancel') return 'checkout-cancel';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/privacy') return 'privacy';
    if (path === '/terms') return 'terms';
    if (path === '/commerce') return 'commerce';
    return 'landing';
  };

  const [view, setView] = useState<'landing' | 'dashboard' | 'privacy' | 'terms' | 'commerce' | 'checkout-success' | 'checkout-cancel'>(getInitialView());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsCheckingAuth(false);
      
      // Dashboardにアクセスしようとしているが未認証の場合、ランディングページにリダイレクト
      if (!user && (view === 'dashboard' || window.location.pathname === '/dashboard')) {
        setView('landing');
        window.history.replaceState({}, '', '/');
      }
    });

    // 初回チェック
    const currentUser = getCurrentUser();
    setIsAuthenticated(!!currentUser);
    setIsCheckingAuth(false);
    
    // Dashboardにアクセスしようとしているが未認証の場合、ランディングページにリダイレクト
    if (!currentUser && (view === 'dashboard' || window.location.pathname === '/dashboard')) {
      setView('landing');
      window.history.replaceState({}, '', '/');
    }

    return () => unsubscribe();
  }, []);

  // URL変更を監視
  useEffect(() => {
    const handlePopState = () => {
      const newView = getInitialView();
      // Dashboardにアクセスしようとしているが未認証の場合、ランディングページにリダイレクト
      if (newView === 'dashboard' && !isAuthenticated) {
        setView('landing');
        window.history.replaceState({}, '', '/');
      } else {
        setView(newView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  if (view === 'landing') {
    return <LandingPage onLogin={() => setView('dashboard')} onNavigate={setView} />;
  }

  if (view === 'privacy') {
    return <PrivacyPolicy onBack={() => setView('landing')} />;
  }

  if (view === 'terms') {
    return <TermsOfService onBack={() => setView('landing')} />;
  }

  if (view === 'commerce') {
    return <CommerceLaw onBack={() => setView('landing')} />;
  }

  if (view === 'checkout-success') {
    return <CheckoutSuccess onNavigate={(v) => setView(v)} />;
  }

  if (view === 'checkout-cancel') {
    return <CheckoutCancel onNavigate={(v) => setView(v)} />;
  }

  // Dashboardは認証必須
  if (view === 'dashboard') {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600 font-bold">読み込み中...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      // 未認証の場合はランディングページにリダイレクト
      setView('landing');
      window.history.replaceState({}, '', '/');
      return <LandingPage onLogin={() => setView('dashboard')} onNavigate={setView} />;
    }
    return <Dashboard onNavigate={setView} />;
  }

  return <LandingPage onLogin={() => setView('dashboard')} onNavigate={setView} />;
};

export default App;
