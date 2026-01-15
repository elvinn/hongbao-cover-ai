'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { RedEnvelopeCover } from '@/components/red-envelope-cover'
import type { PublicGalleryImage } from '@/hooks/use-public-gallery'

interface PublicGalleryCardProps {
  image: PublicGalleryImage
}

export function PublicGalleryCard({ image }: PublicGalleryCardProps) {
  return (
    <Link
      href={`/cover/${image.id}`}
      className="group block transition-transform hover:scale-[1.02]"
    >
      {/* Cover Image */}
      <RedEnvelopeCover
        imageUrl={image.imageUrl}
        className="w-full shadow-sm"
      />

      {/* Info Section */}
      <div className="mt-2 space-y-1">
        {/* Prompt - truncated */}
        <p className="text-foreground line-clamp-1 text-sm">{image.prompt}</p>

        {/* Likes */}
        <div className="flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 fill-red-400 text-red-400" />
          <span className="text-muted-foreground text-xs">
            {image.likesCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}
