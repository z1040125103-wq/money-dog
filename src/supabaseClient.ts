import { createClient } from '@supabase/supabase-js';

// 这里使用了 Vite 的环境变量
// 在本地开发时，请在项目根目录创建 .env 文件
// 内容如下：
// VITE_SUPABASE_URL=你的Supabase项目URL
// VITE_SUPABASE_ANON_KEY=你的Supabase项目AnonKey

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 简单的检查，确保 URL 和 Key 都不为空
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn("缺少 Supabase 环境变量，应用将进入配置引导模式。");
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');