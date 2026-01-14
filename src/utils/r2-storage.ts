import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`

export const R2_BUCKET = process.env.R2_BUCKET_NAME!

export const SIGNED_URL_EXPIRES_IN = 600
export const ORIGINAL_FOLDER = 'original'
export const PREVIEW_FOLDER = 'preview'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  buffer: Buffer,
  key: string,
  contentType: string = 'image/png',
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await s3Client.send(command)

  return key
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = SIGNED_URL_EXPIRES_IN,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })

  return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * 根据存储 key 生成 CDN URL
 * @param key - R2 存储 key，如 original/xxx.png 或 preview/xxx.png
 * @param cdnDomain - CDN 域名，如 cdn.hongbao.elvinn.wiki
 */
export function getCdnUrl(key: string, cdnDomain: string): string {
  return `https://${cdnDomain}/${key}`
}

export function getOriginalKey(imageId: string): string {
  return `${ORIGINAL_FOLDER}/${imageId}.png`
}

export function getPreviewKey(imageId: string): string {
  return `${PREVIEW_FOLDER}/${imageId}.png`
}
