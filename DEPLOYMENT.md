# Renderへのデプロイガイド

このガイドでは、メシドリAIアプリケーションをRenderにデプロイする手順を説明します。

## 前提条件

1. **Renderアカウントの作成**
   - https://render.com でアカウント作成
   - GitHubアカウントと連携（推奨）

2. **Render APIキーの取得**
   - Render Dashboard → Account Settings → API Keys
   - 新しいAPIキーを作成
   - APIキー: `rnd_5UW2iGNYTtwQErbL22XoVitI3cRl`（既に提供済み）

3. **GitHubリポジトリの準備**
   - GitHubでリポジトリを作成
   - コードをプッシュ

## デプロイ構成

### バックエンド（Web Service）
- **サービスタイプ**: Web Service
- **ビルドコマンド**: `npm install`
- **起動コマンド**: `node server/index.js`
- **環境変数**: 後述
- **永続ディスク**: `server/` ディレクトリにマウント（uploads用）

### フロントエンド（Static Site）
- **サービスタイプ**: Static Site
- **ビルドコマンド**: `npm install && npm run build`
- **公開ディレクトリ**: `dist`
- **環境変数**: 後述

## デプロイ手順

### 1. GitHubリポジトリの準備

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# ファイルをステージング
git add .

# コミット
git commit -m "Initial commit"

# GitHubリポジトリを作成し、リモートを追加
git remote add origin https://github.com/your-username/your-repo.git

# プッシュ
git push -u origin main
```

### 2. Render MCP Serverの設定

`~/.cursor/mcp.json` を作成/編集して以下を追加：

```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer rnd_5UW2iGNYTtwQErbL22XoVitI3cRl"
      }
    }
  }
}
```

Cursorを再起動してMCP Serverを有効化します。

### 3. Render MCP Serverを使用したデプロイ

#### バックエンドWeb Serviceの作成

Cursorで以下のプロンプトを実行：

```
Render MCP Serverを使用して、バックエンドWeb Serviceを作成してください。
- サービス名: dishup-meshirdor-backend
- リポジトリ: [GitHubリポジトリURL]
- ブランチ: main
- ビルドコマンド: npm install
- 起動コマンド: node server/index.js
- 環境: Node
- 永続ディスク: server/ ディレクトリにマウント（1GB）
```

#### フロントエンドStatic Siteの作成

Cursorで以下のプロンプトを実行：

```
Render MCP Serverを使用して、フロントエンドStatic Siteを作成してください。
- サービス名: dishup-meshirdor-frontend
- リポジトリ: [GitHubリポジトリURL]
- ブランチ: main
- ビルドコマンド: npm install && npm run build
- 公開ディレクトリ: dist
```

### 4. 環境変数の設定

#### バックエンド環境変数

Render Dashboardでバックエンドサービスの環境変数を設定：

```
NODE_ENV=production
PORT=3001
STRIPE_SECRET_KEY=sk_live_...（本番用）またはsk_test_...（テスト用）
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FRONTEND_URL=https://dishup-meshirdor-frontend.onrender.com
ALLOWED_ORIGINS=https://dishup-meshirdor-frontend.onrender.com
GITHUB_TOKEN=your_github_token（オプション）
```

#### フロントエンド環境変数

Render Dashboardでフロントエンドサービスの環境変数を設定：

```
VITE_API_BASE_URL=https://dishup-meshirdor-backend.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 5. 永続ディスクの設定（バックエンド）

1. Render Dashboardでバックエンドサービスを開く
2. 「Disk」タブを開く
3. 「Add Disk」をクリック
4. 設定：
   - **Name**: `dishup-storage`
   - **Mount Path**: `/opt/render/project/src/server`
   - **Size**: 1GB

### 6. デプロイの確認

1. バックエンドサービスの「Events」タブでデプロイ状況を確認
2. フロントエンドサービスの「Events」タブでデプロイ状況を確認
3. デプロイ完了後、各サービスのURLにアクセスして動作確認

## 注意事項

### Render MCP Serverの制限

- Render MCP Serverは無料インスタンスの作成をサポートしていないため、Starterプラン（$7/月）以上が必要
- バックエンドのファイルアップロード機能には永続ディスクが必要

### CORS設定

バックエンドのCORS設定は環境変数 `ALLOWED_ORIGINS` で制御されます。
複数のオリジンを許可する場合は、カンマ区切りで指定：
```
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

### 環境変数の優先順位

1. Render Dashboardで設定した環境変数
2. `render.yaml` で設定した環境変数（存在する場合）
3. コード内のデフォルト値

### Stripe Webhookの設定

本番環境では、Stripe DashboardでWebhookエンドポイントを設定：
```
https://dishup-meshirdor-backend.onrender.com/api/stripe/webhook
```

### Firebase設定

本番環境用のFirebaseプロジェクトを使用することを推奨します。
開発環境と本番環境で別々のFirebaseプロジェクトを使用する場合、環境変数を適切に設定してください。

## トラブルシューティング

### デプロイが失敗する

- ビルドログを確認してエラーを特定
- 環境変数が正しく設定されているか確認
- `package.json` の依存関係が正しいか確認

### API接続エラー

- フロントエンドの `VITE_API_BASE_URL` が正しく設定されているか確認
- バックエンドのCORS設定を確認
- バックエンドサービスのURLが正しいか確認

### ファイルアップロードが動作しない

- 永続ディスクが正しくマウントされているか確認
- ディスクのマウントパスが正しいか確認

## 参考リンク

- [Render ドキュメント](https://render.com/docs)
- [Render MCP Server ドキュメント](https://render.com/docs/mcp)
- [Stripe Webhooks ドキュメント](https://stripe.com/docs/webhooks)


