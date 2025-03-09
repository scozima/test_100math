import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// ESMでの__dirnameの代替
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
  // mode は 'development' または 'production'
  const isProduction = mode === 'production';

  // 環境ごとに basename を設定
  const basename = isProduction ? '/pj/100math' : '/';

  return {
    plugins: [react()],
    base: isProduction ? '/pj/100math/' : '/',
    define: {
      // 環境変数を注入
      'process.env.BASENAME': JSON.stringify(basename),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      // デフォルトのポート5173を使用
      port: 5173,
    },
  };
});
