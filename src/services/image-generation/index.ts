import type { ImageGenerationProvider } from './types'
import { SeeddreamProvider } from './seeddream-provider'

// Re-export types for convenience
export type {
  ImageGenerationProvider,
  GenerateImageResult,
  GenerateImageOptions,
} from './types'

// Singleton instance for Seeddream provider
let seeddreamProvider: SeeddreamProvider | null = null

/**
 * Get the image generation provider (Seeddream only)
 * @returns The Seeddream provider instance
 */
export function getImageProvider(): ImageGenerationProvider {
  if (!seeddreamProvider) {
    seeddreamProvider = new SeeddreamProvider()
  }
  return seeddreamProvider
}

/**
 * Check if the current provider is synchronous
 * Seeddream provider is always synchronous
 */
export function isProviderSync(): boolean {
  return true
}

/**
 * Get the name of the current provider
 */
export function getProviderName(): string {
  return 'seeddream'
}
