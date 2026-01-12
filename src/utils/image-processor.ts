import sharp from 'sharp'

export const IMAGE_FORMAT = 'png'
export const PREVIEW_SCALE = 0.25
export const WATERMARK_ROTATION = -30
export const WATERMARK_OPACITY = 0.3
export const WATERMARK_FONT_SIZE = 48

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function createPreviewImage(
  originalBuffer: Buffer,
): Promise<Buffer> {
  const image = sharp(originalBuffer)
  const metadata = await image.metadata()

  const originalWidth = metadata.width || 957
  const originalHeight = metadata.height || 1278

  const previewWidth = Math.round(originalWidth * PREVIEW_SCALE)
  const previewHeight = Math.round(originalHeight * PREVIEW_SCALE)

  return sharp(originalBuffer)
    .resize(previewWidth, previewHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat(IMAGE_FORMAT)
    .png({ quality: 85 })
    .toBuffer()
}

export async function addWatermark(
  imageBuffer: Buffer,
  text: string,
): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()
  const width = metadata.width || 957
  const height = metadata.height || 1278

  const svgText = `
    <svg width="${width}" height="${height}">
      <style>
        .watermark {
          font-size: ${WATERMARK_FONT_SIZE}px;
          font-family: Arial, sans-serif;
          fill: rgba(255, 255, 255, ${WATERMARK_OPACITY});
        }
      </style>
      <text
        x="50%"
        y="50%"
        class="watermark"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${WATERMARK_ROTATION}, ${width / 2}, ${height / 2})"
      >
        ${text}
      </text>
    </svg>
  `

  const svgBuffer = Buffer.from(svgText)

  return sharp(imageBuffer)
    .composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
        blend: 'over',
      },
    ])
    .toFormat(IMAGE_FORMAT)
    .png({ quality: 85 })
    .toBuffer()
}

export function generateImageId(): string {
  return crypto.randomUUID()
}
