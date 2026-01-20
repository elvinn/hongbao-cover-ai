'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import type { DbUser, AccessLevel } from '@/types/database'

// 默认值（与数据库默认值一致）
const DEFAULT_CREDITS = 1
const DEFAULT_ACCESS_LEVEL: AccessLevel = 'free'
const DEFAULT_GENERATION_COUNT = 0

interface SessionContextType {
  // Clerk 用户 ID
  userId: string | null

  // 用户数据 (来自 public.users)
  userData: DbUser | null

  // 快捷访问字段
  credits: number
  accessLevel: AccessLevel
  generationCount: number

  // 状态
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // 操作方法
  refreshUserData: () => Promise<void>
  markAsPaid: (creditsToAdd?: number) => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export { SessionContext }

export function SessionProvider({ children }: { children: ReactNode }) {
  // Clerk 状态
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()

  // 用户数据状态
  const [userData, setUserData] = useState<DbUser | null>(null)

  // 加载状态
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 防止重复加载
  const isLoadingUserData = useRef(false)

  // 从 API 加载用户数据（API 会自动创建新用户）
  const loadUserData = useCallback(async () => {
    if (isLoadingUserData.current) return
    isLoadingUserData.current = true

    try {
      setError(null)
      const response = await fetch('/api/user')

      if (!response.ok) {
        // 如果用户不存在，API 会自动创建
        if (response.status === 404) {
          // 创建新用户 - 通过调用 credits API 触发
          const createResponse = await fetch('/api/user/credits')
          if (createResponse.ok) {
            const data = await createResponse.json()
            setUserData({
              id: user?.id || '',
              credits: data.credits ?? DEFAULT_CREDITS,
              access_level: data.accessLevel ?? DEFAULT_ACCESS_LEVEL,
              generation_count:
                data.generationCount ?? DEFAULT_GENERATION_COUNT,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            return
          }
        }
        throw new Error('Failed to load user data')
      }

      const data = await response.json()
      setUserData({
        id: data.id,
        credits: data.credits,
        access_level: data.accessLevel,
        generation_count: data.generationCount,
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      })
    } catch (err) {
      console.error('Failed to load user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load user data')
    } finally {
      isLoadingUserData.current = false
    }
  }, [user?.id])

  // 初始化：只有在 Clerk 加载完成后才处理用户数据
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return

    // 如果用户已登录，加载用户数据
    if (isSignedIn && user) {
      loadUserData().finally(() => {
        setIsLoading(false)
      })
    } else {
      // 未登录，清除用户数据
      setUserData(null)
      setIsLoading(false)
    }
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user, loadUserData])

  // 刷新用户数据
  const refreshUserData = useCallback(async () => {
    if (!isSignedIn) return
    await loadUserData()
  }, [isSignedIn, loadUserData])

  // 标记为已支付（刷新用户数据以获取最新状态）
  const markAsPaid = useCallback(
    async (creditsToAdd: number = 1) => {
      if (!isSignedIn) return

      // 先乐观更新本地状态
      setUserData((prev) =>
        prev
          ? {
              ...prev,
              access_level: 'premium',
              credits: prev.credits + creditsToAdd,
            }
          : prev,
      )

      // 然后从服务器刷新以确保数据一致
      try {
        const response = await fetch('/api/user/credits')
        if (response.ok) {
          const data = await response.json()
          setUserData((prev) =>
            prev
              ? {
                  ...prev,
                  credits: data.credits,
                  access_level: data.accessLevel,
                  generation_count: data.generationCount,
                }
              : prev,
          )
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    },
    [isSignedIn],
  )

  return (
    <SessionContext.Provider
      value={{
        userId: user?.id ?? null,
        userData,
        credits: userData?.credits ?? DEFAULT_CREDITS,
        accessLevel: userData?.access_level ?? DEFAULT_ACCESS_LEVEL,
        generationCount: userData?.generation_count ?? DEFAULT_GENERATION_COUNT,
        isLoading: isLoading || !isAuthLoaded || !isUserLoaded,
        isAuthenticated: !!isSignedIn && !!userData,
        error,
        refreshUserData,
        markAsPaid,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider')
  }
  return context
}
