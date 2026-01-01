/**
 * GitHub Gist API連携サービス
 * ギャラリー履歴をGitHub Gistに保存・取得する
 */

const GITHUB_API_BASE = 'https://api.github.com';
const GIST_FILENAME = 'dishup-gallery.json';
const GIST_DESCRIPTION = 'メシドリAI - ギャラリー履歴';

/**
 * GitHub Personal Access Tokenを取得
 */
function getGitHubToken() {
  return process.env.GITHUB_TOKEN || process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
}

/**
 * GitHub APIリクエストを実行
 */
async function githubRequest(endpoint, options = {}) {
  const token = getGitHubToken();
  
  if (!token) {
    throw new Error('GitHub token not configured. Set GITHUB_TOKEN environment variable.');
  }

  const url = `${GITHUB_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Dishup-AI',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`GitHub API error: ${error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * 新しいGistを作成
 */
export async function createGist(galleryData) {
  try {
    const content = JSON.stringify(galleryData, null, 2);
    
    const gist = await githubRequest('/gists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false, // プライベートGist
        files: {
          [GIST_FILENAME]: {
            content: content,
          },
        },
      }),
    });

    return gist.id;
  } catch (error) {
    console.error('Error creating Gist:', error);
    throw error;
  }
}

/**
 * 既存のGistを更新
 */
export async function updateGist(gistId, galleryData) {
  try {
    const content = JSON.stringify(galleryData, null, 2);
    
    await githubRequest(`/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: {
          [GIST_FILENAME]: {
            content: content,
          },
        },
      }),
    });

    return true;
  } catch (error) {
    console.error('Error updating Gist:', error);
    throw error;
  }
}

/**
 * Gistからギャラリーデータを取得
 */
export async function getGist(gistId) {
  try {
    const gist = await githubRequest(`/gists/${gistId}`);
    
    const file = gist.files[GIST_FILENAME];
    if (!file) {
      return [];
    }

    const content = file.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error getting Gist:', error);
    throw error;
  }
}

/**
 * Gist IDを保存（ローカルファイルに保存）
 */
export async function saveGistId(gistId) {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const gistIdFile = path.join(__dirname, '../storage/gist-id.txt');

  try {
    await fs.writeFile(gistIdFile, gistId, 'utf-8');
  } catch (error) {
    console.error('Error saving Gist ID:', error);
  }
}

/**
 * 保存されたGist IDを取得
 */
export async function getGistId() {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const gistIdFile = path.join(__dirname, '../storage/gist-id.txt');

  try {
    const gistId = await fs.readFile(gistIdFile, 'utf-8');
    return gistId.trim();
  } catch {
    return null;
  }
}

/**
 * GitHub連携が有効かチェック
 */
export function isGitHubEnabled() {
  return !!getGitHubToken();
}





