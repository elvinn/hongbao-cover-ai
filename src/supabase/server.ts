import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * 创建使用 service_role key 的 Supabase 客户端
 * 用于绕过 RLS 策略，只能在服务端使用
 *
 * 使用场景：
 * - 更新用户 credits（RLS 禁止前端更新）
 * - 更新用户 access_level
 * - 创建新用户记录
 * - 其他需要绕过 RLS 的操作
 *
 * 注意：请确保 SUPABASE_SERVICE_ROLE_KEY 已在环境变量中配置
 */
export function createServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. ' +
        'Please add your service role key to .env.local. ' +
        'Get it from: Supabase Dashboard > Settings > API > service_role key',
    )
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
