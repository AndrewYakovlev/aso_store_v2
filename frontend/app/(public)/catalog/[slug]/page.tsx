import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { categoriesApi } from "@/lib/api/categories"
import { productsApi } from "@/lib/api/products"
import { CategoryTree } from "@/components/categories/CategoryTree"
import { CategoryContent } from "./CategoryContent"
import { BreadcrumbsComponent, BreadcrumbItemType } from "@/components/shared/BreadcrumbsComponent"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

// Force dynamic rendering to avoid API calls during build
export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const category = await categoriesApi.getBySlug(slug)

    return {
      title: `${category.name} - Автозапчасти АСО`,
      description:
        category.description ||
        `Купить ${category.name.toLowerCase()} в интернет-магазине АСО. Широкий выбор, низкие цены, быстрая доставка.`,
    }
  } catch {
    return {
      title: "Категория не найдена - АСО",
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let category
  let breadcrumbs = []
  let products

  try {
    // Fetch category by slug
    category = await categoriesApi.getBySlug(slug)

    // Fetch breadcrumbs
    breadcrumbs = await categoriesApi.getBreadcrumbs(category.id)
    
    // Fetch products for this category
    products = await productsApi.getByCategorySlug(slug, {
      onlyActive: true,
      limit: 12,
    })
  } catch (error) {
    notFound()
  }

  // Fetch all categories for sidebar
  const allCategories = await categoriesApi.getTree(true)

  // Формируем элементы для хлебных крошек
  const breadcrumbItems: BreadcrumbItemType[] = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/catalog' },
    ...breadcrumbs.map(item => ({
      label: item.name,
      href: item.id === category.id ? undefined : `/catalog/${item.slug}`
    }))
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <BreadcrumbsComponent items={breadcrumbItems} />
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}

      {/* Subcategories if any */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Подкатегории</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.children.map(child => (
              <Link
                key={child.id}
                href={`/catalog/${child.slug}`}
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-medium mb-1">{child.name}</h3>
                {child.productCount !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {child.productCount} товаров
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products with filters */}
      <CategoryContent 
        categoryId={category.id}
        categorySlug={slug}
        categoryName={category.name}
        initialProducts={products}
      />
    </div>
  )
}
