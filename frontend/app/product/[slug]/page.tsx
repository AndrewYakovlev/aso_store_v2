import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { productsApi } from "@/lib/api/products"
import { ProductImage } from "@/components/products/ProductImage"
import { ProductActions } from "@/components/products/ProductActions"
import { Card } from "@/components/ui/card"
import { 
  ShoppingCartIcon, 
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon 
} from "@heroicons/react/24/outline"

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const product = await productsApi.getBySlug(slug)

    return {
      title: `${product.name} - ${product.sku} - АСО`,
      description:
        product.description ||
        `Купить ${product.name} по выгодной цене в интернет-магазине АСО. Артикул: ${product.sku}`,
    }
  } catch {
    return {
      title: "Товар не найден - АСО",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product

  try {
    product = await productsApi.getBySlug(slug)
  } catch (error) {
    notFound()
  }

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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Главная
            </Link>
          </li>
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
          <li>
            <Link
              href="/catalog"
              className="text-muted-foreground hover:text-primary">
              Каталог
            </Link>
          </li>
          {product.categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <li>
                <Link
                  href={`/catalog/${category.slug}`}
                  className="text-muted-foreground hover:text-primary">
                  {category.name}
                </Link>
              </li>
            </React.Fragment>
          ))}
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
          <li>
            <span className="font-medium">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {product.images.length > 0 ? (
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  iconSize="lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ShoppingCartIcon className="w-32 h-32" />
                </div>
              )}
            </div>
          </Card>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
                  <ProductImage
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">Артикул: {product.sku}</p>

          {/* Categories */}
          {product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog/${category.slug}`}
                  className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Price and Stock */}
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-bold">{formatPrice(product.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  {inStock ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">В наличии</span>
                      {product.stock < 10 && (
                        <span className="text-sm text-muted-foreground">
                          (осталось {product.stock} шт.)
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                      <span className="text-red-600">Нет в наличии</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <ProductActions productId={product.id} inStock={inStock} />
          </Card>

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold mb-3">Описание</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}