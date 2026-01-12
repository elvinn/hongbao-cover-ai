import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { TaskStatus } from '@/types/hongbao'

interface GenerationState {
  taskId: string | null
  status: TaskStatus | null
  imageUrl: string | null
  error: string | null
  prompt: string
}

const STORAGE_KEY = 'hongbao_generation_task'

function loadFromStorage(): Partial<GenerationState> {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    console.error('Failed to parse stored task')
  }
  return {}
}

function saveToStorage(task: GenerationState): void {
  if (task.taskId) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        taskId: task.taskId,
        prompt: task.prompt,
        status: task.status,
        createdAt: Date.now(),
      }),
    )
  }
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function useImageGeneration() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<GenerationState>(() => ({
    taskId: null,
    status: null,
    imageUrl: null,
    error: null,
    prompt: '',
    ...loadFromStorage(),
  }))

  const createMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '生成失败')
      }

      return response.json() as Promise<{ taskId: string; status: TaskStatus }>
    },
    onSuccess: (data, variables) => {
      const newState: GenerationState = {
        taskId: data.taskId,
        status: data.status,
        imageUrl: null,
        error: null,
        prompt: variables,
      }
      setState(newState)
      saveToStorage(newState)
    },
    onError: (error: Error) => {
      setState((prev) => ({
        ...prev,
        error: error.message,
      }))
    },
  })

  const { data: taskStatus, isFetching: isPolling } = useQuery({
    queryKey: ['generationStatus', state.taskId],
    queryFn: async () => {
      if (!state.taskId) throw new Error('No task ID')

      const response = await fetch(`/api/generate/${state.taskId}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '查询失败')
      }

      return response.json() as Promise<{
        taskId: string
        status: TaskStatus
        output?: { url?: string; error_code?: string; error_message?: string }
      }>
    },
    enabled:
      !!state.taskId &&
      (state.status === 'PENDING' || state.status === 'PROCESSING'),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'PENDING' || status === 'PROCESSING') {
        return 2000
      }
      return false
    },
  })

  useEffect(() => {
    if (!taskStatus) return

    const newStatus = taskStatus.status
    let imageUrl: string | null = null
    let error: string | null = null

    if (newStatus === 'SUCCEEDED' && taskStatus.output?.url) {
      imageUrl = taskStatus.output.url
      clearStorage()
    } else if (newStatus === 'FAILED') {
      error = taskStatus.output?.error_message || '图片生成失败'
      clearStorage()
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => {
      if (prev.taskId === taskStatus.taskId) {
        const updated = {
          ...prev,
          status: newStatus,
          imageUrl,
          error,
        }
        if (newStatus !== 'PENDING' && newStatus !== 'PROCESSING') {
          saveToStorage(updated)
        }
        return updated
      }
      return prev
    })
  }, [taskStatus, queryClient, state.taskId])

  const reset = useCallback(() => {
    setState({
      taskId: null,
      status: null,
      imageUrl: null,
      error: null,
      prompt: '',
    })
    clearStorage()
  }, [])

  const retry = useCallback(() => {
    if (state.prompt) {
      createMutation.mutate(state.prompt)
    }
  }, [createMutation, state.prompt])

  return {
    ...state,
    isLoading: createMutation.isPending,
    isPolling,
    isGenerating:
      createMutation.isPending ||
      state.status === 'PENDING' ||
      state.status === 'PROCESSING',
    create: createMutation.mutate,
    reset,
    retry,
  }
}
