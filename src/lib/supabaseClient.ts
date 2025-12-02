
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ [Supabase] 环境变量缺失！请检查 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。");
} else {
  console.log("✅ [Supabase] 客户端已初始化，URL:", supabaseUrl);
}

// 使用非空断言或空字符串兜底，防止类型错误
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
