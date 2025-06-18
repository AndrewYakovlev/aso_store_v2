'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, ProductsFilter } from '@/lib/api/products';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsPagination } from '@/components/products/ProductsPagination';
import { Loader2 } from 'lucide-react';

interface Props {
  modelId: string;
  brandSlug: string;
  modelSlug: string;
  initialProducts: any;
  selectedYear?: number;
}

export function ModelContent({ modelId, brandSlug, modelSlug, initialProducts, selectedYear }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  // Парсим параметры из URL
  const parseSearchParams = useCallback((): ProductsFilter => {
    const filter: ProductsFilter = {
      page: 1,
      limit: 12,
      onlyActive: true,
      vehicleModelId: modelId,
    };

    // Год автомобиля
    if (selectedYear) {
      filter.vehicleYear = selectedYear;
    }

    // Страница
    const page = searchParams.get('page');
    if (page) {
      filter.page = parseInt(page);
    }

    // Сортировка
    const sort = searchParams.get('sort');
    if (sort) {
      const [sortBy, sortOrder] = sort.split(':');
      filter.sortBy = sortBy;
      filter.sortOrder = sortOrder as 'asc' | 'desc';
    }

    return filter;
  }, [searchParams, modelId, selectedYear]);

  // Загружаем товары при изменении параметров
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const filter = parseSearchParams();
      const result = await productsApi.getAll(filter);
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  }, [parseSearchParams]);

  // Загружаем товары при изменении параметров
  useEffect(() => {
    // Не загружаем при первом рендере, так как у нас есть initialProducts
    if (searchParams.get('page') || searchParams.get('sort') || searchParams.get('year')) {
      loadProducts();
    }
  }, [searchParams, loadProducts]);

  // Обновление URL параметров
  const updateParams = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Сохраняем год, если он есть
    if (selectedYear) {
      params.set('year', selectedYear.toString());
    }

    router.push(`/vehicles/${brandSlug}/${modelSlug}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value, page: undefined });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: page.toString() });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!products || products.items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Товары для этой модели пока не добавлены
        </p>
      </div>
    );
  }

  const currentSort = searchParams.get('sort') || 'createdAt:desc';

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-semibold">
          Найдено товаров: {products.total}
        </p>
        
        {/* Сортировка */}
        <select
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          <option value="createdAt:desc">Сначала новые</option>
          <option value="price:asc">Сначала дешевые</option>
          <option value="price:desc">Сначала дорогие</option>
          <option value="name:asc">По названию (А-Я)</option>
          <option value="name:desc">По названию (Я-А)</option>
        </select>
      </div>

      <ProductsGrid products={products.items} />
      
      {/* Пагинация */}
      {products.totalPages > 1 && (
        <ProductsPagination
          currentPage={products.page}
          totalPages={products.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}