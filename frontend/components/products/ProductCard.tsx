'use client'

import Link from 'next/link'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { Product } from '@/lib/api/products'
import { ProductImage } from './ProductImage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const inStock = product.stock > 0

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images.length > 0 ? (
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ShoppingCartIcon className="w-16 h-16" />
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Артикул: {product.sku}
          </p>
        </Link>
        
        {product.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.categories.slice(0, 2).map((category) => (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold">{formatPrice(product.price)}</p>
            {inStock ? (
              <p className="text-xs text-green-600">В наличии</p>
            ) : (
              <p className="text-xs text-red-600">Нет в наличии</p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          size="sm" 
          className="flex-1"
          disabled={!inStock}
        >
          <ShoppingCartIcon className="w-4 h-4 mr-1" />
          В корзину
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="px-2"
        >
          <HeartIcon className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}