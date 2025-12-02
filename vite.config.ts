
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      // 安全注入：如果 env.API_KEY 不存在，则注入空字符串 ""
      // 这样前端代码 process.env.API_KEY 会是 "" 而不是 undefined，避免某些特定的 JS 错误
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
  };
});
