import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CommerceLawProps {
  onBack: () => void;
}

export const CommerceLaw: React.FC<CommerceLawProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-black text-slate-900 mb-4">特定商取引法に基づく表記</h1>
          <p className="text-sm text-slate-500 mb-12">最終更新日: 2025年1月27日</p>

          <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-slate-700 leading-relaxed">
              特定商取引法（特定商取引に関する法律）に基づき、以下の通り表記いたします。
              当サービスは通信販売に該当するため、消費者保護の観点から、以下の情報を明示しております。
            </p>
          </div>

          <div className="space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">事業者名</h2>
              <p className="mb-4">株式会社CONTE / CONTE inc.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">代表者</h2>
              <p className="mb-4">代表取締役 吉口 慶</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">所在地</h2>
              <p className="mb-4">〒443-0034 愛知県蒲郡市港町13-33</p>
              <p className="text-sm text-slate-600">
                お問い合わせは、下記のお問い合わせ先までご連絡ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">お問い合わせ先</h2>
              <p className="mb-4">
                メールアドレス: support@example.com<br />
                電話番号: お問い合わせフォームよりご連絡ください<br />
                受付時間: 平日 10:00〜18:00（土日祝日を除く）
              </p>
              <p className="text-sm text-slate-600">
                お問い合わせへのご返信は、受付時間内に順次対応いたします。
                お急ぎの場合は、お問い合わせフォームにその旨をご記載ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">販売価格</h2>
              <p className="mb-4">
                各プランの料金は、サービス内の料金ページに表示されている金額とします。
                価格は税込表示です。表示価格に消費税が含まれています。
              </p>
              <p className="text-sm text-slate-600">
                価格は予告なく変更する場合がありますが、既にご契約いただいているプランについては、
                契約期間中は変更前の価格が適用されます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">支払方法</h2>
              <p className="mb-4">
                以下の決済方法をご利用いただけます：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>クレジットカード決済（Stripe経由）</li>
                <li>その他、当サービスが指定する決済方法</li>
              </ul>
              <p className="text-sm text-slate-600">
                クレジットカード決済の場合、Visa、Mastercard、American Express、JCBなどの主要なクレジットカードをご利用いただけます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">支払時期</h2>
              <p className="mb-4">
                クレジットカード決済の場合、各決済代行会社の規約に従います。
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>月額プランの場合、毎月の自動更新時に課金されます</li>
                <li>年額プランの場合、契約開始時および更新時に一括で課金されます</li>
                <li>その他のプランについては、各プランの契約条件に従います</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">サービス提供時期</h2>
              <p className="mb-4">
                お支払い完了後、即座にサービスをご利用いただけます。
              </p>
              <p className="text-sm text-slate-600">
                お支払い完了後、自動的にアカウントが有効化され、すぐにサービスをご利用開始いただけます。
                システムの都合により、最大24時間程度かかる場合がございます。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">返品・返金・キャンセルについて</h2>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">返品・返金について</h3>
                <p className="mb-4">
                  デジタルコンテンツの性質上、お支払い後の返金は原則として受け付けておりません。
                  ただし、以下の場合に限り、返金対応を行う場合があります：
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>サービスに重大な不具合があり、当社の責に帰すべき事由によりサービスを提供できない場合</li>
                  <li>当社が明示的に返金を認めた場合</li>
                  <li>その他、当社が合理的と判断した場合</li>
                </ul>
                <p className="text-sm text-slate-600 mb-4">
                  返金を希望される場合は、お問い合わせフォームよりご連絡ください。
                  返金の可否および方法については、個別にご案内いたします。
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">キャンセル・解約について</h3>
                <p className="mb-4">
                  月額プランおよび年額プランの解約については、マイページからいつでも可能です。
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>解約後は、現在の請求期間終了時点でサービスが終了します</li>
                  <li>解約後も、既に支払い済みの期間についてはサービスをご利用いただけます</li>
                  <li>解約手続き後、次回の自動更新は行われません</li>
                </ul>
                <p className="text-sm text-slate-600">
                  解約に関するご不明点がございましたら、お問い合わせフォームよりご連絡ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">動作環境</h2>
              <p className="mb-4">
                当サービスは、以下の環境での動作を推奨しています：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>対応ブラウザ: Google Chrome（最新版）、Safari（最新版）、Firefox（最新版）、Microsoft Edge（最新版）</li>
                <li>モバイル: iOS Safari、Android Chrome</li>
                <li>インターネット接続環境が必要です</li>
              </ul>
              <p className="text-sm text-slate-600">
                上記以外の環境でも動作する場合がありますが、すべての機能が正常に動作することを保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">事業内容</h2>
              <p className="mb-4">ブランディング／グラフィックデザイン／WEB／動画</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-4">その他の重要事項</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">クーリング・オフについて</h3>
                  <p className="mb-4">
                    通信販売については、特定商取引法に基づくクーリング・オフ制度の適用はありません。
                    ただし、上記の返金ポリシーに基づき、当社が認めた場合には返金対応を行います。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">個人情報の取り扱い</h3>
                  <p className="mb-4">
                    お客様の個人情報は、当社のプライバシーポリシーに従って適切に管理いたします。
                    詳細については、プライバシーポリシーページをご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">免責事項</h3>
                  <p className="mb-4">
                    当サービスは、現状のまま提供されるものであり、その完全性、正確性、有用性、特定目的への適合性について、
                    一切の保証をいたしません。また、当サービスの利用により生じた損害について、当社は一切の責任を負いません。
                  </p>
                </div>
              </div>
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

