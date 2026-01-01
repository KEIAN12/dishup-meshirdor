<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# メシドリAI - 料理写真生成SaaS

プロ仕様のAI料理写真生成サービス。スマホ写真を3秒で「行列店のメニュー」へ変換。

View your app in AI Studio: https://ai.studio/apps/drive/10puyDJcRZ2VwsZc7zlDaLMfZRMH07aE7

## 機能

- **AI画像生成**: Gemini 3 Pro Image Preview (Nano Banana Pro) を使用した2K高解像度画像生成
- **アスペクト比選択**: 生成前に4:3、1:1、9:16から選択可能
- **ビフォーアフタースライダー**: 生成前後の画像を簡単に比較
- **ワンタップリサイズ**: 用途に合わせて1:1、9:16、4:3にリサイズ
- **マイ・ギャラリー**: 生成した画像をクラウドに保存（1アカウント5枚まで）
- **GitHub連携**: 履歴をGitHub Gistに自動保存（オプション）
- **店舗アセット管理**: 店舗写真・テーブル写真を保存し、生成時に参照

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、必要な環境変数を設定：

```bash
# Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id

# API Base URL (Frontend)
VITE_API_BASE_URL=http://localhost:3001

# Stripe Configuration (Backend - server/.env または環境変数)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
# OR use file path:
# FIREBASE_SERVICE_ACCOUNT_PATH=./server/config/firebase-service-account.json

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:3000
```

詳細は `.env.example` を参照してください。

**GitHub連携（オプション）:**

履歴をGitHub Gistに保存する場合は、GitHub Personal Access Tokenを設定：

```
GITHUB_TOKEN=your_github_personal_access_token
```

GitHub Personal Access Tokenの取得方法：
1. GitHubにログイン
2. Settings → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. `gist` スコープにチェックを入れる
5. トークンを生成してコピー
6. `.env.local` に `GITHUB_TOKEN=your_token_here` を追加

**注意**: GitHub連携が無効でも、ローカルに履歴は保存されます。

**意見要望フォーム（Googleスプレッドシート連携）:**

ユーザーからの意見・要望・リクエストをGoogleスプレッドシートに保存します。

セットアップ手順：
1. Googleスプレッドシートを新規作成
2. スプレッドシートのIDをコピー（URLの `/d/` と `/edit` の間の文字列）
3. Google Apps Scriptエディタを開く（拡張機能 > Apps Script）
4. `google-apps-script.js` のコードを貼り付け
5. `SPREADSHEET_ID` を実際のスプレッドシートIDに置き換え
6. デプロイ > 新しいデプロイ > 種類: ウェブアプリ
7. 次のユーザーとして実行: 自分
8. アクセスできるユーザー: 全員
9. デプロイしてURLをコピー
10. `.env.local` に `VITE_GOOGLE_SCRIPT_URL=コピーしたURL` を追加

**記録される情報:**
- タイムスタンプ
- メールアドレス（任意）
- 意見・要望
- ユーザーエージェント

**注意**: URLが設定されていない場合でも、アプリケーションは正常に動作します（意見要望は記録されません）。

### 3. 開発サーバーの起動

**フロントエンド（ポート3000）:**
```bash
npm run dev
```

**バックエンドAPI（ポート3001）:**
```bash
npm run server
```

別のターミナルで両方を起動してください。

## 使用方法

1. ブラウザで http://localhost:3000 にアクセス
2. 料理の写真をアップロード
3. スタイル（メニュー用/SNS用）を選択
4. アスペクト比（4:3、1:1、9:16）を選択
5. （オプション）店舗アセットを選択
6. 「写真を生成する」をクリック
7. 生成後、ビフォーアフタースライダーで比較
8. ワンタップリサイズで用途に合わせてダウンロード

## 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite, Tailwind CSS
- **バックエンド**: Express.js, Node.js
- **AI**: Google Gemini 3 Pro Image Preview
- **画像処理**: Canvas API

## プロジェクト構成

```
dishup-meshirdor/
├── server/              # バックエンドAPI
│   ├── index.js        # Expressサーバー
│   ├── routes/         # APIルート
│   ├── storage/        # JSONメタデータ
│   └── uploads/       # 画像ファイル
├── components/         # Reactコンポーネント
├── services/          # APIサービス層
├── utils/             # ユーティリティ関数
└── types.ts          # TypeScript型定義
```
