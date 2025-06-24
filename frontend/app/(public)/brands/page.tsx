import React from "react"
import Link from "next/link"
import { Metadata } from "next"
import { Card } from "@/components/ui/card"
import { BreadcrumbsComponent, BreadcrumbItemType } from "@/components/shared/BreadcrumbsComponent"
import { brandsApi, BrandWithProductsCount } from "@/lib/api/brands"
import { getImageUrl } from "@/lib/utils/image"

// Force dynamic rendering to avoid API calls during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Производители автозапчастей - интернет-магазин АСО',
  description: 'Каталог производителей автозапчастей. Оригинальные запчасти и аналоги от ведущих мировых брендов.',
}


// Группировка брендов по первой букве
function groupBrandsByLetter(brands: BrandWithProductsCount[]) {
  const grouped = brands.reduce((acc, brand) => {
    const letter = brand.name[0].toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(brand);
    return acc;
  }, {} as Record<string, BrandWithProductsCount[]>);

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}

export default async function BrandsPage() {
  let brands: BrandWithProductsCount[] = [];
  let errorMessage = null;
  
  try {
    const response = await brandsApi.getAll({
      onlyActive: true,
      limit: 100, // Получаем все бренды
      sortBy: 'name',
      sortOrder: 'asc',
    });
    brands = response.items;
  } catch (error) {
    console.error('Failed to load brands:', error);
    brands = [];
    errorMessage = 'Не удалось загрузить список брендов. Пожалуйста, попробуйте позже.';
  }
  
  const groupedBrands = groupBrandsByLetter(brands);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <BreadcrumbsComponent 
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Производители' }
          ] as BreadcrumbItemType[]}
        />
      </div>

      <h1 className="text-3xl font-bold mb-8">Производители автозапчастей</h1>

      {errorMessage && (
        <Card className="p-6 mb-8 border-destructive bg-destructive/10">
          <p className="text-destructive">{errorMessage}</p>
        </Card>
      )}

      {brands.length === 0 && !errorMessage && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Бренды не найдены</p>
        </Card>
      )}

      {brands.length > 0 && (
        <>
          {/* Quick navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {groupedBrands.map(([letter]) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>

          {/* Brands list */}
          <div className="space-y-8">
            {groupedBrands.map(([letter, letterBrands]) => (
          <div key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-semibold mb-4">{letter}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {letterBrands.map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`}>
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      {brand.logo && (
                        <div className="w-16 h-16 flex-shrink-0">
                          <img 
                            src={getImageUrl(brand.logo)} 
                            alt={brand.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{brand.name}</h3>
                        
                        {brand.country && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {brand.country}
                          </p>
                        )}
                        
                        {brand.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {brand.description}
                          </p>
                        )}
                        
                        {brand.productsCount && brand.productsCount > 0 && (
                          <p className="text-sm text-primary mt-2">
                            Товаров: {brand.productsCount}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
          </div>
        </>
      )}
    </div>
  );
}