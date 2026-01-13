import type { TaskStatus } from '@/types/hongbao'

/**
 * Options for image generation
 */
export interface GenerateImageOptions {
  /** Whether to add watermark to the generated image (default: true for free users) */
  watermark?: boolean
}

/**
 * Result from image generation operation
 * Seeddream provider returns results synchronously with SUCCEEDED status
 */
export interface GenerateImageResult {
  taskId: string
  status: TaskStatus
  /** Original URL from API - for quick preview */
  originalUrl?: string
  errorCode?: string
  errorMessage?: string
}

/**
 * Image generation provider interface
 * Seeddream provider is synchronous - returns results immediately
 */
export interface ImageGenerationProvider {
  /**
   * Generate an image from a prompt
   * @param prompt User prompt for image generation
   * @param options Generation options (watermark, etc.)
   * Returns image URL immediately with SUCCEEDED status
   */
  generateImage(
    prompt: string,
    options?: GenerateImageOptions,
  ): Promise<GenerateImageResult>

  /**
   * Query the status of an image generation task
   * Not used for synchronous providers (throws error)
   */
  queryTaskStatus(taskId: string): Promise<GenerateImageResult>

  /** Whether this provider returns results synchronously (always true for Seeddream) */
  readonly isSync: boolean

  /** Provider name for logging */
  readonly name: string
}
