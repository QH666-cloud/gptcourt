
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量，允许 process.env 在 Vite 构建中被正确替换
  // 这一步非常重要，否则 SDK 里的 process.env.API_KEY 会报错 process is not defined
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    define: {
      // 简单粗暴地将 process.env.API_KEY 替换为字符串常量
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
