const PROMPT_CACHE_KEY = 'hongbao_pending_prompt'
const CACHE_EXPIRY_MS = 30 * 60 * 1000 // 30 分钟

interface CachedPrompt {
  prompt: string
  timestamp: number
}

/**
 * 缓存提示词用于登录后恢复
 */
export function cachePromptForAuth(prompt: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(
      PROMPT_CACHE_KEY,
      JSON.stringify({
        prompt,
        timestamp: Date.now(),
      }),
    )
  } catch {
    // localStorage 不可用时忽略
  }
}

/**
 * 获取缓存的提示词
 */
export function getCachedPrompt(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(PROMPT_CACHE_KEY)
    if (!cached) return null

    const { prompt, timestamp } = JSON.parse(cached) as CachedPrompt

    // 检查是否过期
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(PROMPT_CACHE_KEY)
      return null
    }

    return prompt
  } catch {
    return null
  }
}

/**
 * 清除缓存的提示词
 */
export function clearCachedPrompt(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(PROMPT_CACHE_KEY)
  } catch {
    // ignore
  }
}
