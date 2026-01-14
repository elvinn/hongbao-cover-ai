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
import type { CoverStyle } from '@/types/hongbao'
import type { DbUser, AccessLevel } from '@/types/database'

// 本地存储 key
const INPUT_STORAGE_KEY = 'hongbao_input'

// 默认值（与数据库默认值一致）
const DEFAULT_CREDITS = 1
const DEFAULT_ACCESS_LEVEL: AccessLevel = 'free'
const DEFAULT_GENERATION_COUNT = 0

export interface SavedInput {
  description: string
  style: CoverStyle
}

interface SessionContextType {
  // Clerk 用户 ID
  userId: string | null

  // 用户数据 (来自 public.users)
  userData: DbUser | null

  // 快捷访问字段
  credits: number
  creditsExpiresAt: string | null
  accessLevel: AccessLevel
  generationCount: number

  // 状态
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // 本地输入缓存
  savedInput: SavedInput | null

  // 操作方法
  refreshUserData: () => Promise<void>
  consumeCredit: () => Promise<boolean>
  incrementGeneration: () => Promise<void>
  markAsPaid: (creditsToAdd?: number) => Promise<void>
  saveInput: (description: string, style: CoverStyle) => void
}

const SessionContext = createContext<SessionContextType | null>(null)

export { SessionContext }

export function SessionProvider({ children }: { children: ReactNode }) {
  // Clerk 状态
  const { user, isLoaded: isUserLoaded } = useUser()
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth()

  // 用户数据状态
  const [userData, setUserData] = useState<DbUser | null>(null)
  const [savedInput, setSavedInput] = useState<SavedInput | null>(null)

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
              credits_expires_at: data.creditsExpiresAt ?? null,
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
        credits_expires_at: data.creditsExpiresAt ?? null,
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

  // 初始化：只有在 Clerk 加载完成后才处理
  useEffect(() => {
    if (!isAuthLoaded || !isUserLoaded) return

    // 加载本地保存的输入
    try {
      const savedInputData = localStorage.getItem(INPUT_STORAGE_KEY)
      if (savedInputData) {
        const parsed = JSON.parse(savedInputData) as {
          value: SavedInput
          expiry: number
        }
        if (Date.now() < parsed.expiry) {
          setSavedInput(parsed.value)
        }
      }
    } catch {
      // ignore
    }

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

  // 消耗一次生成机会（通过 API 安全更新）
  const consumeCredit = useCallback(async () => {
    if (!isSignedIn || !userData || userData.credits <= 0) {
      return false
    }

    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'consume' }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to consume credit:', error)
        return false
      }

      const data = await response.json()
      setUserData((prev) => (prev ? { ...prev, credits: data.credits } : prev))
      return true
    } catch (error) {
      console.error('Failed to consume credit:', error)
      return false
    }
  }, [isSignedIn, userData])

  // 增加生成计数（通过 API 安全更新）
  const incrementGeneration = useCallback(async () => {
    if (!isSignedIn || !userData) return

    try {
      const response = await fetch('/api/user/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment_generation' }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Failed to increment generation count:', error)
        return
      }

      const data = await response.json()
      setUserData((prev) =>
        prev ? { ...prev, generation_count: data.generationCount } : prev,
      )
    } catch (error) {
      console.error('Failed to increment generation count:', error)
    }
  }, [isSignedIn, userData])

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
                  credits_expires_at: data.creditsExpiresAt,
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

  // 保存用户输入到本地存储
  const saveInput = useCallback((description: string, style: CoverStyle) => {
    const input: SavedInput = { description, style }
    setSavedInput(input)

    try {
      localStorage.setItem(
        INPUT_STORAGE_KEY,
        JSON.stringify({
          value: input,
          expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 小时过期
        }),
      )
    } catch {
      // ignore
    }
  }, [])

  return (
    <SessionContext.Provider
      value={{
        userId: user?.id ?? null,
        userData,
        credits: userData?.credits ?? DEFAULT_CREDITS,
        creditsExpiresAt: userData?.credits_expires_at ?? null,
        accessLevel: userData?.access_level ?? DEFAULT_ACCESS_LEVEL,
        generationCount: userData?.generation_count ?? DEFAULT_GENERATION_COUNT,
        isLoading: isLoading || !isAuthLoaded || !isUserLoaded,
        isAuthenticated: !!isSignedIn && !!userData,
        error,
        savedInput,
        refreshUserData,
        consumeCredit,
        incrementGeneration,
        markAsPaid,
        saveInput,
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
