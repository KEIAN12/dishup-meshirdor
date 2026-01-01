# Stripe決済とGoogle認証のセットアップガイド

このガイドでは、Stripe決済とGoogle認証機能を有効にするための手順を説明します。

## 1. Firebase プロジェクトのセットアップ

### 1.1 Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力して作成

### 1.2 Authentication の有効化

1. Firebase Consoleでプロジェクトを選択
2. 左メニューから「Authentication」を選択
3. 「始める」をクリック
4. 「Sign-in method」タブを開く
5. 「Google」プロバイダーを有効化
   - プロジェクトのサポートメールを設定
   - 「保存」をクリック

### 1.3 Web アプリの追加

1. Firebase Consoleのプロジェクト設定（⚙️アイコン）を開く
2. 「アプリを追加」→「Web」を選択
3. アプリのニックネームを入力（例: "メシドリAI Web"）
4. 「アプリを登録」をクリック
5. 表示された設定情報をコピー：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     appId: "1:..."
   };
   ```

### 1.4 サービスアカウントキーの取得

1. Firebase Consoleのプロジェクト設定を開く
2. 「サービスアカウント」タブを選択
3. 「新しい秘密鍵の生成」をクリック
4. JSONファイルがダウンロードされる
5. このファイルを `server/config/firebase-service-account.json` に保存
   - または、環境変数 `FIREBASE_SERVICE_ACCOUNT_KEY` にJSON文字列として設定

## 2. Stripe DashboardでのPrice作成

### 2.1 Stripe Dashboardにログイン

1. [Stripe Dashboard](https://dashboard.stripe.com/) にアクセス
2. テストモードで作業することを確認

### 2.2 各プラン用のProductとPriceを作成

#### ライトプラン（月額980円）

1. 「Products」→「Add product」をクリック
2. 以下の情報を入力：
   - **Name**: ライトプラン
   - **Description**: 個人・趣味向けプラン
3. 「Add price」をクリック
4. 価格設定：
   - **Price**: 980
   - **Currency**: JPY（日本円）
   - **Billing period**: Monthly（月次）
   - **Lookup key**: `light-plan`（重要！）
5. 「Save product」をクリック

#### スタンダードプラン（月額2,980円）

1. 同様の手順で作成：
   - **Name**: スタンダードプラン
   - **Description**: 個人飲食店向けプラン
   - **Price**: 2980
   - **Lookup key**: `standard-plan`

#### プロプラン（月額9,800円）

1. 同様の手順で作成：
   - **Name**: プロプラン
   - **Description**: 業者・代行向けプラン
   - **Price**: 9800
   - **Lookup key**: `pro-plan`

### 2.3 Webhookエンドポイントの設定（本番環境用）

1. Stripe Dashboard → 「Developers」→「Webhooks」
2. 「Add endpoint」をクリック
3. エンドポイントURLを入力：
   ```
   https://your-domain.com/api/stripe/webhook
   ```
4. イベントを選択：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 「Add endpoint」をクリック
6. 「Signing secret」をコピー（`whsec_...`で始まる文字列）

### 2.4 テスト環境でのWebhook（ローカル開発用）

ローカル開発環境では、Stripe CLIを使用してWebhookを転送：

```bash
# Stripe CLIをインストール（未インストールの場合）
# macOS: brew install stripe/stripe-cli/stripe
# または https://stripe.com/docs/stripe-cli からダウンロード

# Stripe CLIでログイン
stripe login

# Webhookをローカルに転送
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

実行すると、`whsec_...`で始まるWebhook signing secretが表示されます。これを環境変数 `STRIPE_WEBHOOK_SECRET` に設定してください。

## 3. 環境変数の設定

### 3.1 フロントエンド（`.env.local`）

プロジェクトルートに `.env.local` ファイルを作成：

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:...

# API Base URL
VITE_API_BASE_URL=http://localhost:3001
```

### 3.2 バックエンド（環境変数または`.env`）

サーバー起動時に以下の環境変数を設定：

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # テスト環境では stripe listen で取得

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# またはファイルパス:
# FIREBASE_SERVICE_ACCOUNT_PATH=./server/config/firebase-service-account.json

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:3000

# GitHub Token (Optional)
GITHUB_TOKEN=your_github_token_here
```

環境変数の設定方法：

**方法1: `.env`ファイル（推奨）**
- `server/.env` ファイルを作成して上記の内容を記述

**方法2: 環境変数として直接設定**
```bash
export STRIPE_SECRET_KEY=sk_test_...
export FIREBASE_PROJECT_ID=your-project-id
# ...
```

**方法3: Renderなどのクラウド環境**
- Render Dashboardの環境変数設定から設定

## 4. 動作確認

### 4.1 サーバーの起動

```bash
# バックエンド
npm run server

# フロントエンド（別ターミナル）
npm run dev
```

### 4.2 テスト手順

1. ブラウザで `http://localhost:3000` にアクセス
2. 「Googleでログイン」をクリック
3. Googleアカウントでログイン
4. ダッシュボードが表示されることを確認
5. ランディングページに戻り、有料プランを選択
6. Stripe Checkoutページが表示されることを確認
7. テストカードで決済を完了：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付
   - CVC: 任意の3桁
   - 郵便番号: 任意
8. 決済成功ページが表示されることを確認
9. ダッシュボードでプランが更新されていることを確認

## 5. トラブルシューティング

### Firebase認証が動作しない

- `.env.local` のFirebase設定が正しいか確認
- Firebase ConsoleでAuthenticationが有効になっているか確認
- ブラウザのコンソールでエラーを確認

### Stripe Checkoutが動作しない

- Stripe DashboardでPriceが正しく作成されているか確認
- Lookup Keyが正しいか確認（`light-plan`, `standard-plan`, `pro-plan`）
- 環境変数 `STRIPE_SECRET_KEY` が設定されているか確認
- サーバーのログでエラーを確認

### Webhookが動作しない

- ローカル開発: `stripe listen` が実行されているか確認
- 本番環境: WebhookエンドポイントURLが正しいか確認
- Webhook Secretが正しく設定されているか確認
- Stripe DashboardのWebhookログでイベントが送信されているか確認

## 6. 本番環境への移行

1. Firebase Consoleで本番用のプロジェクトを作成（または既存プロジェクトを使用）
2. Stripe Dashboardで本番モードに切り替え
3. 本番用のAPIキーと環境変数を設定
4. Webhookエンドポイントを本番URLに設定
5. 環境変数を本番環境に設定

## 参考リンク

- [Firebase Authentication ドキュメント](https://firebase.google.com/docs/auth)
- [Stripe Checkout ドキュメント](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks ドキュメント](https://stripe.com/docs/webhooks)


