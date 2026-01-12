export type CoverStyle = 'newyear' | 'minimalist' | 'cute' | 'chinese'

export interface CoverStyleOption {
  id: CoverStyle
  name: string
  label: string
}

export const COVER_STYLES: CoverStyleOption[] = [
  { id: 'newyear', name: '新年喜庆', label: 'New Year Festive' },
  { id: 'minimalist', name: '简约高级', label: 'Minimalist Premium' },
  { id: 'cute', name: '可爱卡通', label: 'Cute Cartoon' },
  { id: 'chinese', name: '国风', label: 'Chinese Style' },
]

export type CoverQuality = 'preview' | 'hd'

export type CoverStatus = 'pending' | 'generating' | 'completed' | 'error'

export interface Cover {
  id: string
  description: string
  style: CoverStyle
  status: CoverStatus
  quality: CoverQuality
  hasWatermark: boolean
  createdAt: number
  url: string
  imageId?: string
}

export type PaymentStatus = 'free' | 'paid'

export type AccessLevel = 'free' | 'premium'

export interface UserSession {
  generationCount: number
  paymentStatus: PaymentStatus
  credits: number
  accessLevel: AccessLevel
  lastUpdated: number
}

export interface SampleCover {
  id: string
  color: string
  style: CoverStyle
  title: string
  imageUrl?: string
}

export const SAMPLE_COVERS: SampleCover[] = [
  { id: 'sample-1', color: '#FF6B6B', style: 'newyear', title: '新年快乐' },
  { id: 'sample-2', color: '#4ECDC4', style: 'minimalist', title: '简约之美' },
  { id: 'sample-3', color: '#FFE66D', style: 'cute', title: '可爱萌趣' },
  { id: 'sample-4', color: '#95E1D3', style: 'chinese', title: '国风雅韵' },
  { id: 'sample-5', color: '#F38181', style: 'newyear', title: '福气满满' },
  { id: 'sample-6', color: '#AA96DA', style: 'cute', title: '童趣时光' },
]

export interface GenerateCoverParams {
  description: string
  style: CoverStyle
}

export interface GenerateCoverResponse {
  success: boolean
  cover?: Cover
  error?: string
}

export interface PaymentResponse {
  success: boolean
  creditsAdded?: number
  error?: string
}

export interface SessionState {
  session: UserSession
  savedInput: {
    description: string
    style: CoverStyle
  }
}

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export interface ImageGenerationTask {
  id: string
  taskId: string
  status: TaskStatus
  prompt: string
  originalUrl?: string
  optimizedUrl?: string
  createdAt: Date
  completedAt?: Date
  errorCode?: string
  errorMessage?: string
}

export interface ImageGenerationRequest {
  model: 'wanx2.0-t2i-turbo'
  input: {
    prompt: string
    negative_prompt?: string
  }
  parameters?: {
    size?: '957*1278' | '1024*1024' | '720*1280' | '1280*720'
    n?: number
    style?: string
  }
}

export interface GenerationConfig {
  systemPrompt: string
  stylePrompt: string
  userInput: string
  width?: number
  height?: number
  maxTokens?: number
}
