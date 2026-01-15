'use client'

import { useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 使用 useSyncExternalStore 来安全地访问 window.history
function subscribeToHistory(callback: () => void) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

function getHistorySnapshot() {
  return window.history.length > 1
}

function getServerSnapshot() {
  return false
}

export function CoverBackButton() {
  const router = useRouter()
  const canGoBack = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerSnapshot,
  )

  const handleClick = () => {
    if (canGoBack) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="sm"
      className="text-muted-foreground -ml-2 gap-1.5 px-3 py-5 text-base transition-all hover:cursor-pointer"
    >
      <ChevronLeft className="h-5 w-5" />
      {canGoBack ? '返回上一页' : '返回首页'}
    </Button>
  )
}
