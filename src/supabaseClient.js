import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY

// 添加环境变量验证
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file:')
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? '✓' : '✗ Missing')
  console.error('REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY:', supabaseAnonKey ? '✓' : '✗ Missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})