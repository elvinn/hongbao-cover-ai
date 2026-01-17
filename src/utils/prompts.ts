import { getImageGenerationSystemPrompt } from '@/utils/env'

/**
 * 红包封面图片尺寸常量，符合微信官方规范尺寸
 */
export const COVER_IMAGE_WIDTH = 957
export const COVER_IMAGE_HEIGHT = 1278

/**
 * 封面尺寸字符串格式，用于 API 请求
 * 格式：'{width}*{height}'
 */
export const COVER_IMAGE_SIZE = `${COVER_IMAGE_WIDTH}*${COVER_IMAGE_HEIGHT}`

/**
 * 默认系统 prompt（当环境变量未设置时使用）
 */
export const DEFAULT_SYSTEM_PROMPT = `你是一个专业的微信红包封面设计师。`

/**
 * 获取系统 prompt
 * 优先从环境变量 IMAGE_GENERATION_SYSTEM_PROMPT 读取，如果未设置则使用默认值
 */
export function getSystemPrompt(): string {
  return getImageGenerationSystemPrompt() || DEFAULT_SYSTEM_PROMPT
}

export function buildFullPrompt(userInput: string): string {
  const trimmedInput = userInput.trim()
  if (!trimmedInput) {
    throw new Error('请输入红包封面描述')
  }

  if (trimmedInput.length > 1000) {
    throw new Error('描述内容过长，请控制在 1000 字符以内')
  }

  const systemPrompt = getSystemPrompt()

  return [
    systemPrompt,
    `尺寸要求：${COVER_IMAGE_WIDTH}×${COVER_IMAGE_HEIGHT} 像素（竖版）`,
    `用户要求：${trimmedInput}`,
  ].join('\n')
}
