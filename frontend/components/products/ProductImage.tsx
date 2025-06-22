'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { getImageUrl } from '@/lib/utils/image'

interface ProductImageProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
}

export function ProductImage({ src, alt, sizes, priority, className, iconSize = 'md' }: ProductImageProps) {
  const [error, setError] = useState(false)

  const imageSrc = getImageUrl(src)

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-32 h-32'
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
        <ShoppingCartIcon className={iconSizeClasses[iconSize]} />
      </div>
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={className || "object-cover"}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}