import type { UserSession, CoverStyle } from '@/types/hongbao'

const SESSION_STORAGE_KEY = 'hongbao_session'
const INPUT_STORAGE_KEY = 'hongbao_input'

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000

export interface SavedInput {
  description: string
  style: CoverStyle
}

function getStorageWithExpiry<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(key)
    if (!item) return null

    const data = JSON.parse(item) as { value: T; expiry: number }

    if (Date.now() > data.expiry) {
      localStorage.removeItem(key)
      return null
    }

    return data.value
  } catch {
    return null
  }
}

function setStorageWithExpiry<T>(
  key: string,
  value: T,
  expiryMs: number,
): void {
  if (typeof window === 'undefined') return

  try {
    const data = {
      value,
      expiry: Date.now() + expiryMs,
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    console.warn('Failed to save to localStorage')
  }
}

export function saveSession(session: UserSession): void {
  setStorageWithExpiry(SESSION_STORAGE_KEY, session, SESSION_EXPIRY_MS)
}

export function loadSession(): UserSession | null {
  return getStorageWithExpiry<UserSession>(SESSION_STORAGE_KEY)
}

export function saveInput(description: string, style: CoverStyle): void {
  const input: SavedInput = { description, style }
  setStorageWithExpiry(INPUT_STORAGE_KEY, input, SESSION_EXPIRY_MS)
}

export function getSavedInput(): SavedInput | null {
  return getStorageWithExpiry<SavedInput>(INPUT_STORAGE_KEY)
}

export function clearInput(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(INPUT_STORAGE_KEY)
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem(INPUT_STORAGE_KEY)
}

export function createDefaultSession(
  setTimestamp: boolean = false,
): UserSession {
  return {
    generationCount: 0,
    paymentStatus: 'free',
    credits: 1,
    accessLevel: 'free',
    lastUpdated: setTimestamp && typeof window !== 'undefined' ? Date.now() : 0,
  }
}
