import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { categoriesApi } from "@/lib/api/categories"
import { CategoryTree } from "@/components/categories/CategoryTree"
import { EmptyCategory } from "@/components/categories"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const categories = await categoriesApi.getAll({ onlyActive: true });
  
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  try {
    const category = await categoriesApi.getBySlug(params.slug)

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
  let category
  let breadcrumbs = []

  try {
    // Fetch category by slug
    category = await categoriesApi.getBySlug(params.slug)

    // Fetch breadcrumbs
    breadcrumbs = await categoriesApi.getBreadcrumbs(category.id)
  } catch (error) {
    notFound()
  }

  // Fetch all categories for sidebar
  const allCategories = await categoriesApi.getTree(true)

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
          {breadcrumbs.map(item => (
            <React.Fragment key={item.id}>
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              <li>
                {item.id === category.id ? (
                  <span className="font-medium">{item.name}</span>
                ) : (
                  <Link
                    href={`/catalog/${item.slug}`}
                    className="text-muted-foreground hover:text-primary">
                    {item.name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar with categories */}
        <div className="lg:col-span-1">
          <CategoryTree categories={allCategories} title="Категории" />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          {/* Subcategories if any */}
          {category.children && category.children.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Подкатегории</h2>
              <div className="grid md:grid-cols-2 gap-4">
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

          {/* Products placeholder */}
          <EmptyCategory 
            categoryName={category.name} 
            productCount={category.productCount} 
          />
        </div>
      </div>
    </div>
  )
}
