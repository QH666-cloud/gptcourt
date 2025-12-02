
import { createClient } from '@supabase/supabase-js';

// 这里的环境变量需要在 .env 文件或 Vercel 后台配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase 环境变量未配置！实时同步功能将无法使用。");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
