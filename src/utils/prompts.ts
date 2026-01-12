import { getImageGenerationSystemPrompt } from '@/utils/env'

/**
 * 红包封面图片尺寸常量
 * 微信官方规范尺寸：957×1278 像素
 */
export const COVER_IMAGE_WIDTH = 957
export const COVER_IMAGE_HEIGHT = 1278

/**
 * 封面尺寸字符串格式，用于 API 请求
 * 格式：'{width}*{height}'
 */
export const COVER_IMAGE_SIZE = `${COVER_IMAGE_WIDTH}*${COVER_IMAGE_HEIGHT}`

/**
 * Alibaba DashScope 文生图 V2 API 配置
 * 参考: https://help.aliyun.com/zh/model-studio/text-to-image-v2-api-reference
 */
export const ALIBABA_API_CONFIG = {
  /** API 基础 URL */
  baseUrl: 'https://dashscope.aliyuncs.com',
  /** 模型名称: */
  model: 'wanx2.1-t2i-turbo',
  /** 生成图片数量 */
  n: 1,
  /** 是否开启提示词智能改写 */
  promptExtend: false,
  /** 是否添加水印 */
  watermark: false,
}

/**
 * 默认系统 prompt（当环境变量未设置时使用）
 */
export const DEFAULT_SYSTEM_PROMPT = `你是一个专业的微信红包封面设计师。

设计规范：
- 尺寸：${COVER_IMAGE_WIDTH}×${COVER_IMAGE_HEIGHT} 像素（竖版）`

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

  if (trimmedInput.length > 500) {
    throw new Error('描述内容过长，请控制在 500 字符以内')
  }

  const systemPrompt = getSystemPrompt()

  return `${systemPrompt}

用户要求：
${trimmedInput}`
}
