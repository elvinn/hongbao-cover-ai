import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/supabase/server'
import type { DbUser } from '@/types/database'

export interface AuthResult {
  user: { id: string } | null
  error: string | null
}

/**
 * 在服务端验证用户身份（使用 Clerk）
 * 用于 API routes 中验证请求是否来自已认证用户
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return {
        user: null,
        error: 'Not authenticated',
      }
    }

    return {
      user: { id: userId },
      error: null,
    }
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err.message : 'Authentication failed',
    }
  }
}

/**
 * 确保用户存在于数据库中，如果不存在则创建
 *
 * @param userId - Clerk 用户 ID
 */
export async function ensureUserExists(userId: string): Promise<DbUser> {
  const supabase = createServiceRoleClient()

  // 尝试获取用户
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (existingUser) return existingUser as DbUser

  // 创建新用户
  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      credits: 1,
      access_level: 'free',
      generation_count: 0,
    })
    .select()
    .single()

  if (error) {
    // 如果是唯一约束冲突（并发创建），重新获取用户
    if (error.code === '23505') {
      const { data: retryUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (retryUser) return retryUser as DbUser
    }
    throw error
  }

  return newUser as DbUser
}

/**
 * 验证用户是否有足够的 credits
 *
 * @param userId - 用户 ID
 */
export async function checkUserCredits(
  userId: string,
): Promise<{ hasCredits: boolean; credits: number }> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return { hasCredits: false, credits: 0 }
  }

  return {
    hasCredits: data.credits > 0,
    credits: data.credits,
  }
}
