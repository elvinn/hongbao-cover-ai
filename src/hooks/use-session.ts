'use client'

import { useContext } from 'react'
import { SessionContext, useSessionContext } from '@/providers/session-provider'

/**
 * Hook: 获取用户会话信息和操作方法
 *
 * 返回值:
 * - userId: Clerk 用户 ID
 * - userData: 用户数据（来自 public.users 表）
 * - credits: 剩余生成次数
 * - creditsExpiresAt: Credits 过期时间
 * - accessLevel: 访问级别 ('free' | 'premium')
 * - generationCount: 累计生成次数
 * - isLoading: 是否正在加载
 * - isAuthenticated: 是否已认证
 * - error: 错误信息
 * - savedInput: 本地保存的输入
 * - refreshUserData: 刷新用户数据
 * - consumeCredit: 消耗一次生成机会
 * - incrementGeneration: 增加生成计数
 * - markAsPaid: 标记为已支付
 * - saveInput: 保存用户输入
 */
export function useSession() {
  return useSessionContext()
}

/**
 * Hook: 检查是否在 SessionProvider 内
 */
export function useHasSession() {
  const context = useContext(SessionContext)
  return context !== null
}
