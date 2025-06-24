'use client'

import { useState, useEffect } from 'react'
import { ProductImage as ProductImageType } from '@/lib/api/product-images'
import { ProductImage } from './ProductImage'
import { Card } from '@/components/ui/card'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils/image'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface ProductImageGalleryProps {
  images: ProductImageType[]
  productName: string
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [currentModalIndex, setCurrentModalIndex] = useState(0)

  // Сортируем изображения: главное первым, затем по sortOrder
  const sortedImages = [...images].sort((a, b) => {
    if (a.isMain) return -1
    if (b.isMain) return 1
    return a.sortOrder - b.sortOrder
  })

  useEffect(() => {
    // Находим индекс главного изображения
    const mainIndex = sortedImages.findIndex(img => img.isMain)
    if (mainIndex !== -1) {
      setSelectedIndex(mainIndex)
    }
  }, [images])

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index)
  }

  const handleMainImageClick = () => {
    setCurrentModalIndex(selectedIndex)
    setIsOpen(true)
  }

  const handlePrevious = () => {
    setCurrentModalIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
  }

  const handleNext = () => {
    setCurrentModalIndex((prev) => (prev + 1) % sortedImages.length)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    
    if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const selectedImage = sortedImages[selectedIndex]

  return (
    <div>
      <Card className="overflow-hidden">
        <div 
          className="relative aspect-square bg-gray-100 cursor-zoom-in"
          onClick={handleMainImageClick}
        >
          {selectedImage ? (
            <ProductImage
              src={selectedImage.url}
              alt={selectedImage.alt || productName}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              iconSize="lg"
            />
          ) : sortedImages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ShoppingCartIcon className="w-32 h-32" />
            </div>
          ) : null}
        </div>
      </Card>
      
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {sortedImages.slice(0, 8).map((image, index) => (
            <div
              key={image.id}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 bg-gray-100 cursor-pointer transition-all",
                selectedIndex === index 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-gray-200 hover:border-gray-400"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <ProductImage
                src={image.url}
                alt={image.alt || `${productName}`}
                sizes="(max-width: 1024px) 25vw, 12.5vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="!max-w-[95vw] !w-[95vw] max-h-[95vh] h-[95vh] p-0 bg-white/95 backdrop-blur-sm border-none sm:!max-w-[95vw]"
          showCloseButton={false}
        >
          <VisuallyHidden>
            <DialogTitle>Изображение товара {productName}</DialogTitle>
          </VisuallyHidden>
          
          {/* Close button */}
          <button
            className="absolute right-4 top-4 z-20 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              disabled={sortedImages.length <= 1}
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              disabled={sortedImages.length <= 1}
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '60px' }}>
              <div className="relative w-full h-full flex items-center justify-center">
                {sortedImages[currentModalIndex] && (
                  <img
                    key={currentModalIndex}
                    src={getImageUrl(sortedImages[currentModalIndex].url)}
                    alt={sortedImages[currentModalIndex].alt || productName}
                    className="block"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%', 
                      width: 'auto', 
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </div>
            </div>

            {/* Image counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-full text-sm">
                {currentModalIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}