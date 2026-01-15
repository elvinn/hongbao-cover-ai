export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export function getShareUrl(imageId: string): string {
  return `${SITE_URL}/cover/${imageId}`
}

export function getShareText(imageId: string): string {
  const shareUrl = getShareUrl(imageId)
  return `🧧 我发现了一个超好看的红包封面！
快来看看 → ${shareUrl}
你也可以免费生成属于自己的红包封面~`
}
