import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-8">プライバシーポリシー</h1>
          <p className="text-sm text-slate-500 mb-12">最終更新日: 2025年12月27日</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">1. はじめに</h2>
              <p className="mb-4">
                メシドリAI（以下「当サービス」）は、ユーザーの個人情報の保護を重要な責務と考えています。
                本プライバシーポリシーは、当サービスがどのように個人情報を収集、使用、保護するかについて説明します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">2. 収集する情報</h2>
              <p className="mb-4">当サービスは、以下の情報を収集する場合があります：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>アカウント情報（メールアドレス、ユーザー名など）</li>
                <li>利用状況情報（生成した画像、使用回数など）</li>
                <li>技術情報（IPアドレス、ブラウザ情報、デバイス情報など）</li>
                <li>アップロードされた画像データ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">3. 情報の利用目的</h2>
              <p className="mb-4">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>サービスの提供・運営</li>
                <li>ユーザーサポートの提供</li>
                <li>サービスの改善・新機能の開発</li>
                <li>不正利用の防止</li>
                <li>利用規約違反の調査</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">4. 情報の管理</h2>
              <p className="mb-4">
                当サービスは、個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して、
                合理的な安全対策を講じます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">5. 第三者への提供</h2>
              <p className="mb-4">
                当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">6. Cookieについて</h2>
              <p className="mb-4">
                当サービスは、サービスの提供を改善するためにCookieを使用する場合があります。
                ブラウザの設定により、Cookieの受け入れを拒否することができます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">7. お問い合わせ</h2>
              <p className="mb-4">
                個人情報に関するお問い合わせは、お問い合わせフォームよりご連絡ください。
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <button
              onClick={onBack}
              className="bg-slate-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors"
            >
              トップページに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

