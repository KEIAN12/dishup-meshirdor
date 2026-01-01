import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-black text-slate-900 mb-8">利用規約</h1>
          <p className="text-sm text-slate-500 mb-12">最終更新日: 2025年12月27日</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">1. 適用範囲</h2>
              <p className="mb-4">
                本規約は、メシドリAI（以下「当サービス」）の利用に関する条件を定めるものです。
                当サービスを利用することにより、本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">2. サービスの内容</h2>
              <p className="mb-4">
                当サービスは、AI技術を用いて料理写真を高品質な画像に変換するサービスを提供します。
                サービスの内容は予告なく変更される場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">3. 利用登録</h2>
              <p className="mb-4">
                当サービスの利用には、利用登録が必要な場合があります。
                登録情報は正確にご入力いただき、最新の情報に保つようお願いします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">4. 禁止事項</h2>
              <p className="mb-4">ユーザーは、以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当サービスの内容等、当サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
                <li>当サービス、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当サービスによって得られた情報を商業的に利用する行為</li>
                <li>当サービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセス、不正な方法による利用</li>
                <li>その他、当サービスが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">5. 知的財産権</h2>
              <p className="mb-4">
                当サービスに含まれるコンテンツ（テキスト、画像、ロゴなど）の知的財産権は、
                当サービスまたは正当な権利者に帰属します。
                ユーザーが生成した画像の著作権は、ユーザーに帰属します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">6. 有料サービスの利用</h2>
              <p className="mb-4">
                有料プランをご利用の場合、所定の料金をお支払いいただく必要があります。
                料金の支払い方法、返金ポリシーについては、特定商取引法に基づく表記をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">7. 免責事項</h2>
              <p className="mb-4">
                当サービスは、以下の事項について一切の責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>当サービスの中断、停止、終了、利用不能</li>
                <li>当サービスを通じて得た情報の正確性、有用性</li>
                <li>ユーザー間でのトラブル</li>
                <li>当サービスを利用したことにより生じた損害</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">8. 規約の変更</h2>
              <p className="mb-4">
                当サービスは、必要に応じて本規約を変更することがあります。
                変更後の規約は、当サービス上に掲載した時点から効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">9. お問い合わせ</h2>
              <p className="mb-4">
                本規約に関するお問い合わせは、お問い合わせフォームよりご連絡ください。
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

