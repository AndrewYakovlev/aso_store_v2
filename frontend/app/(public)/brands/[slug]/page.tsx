import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { BrandContent } from "./BrandContent"
import { Card } from "@/components/ui/card"
import { brandsApi } from "@/lib/api/brands"
import { productsApi } from "@/lib/api/products"
import { getImageUrl } from "@/lib/utils/image"
import { 
  GlobeAltIcon,
  MapPinIcon 
} from "@heroicons/react/24/outline"
import { BreadcrumbsComponent, BreadcrumbItemType } from "@/components/shared/BreadcrumbsComponent"

interface BrandPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}


export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let brand;
  try {
    brand = await brandsApi.getBySlug(slug);
  } catch (error) {
    return {
      title: 'Бренд не найден',
    };
  }

  if (!brand) {
    return {
      title: 'Бренд не найден',
    };
  }

  return {
    title: `${brand.name} - купить ${brand.name} в интернет-магазине АСО`,
    description: `${brand.description}. Широкий ассортимент продукции ${brand.name}. Доставка по всей России.`,
    openGraph: {
      title: `${brand.name} - интернет-магазин АСО`,
      description: brand.description,
      images: brand.logo ? [getImageUrl(brand.logo)] : [],
    },
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params;
  const { page = '1' } = await searchParams;
  
  let brand;
  try {
    brand = await brandsApi.getBySlug(slug);
  } catch (error) {
    notFound();
  }

  const currentPage = parseInt(page, 10) || 1;
  
  let products;
  try {
    // Используем фильтрацию по brandId через общий API товаров
    products = await productsApi.getAll({
      brandIds: [brand.id],
      page: currentPage,
      limit: 20,
      onlyActive: true,
      inStock: true,
    });
  } catch (error) {
    console.error('Failed to load brand products:', error);
    products = {
      items: [],
      total: 0,
      page: currentPage,
      limit: 20,
      totalPages: 0
    };
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <BreadcrumbsComponent 
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Производители', href: '/brands' },
            { label: brand.name }
          ] as BreadcrumbItemType[]}
        />
      </div>

      {/* Brand Info */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {brand.logo && (
            <div className="w-32 h-32 flex-shrink-0">
              <img 
                src={getImageUrl(brand.logo)} 
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">{brand.name}</h1>
            
            {brand.description && (
              <p className="text-muted-foreground mb-4">{brand.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {brand.country && (
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                  <span>Страна: {brand.country}</span>
                </div>
              )}
              
              {brand.website && (
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Официальный сайт
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Products */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">
          Товары {brand.name}
        </h2>

        <BrandContent
          brandId={brand.id}
          brandSlug={slug}
          initialProducts={products}
        />
      </div>
    </div>
  );
}