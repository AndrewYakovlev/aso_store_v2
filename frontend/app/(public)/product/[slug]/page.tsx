import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { productsApi } from "@/lib/api/products"
import { ProductImage } from "@/components/products/ProductImage"
import { ProductActions } from "@/components/products/ProductActions"
import { ProductAttributes } from "@/components/ProductAttributes"
import { ProductVehicles } from "@/components/products/ProductVehicles"
import { ProductImageGallery } from "@/components/products/ProductImageGallery"
import { Card } from "@/components/ui/card"
import { BreadcrumbsComponent, BreadcrumbItemType } from "@/components/shared/BreadcrumbsComponent"
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
    console.log('Product received:', product)
    console.log('Product attributes:', product.attributes)
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

  // Формируем элементы для хлебных крошек
  const breadcrumbItems: BreadcrumbItemType[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    ...product.categories.map(category => ({
      label: category.name,
      href: `/catalog/${category.slug}`
    })),
    { label: product.name }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <BreadcrumbsComponent items={breadcrumbItems} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImageGallery 
          images={product.productImages || []} 
          productName={product.name}
        />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-muted-foreground mb-4">Артикул: {product.sku}</p>

          {/* Brand */}
          {product.brand && (
            <div className="mb-4">
              <Link
                href={`/brands/${product.brand.slug}`}
                className="text-primary hover:underline"
              >
                Производитель: {product.brand.name}
              </Link>
            </div>
          )}

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

          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <ProductAttributes attributes={product.attributes} />
          )}

          {/* Compatible Vehicles */}
          {product.vehicles && product.vehicles.length > 0 && (
            <div className="mt-6">
              <ProductVehicles vehicles={product.vehicles} />
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none mt-6">
              <h2 className="text-xl font-semibold mb-3">Описание</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}