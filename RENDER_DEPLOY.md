# Render MCP Serverを使用したデプロイ手順

このガイドでは、Render MCP Serverを使用して自動的にデプロイする手順を説明します。

## ステップ1: Render MCP Serverの設定

まず、Render MCP Serverを有効化する必要があります。

### MCP設定ファイルの作成

`~/.cursor/mcp.json` ファイルを作成または編集して、以下を追加してください：

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

**重要**: Cursorを再起動してMCP Serverを有効化してください。

## ステップ2: GitHubリポジトリの準備

Renderにデプロイするには、GitHubリポジトリが必要です。

### Gitリポジトリの初期化（まだの場合）

```bash
# Gitリポジトリを初期化
git init

# ファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Ready for Render deployment"

# GitHubでリポジトリを作成後、リモートを追加
git remote add origin https://github.com/your-username/your-repo-name.git

# プッシュ
git branch -M main
git push -u origin main
```

## ステップ3: Render MCP Serverを使用したデプロイ

Cursorで以下のプロンプトを実行してください：

### バックエンドWeb Serviceの作成

```
Render MCP Serverを使用して、バックエンドWeb Serviceを作成してください。

サービス名: dishup-meshirdor-backend
リポジトリ: https://github.com/[your-username]/[your-repo-name]
ブランチ: main
ビルドコマンド: npm install
起動コマンド: node server/index.js
環境: Node
インスタンスタイプ: starter（$7/月）
永続ディスク: 
  - 名前: dishup-storage
  - マウントパス: /opt/render/project/src/server
  - サイズ: 1GB
```

### フロントエンドStatic Siteの作成

バックエンドがデプロイされた後、フロントエンドを作成：

```
Render MCP Serverを使用して、フロントエンドStatic Siteを作成してください。

サービス名: dishup-meshirdor-frontend
リポジトリ: https://github.com/[your-username]/[your-repo-name]
ブランチ: main
ビルドコマンド: npm install && npm run build
公開ディレクトリ: dist
```

## ステップ4: 環境変数の設定

デプロイ後、Render Dashboardで環境変数を設定してください。

### バックエンド環境変数

Render Dashboard → dishup-meshirdor-backend → Environment で以下を設定：

```
NODE_ENV=production
PORT=3001
STRIPE_SECRET_KEY=sk_test_...（またはsk_live_...）
STRIPE_WEBHOOK_SECRET=whsec_...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FRONTEND_URL=https://dishup-meshirdor-frontend.onrender.com
ALLOWED_ORIGINS=https://dishup-meshirdor-frontend.onrender.com
GITHUB_TOKEN=your_github_token（オプション）
```

### フロントエンド環境変数

Render Dashboard → dishup-meshirdor-frontend → Environment で以下を設定：

```
VITE_API_BASE_URL=https://dishup-meshirdor-backend.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

**注意**: バックエンドのURLは、実際にデプロイされたURLに置き換えてください。

## ステップ5: デプロイの確認

1. Render Dashboardで各サービスのデプロイ状況を確認
2. デプロイ完了後、フロントエンドのURLにアクセス
3. 動作確認

## トラブルシューティング

### MCP Serverが動作しない

- Cursorを再起動
- `~/.cursor/mcp.json` の設定を確認
- Render APIキーが正しいか確認

### デプロイが失敗する

- ビルドログを確認
- 環境変数が正しく設定されているか確認
- GitHubリポジトリが正しく連携されているか確認

### API接続エラー

- フロントエンドの `VITE_API_BASE_URL` がバックエンドのURLと一致しているか確認
- CORS設定を確認


