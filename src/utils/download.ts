import type { Cover } from '@/types/hongbao'

export function downloadCover(cover: Cover, filename?: string): void {
  if (!cover.url) {
    console.error('No image URL available for download')
    return
  }

  const link = document.createElement('a')
  link.href = cover.url
  link.download = filename || `hongbao-cover-${cover.id}.png`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function downloadCoverAsBlob(cover: Cover): Promise<Blob | null> {
  if (!cover.url) {
    console.error('No image URL available for download')
    return null
  }

  try {
    const response = await fetch(cover.url)
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }
    return response.blob()
  } catch (error) {
    console.error('Failed to download cover:', error)
    return null
  }
}

export function downloadCoverByUrl(url: string, filename?: string): void {
  if (!url) {
    console.error('No image URL available for download')
    return
  }

  const link = document.createElement('a')
  link.href = url
  link.download = filename || `hongbao-cover-${Date.now()}.png`
  link.target = '_blank'
  link.rel = 'noopener noreferrer'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
