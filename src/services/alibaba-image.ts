import { getAlibabaImageKey } from '@/utils/env'
import { ALIBABA_API_CONFIG, COVER_IMAGE_SIZE } from '@/utils/prompts'
import type { TaskStatus } from '@/types/hongbao'

const ALIBABA_API_BASE = 'https://dashscope.aliyuncs.com'

interface CreateTaskV2Response {
  output: {
    task_id: string
    task_status: string
  }
  request_id: string
}

interface QueryTaskV2Response {
  output: {
    task_id: string
    task_status: string
    submit_time?: string
    scheduled_time?: string
    end_time?: string
    finished?: boolean
    choices?: Array<{
      finish_reason: string
      message: {
        role: string
        content: Array<{
          image: string
          type: string
        }>
      }
    }>
    results?: Array<{
      url: string
      orig_prompt?: string
      actual_prompt?: string
    }>
    code?: string
    message?: string
  }
  request_id: string
  usage?: {
    image_count: number
    size: string
  }
}

interface CreateTaskV2Request {
  model: string
  input: {
    prompt: string
  }
  parameters: {
    size: string
    n: number
    prompt_extend?: boolean
    watermark?: boolean
  }
}

export async function createGenerationTask(
  prompt: string,
): Promise<CreateTaskV2Response> {
  const apiKey = getAlibabaImageKey()

  const request: CreateTaskV2Request = {
    model: ALIBABA_API_CONFIG.model,
    input: {
      prompt,
    },
    parameters: {
      size: COVER_IMAGE_SIZE,
      n: ALIBABA_API_CONFIG.n,
      prompt_extend: ALIBABA_API_CONFIG.promptExtend,
      watermark: ALIBABA_API_CONFIG.watermark,
    },
  }

  const response = await fetch(
    `${ALIBABA_API_BASE}/api/v1/services/aigc/text2image/image-synthesis`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(request),
    },
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `API request failed with status ${response.status}`,
    )
  }

  return response.json()
}

export async function queryTaskStatus(
  taskId: string,
): Promise<QueryTaskV2Response> {
  const apiKey = getAlibabaImageKey()

  const response = await fetch(`${ALIBABA_API_BASE}/api/v1/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData.message || `Query failed with status ${response.status}`,
    )
  }

  return response.json()
}

export function mapApiStatusToTaskStatus(apiStatus: string): TaskStatus {
  switch (apiStatus) {
    case 'PENDING':
    case 'RUNNING':
      return 'PROCESSING'
    case 'SUCCEEDED':
      return 'SUCCEEDED'
    case 'FAILED':
    case 'CANCELED':
      return 'FAILED'
    default:
      return 'PENDING'
  }
}

interface CreateTaskResult {
  taskId: string
  requestId: string
  initialStatus: TaskStatus
}

export async function createTask(prompt: string): Promise<CreateTaskResult> {
  const response = await createGenerationTask(prompt)

  return {
    taskId: response.output.task_id,
    requestId: response.request_id,
    initialStatus: mapApiStatusToTaskStatus(response.output.task_status),
  }
}

export function getImageUrlFromResponse(
  response: QueryTaskV2Response,
): string | null {
  if (
    response.output.results &&
    response.output.results.length > 0 &&
    response.output.results[0]?.url
  ) {
    return response.output.results[0].url
  }
  if (
    response.output.choices &&
    response.output.choices.length > 0 &&
    response.output.choices[0]?.message?.content?.[0]?.image
  ) {
    return response.output.choices[0].message.content[0].image
  }
  return null
}
