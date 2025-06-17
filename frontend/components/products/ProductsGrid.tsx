import { Product } from '@/lib/api/products'
import { ProductCard } from './ProductCard'

interface ProductsGridProps {
  products: Product[]
  loading?: boolean
}

export function ProductsGrid({ products, loading }: ProductsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className="bg-gray-200 animate-pulse rounded-lg aspect-[3/4]"
          />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Товары не найдены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}