import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import type {
  ImageGenerationProvider,
  GenerateImageResult,
  GenerateImageOptions,
} from './types'
import { getArkApiKey } from '@/utils/env'
import {
  buildFullPrompt,
  COVER_IMAGE_WIDTH,
  COVER_IMAGE_HEIGHT,
} from '@/utils/prompts'

// Volcano Engine Ark API configuration
const ARK_API_BASE = 'https://ark.cn-beijing.volces.com/api/v3'
const SEEDDREAM_MODEL = 'doubao-seedream-4-0-250828'

// Format size for OpenAI API: "widthxheight" (e.g., "957x1278")
const IMAGE_SIZE = `${COVER_IMAGE_WIDTH}x${COVER_IMAGE_HEIGHT}` as const

/**
 * Volcano Engine Seeddream provider for image generation
 * Uses OpenAI SDK compatible API with doubao-seedream-4-0-250828 model
 * This is a synchronous provider - images are generated immediately
 */
export class SeeddreamProvider implements ImageGenerationProvider {
  readonly isSync = true
  readonly name = 'seeddream'
  private client: OpenAI

  constructor() {
    const apiKey = getArkApiKey()
    this.client = new OpenAI({
      apiKey,
      baseURL: ARK_API_BASE,
    })
  }

  async generateImage(
    prompt: string,
    options?: GenerateImageOptions,
  ): Promise<GenerateImageResult> {
    const taskId = uuidv4()
    const startTime = Date.now()

    try {
      const fullPrompt = buildFullPrompt(prompt)

      console.log('[Seeddream Provider] 用户提示词:', prompt)
      console.log('[Seeddream Provider] 完整提示词:', fullPrompt)
      console.log('[Seeddream Provider] 模型名称:', SEEDDREAM_MODEL)
      console.log('[Seeddream Provider] 图片尺寸:', IMAGE_SIZE)

      // Call Volcano Engine API using OpenAI SDK
      // Note: size is a Volcano Engine specific parameter that accepts custom dimensions
      const response = await this.client.images.generate({
        model: SEEDDREAM_MODEL,
        prompt: fullPrompt,
        // @ts-expect-error - size accepts custom dimensions on Volcano Engine API (957x1278)
        size: IMAGE_SIZE,
        response_format: 'url',
        watermark: false,
      })

      const duration = Date.now() - startTime
      console.log('[Seeddream Provider] AI 生成图片耗时:', duration, 'ms')

      // Get image URL from response
      const imageUrl = response.data?.[0]?.url

      if (!imageUrl) {
        throw new Error('模型未返回图片 URL')
      }

      console.log('[Seeddream Provider] 生成图片原始 URL:', imageUrl)

      // Return original URL directly - download handled in background
      return {
        taskId,
        status: 'SUCCEEDED',
        originalUrl: imageUrl,
      }
    } catch (error) {
      console.error('[Seeddream Provider] 图片生成错误:', error)

      const errorMessage =
        error instanceof Error ? error.message : '图片生成失败，请稍后重试'

      return {
        taskId,
        status: 'FAILED',
        errorCode: 'GENERATION_FAILED',
        errorMessage,
      }
    }
  }

  async queryTaskStatus(taskId: string): Promise<GenerateImageResult> {
    // Seeddream provider is synchronous, so this method should not be called
    // If called, return an error
    return {
      taskId,
      status: 'FAILED',
      errorCode: 'NOT_SUPPORTED',
      errorMessage: 'Seeddream provider does not support task polling',
    }
  }
}
