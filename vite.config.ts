import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
        let env: Record<string, string> = {};
        try {
          env = loadEnv(mode, '.', '');
        } catch (error) {
          // .envファイルが存在しない場合は空のオブジェクトを使用
          console.warn('環境変数ファイルの読み込みに失敗しました:', error);
        }
        return {
          server: {
            port: 3000,
            host: '0.0.0.0',
          },
          plugins: [react()],
          define: {
            'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
            'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
          },
          resolve: {
            alias: {
              '@': path.resolve(__dirname, '.'),
            }
          }
        };
    });
