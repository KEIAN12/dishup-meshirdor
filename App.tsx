
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { CommerceLaw } from './components/CommerceLaw';
import { CheckoutSuccess } from './components/CheckoutSuccess';
import { CheckoutCancel } from './components/CheckoutCancel';

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

  // URL変更を監視
  useEffect(() => {
    const handlePopState = () => {
      setView(getInitialView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  return <Dashboard onNavigate={setView} />;
};

export default App;
