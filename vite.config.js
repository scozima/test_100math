import path from 'path'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // mode は 'development' または 'production'
  const isProduction = mode === 'production';

  // 環境ごとに basename を設定
  const basename = isProduction ? '/pj/100math' : '/';

  return {
    plugins: [react()],
    base: './',
    define: {
      // 環境変数を注入
      'process.env.BASENAME': JSON.stringify(basename),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
