import Link from 'next/link'
import { Heart } from 'lucide-react'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import type { PublicGalleryImage } from '@/hooks/use-public-gallery'
import { cn } from '@/utils/tailwind'

interface PublicGalleryCardProps {
  image: PublicGalleryImage
  className?: string
}

// Format date as YYYY-MM-DD
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function PublicGalleryCard({
  image,
  className,
}: PublicGalleryCardProps) {
  return (
    <Link
      href={`/cover/${image.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-2 transition-all hover:-translate-y-1 hover:border-red-200/60 hover:shadow-xl hover:shadow-red-500/5',
        className,
      )}
    >
      {/* Cover Image Wrapper */}
      <div className="relative aspect-[1/1.65] overflow-hidden rounded-xl bg-slate-100">
        <RedEnvelopeCover
          imageUrl={image.imageUrl}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-1.5 p-2">
        {/* Prompt - truncated */}
        <p className="line-clamp-2 text-xs leading-relaxed font-medium text-slate-600 transition-colors group-hover:text-slate-900">
          {image.prompt || '微信红包封面'}
        </p>

        {/* Footer info */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-1">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-slate-400 transition-colors group-hover:text-red-500" />
            <span className="text-[11px] font-medium text-slate-400 transition-colors group-hover:text-slate-600">
              {image.likesCount.toLocaleString()}
            </span>
          </div>
          <span className="text-[10px] text-slate-300">
            {formatDate(image.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
