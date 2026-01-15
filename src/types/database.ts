/**
 * Supabase 数据库类型定义
 * 与 design/database/schema.sql 保持同步
 */

export type AccessLevel = 'free' | 'premium'

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export type PaymentStatus = 'pending' | 'completed' | 'failed'

export type PaymentProvider = 'stripe' | 'wechat' | 'alipay' | 'mock'

export type PlanId = 'trial' | 'premium'

/**
 * users 表
 */
export interface DbUser {
  id: string
  credits: number
  credits_expires_at: string | null
  access_level: AccessLevel
  generation_count: number
  created_at: string
  updated_at: string
}

/**
 * generation_tasks 表
 */
export interface DbGenerationTask {
  id: string
  user_id: string
  provider_task_id: string
  prompt: string
  status: TaskStatus
  error_code: string | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

/**
 * images 表
 */
export interface DbImage {
  id: string
  task_id: string
  user_id: string
  preview_key: string | null
  original_key: string
  is_public: boolean
  likes_count: number
  created_at: string
}

/**
 * image_likes 表
 */
export interface DbImageLike {
  id: string
  image_id: string
  user_id: string
  created_at: string
}

/**
 * payments 表
 */
export interface DbPayment {
  id: string
  user_id: string
  amount: number
  status: PaymentStatus
  provider: PaymentProvider | null
  provider_transaction_id: string | null
  stripe_session_id: string | null
  plan_id: PlanId | null
  credits_added: number
  credits_validity_days: number | null
  created_at: string
  completed_at: string | null
}

/**
 * Supabase Database type for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DbUser
        Insert: Omit<DbUser, 'created_at' | 'updated_at'> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<DbUser, 'id' | 'created_at'>>
      }
      generation_tasks: {
        Row: DbGenerationTask
        Insert: Omit<DbGenerationTask, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<DbGenerationTask, 'id' | 'user_id' | 'created_at'>>
      }
      images: {
        Row: DbImage
        Insert: Omit<
          DbImage,
          'id' | 'created_at' | 'is_public' | 'likes_count'
        > & {
          id?: string
          created_at?: string
          is_public?: boolean
          likes_count?: number
        }
        Update: Partial<Omit<DbImage, 'id' | 'created_at'>>
      }
      image_likes: {
        Row: DbImageLike
        Insert: Omit<DbImageLike, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<DbImageLike, 'id' | 'created_at'>>
      }
      payments: {
        Row: DbPayment
        Insert: Omit<DbPayment, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<DbPayment, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
