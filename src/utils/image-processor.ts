import sharp from 'sharp'
import { COVER_IMAGE_WIDTH, COVER_IMAGE_HEIGHT } from '@/utils/prompts'

/**
 * Download an image from a URL and return it as a Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Add watermark text to an image
 * Uses Sharp's composite feature to overlay SVG text watermark
 * @param imageBuffer - The original image buffer
 * @returns Buffer with watermark added
 */
export async function addWatermark(imageBuffer: Buffer): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  const width = metadata.width || COVER_IMAGE_WIDTH
  const height = metadata.height || COVER_IMAGE_HEIGHT

  // Watermark configuration
  const fontSize = Math.round(width * 0.04) // Font size ~4% of width
  const text = 'Hongbao AI'
  const padding = Math.round(width * 0.03) // Padding ~3% of width
  const strokeWidth = Math.max(2, Math.round(fontSize / 20)) // Stroke width relative to font size

  // Create SVG watermark - positioned at top-right
  const svgWatermark = `
    <svg width="${width}" height="${height}">
      <text
        x="${width - padding}"
        y="${padding + fontSize}"
        text-anchor="end"
        font-size="${fontSize}"
        font-family="Arial, sans-serif"
        font-weight="bold"
        fill="white"
        fill-opacity="0.8"
        stroke="black"
        stroke-width="${strokeWidth}"
        stroke-opacity="0.5"
      >${text}</text>
    </svg>
  `

  return image
    .composite([
      {
        input: Buffer.from(svgWatermark),
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 95 })
    .toBuffer()
}

/**
 * Generate a unique image ID using crypto.randomUUID
 */
export function generateImageId(): string {
  return crypto.randomUUID()
}
