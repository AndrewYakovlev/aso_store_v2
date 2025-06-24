'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, ProductsFilter } from '@/lib/api/products';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsPagination } from '@/components/products/ProductsPagination';
import { ProductsFilters } from '@/components/products/ProductsFilters';
import { EmptyCategory } from '@/components/categories';
import { ExpertHelpCard } from '@/components/products/ExpertHelpCard';
import { Loader2 } from 'lucide-react';

interface Props {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  initialProducts: any;
}

export function CategoryContent({ categoryId, categorySlug, categoryName, initialProducts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Парсим параметры из URL
  const parseSearchParams = useCallback((): ProductsFilter => {
    const filter: ProductsFilter = {
      page: 1,
      limit: 12,
      onlyActive: true,
      // Всегда фильтруем по текущей категории
      categoryIds: [categoryId],
    };

    // Бренды
    const brands = searchParams.getAll('brands');
    if (brands.length > 0) {
      filter.brandIds = brands;
    }

    // Цена
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) {
      filter.minPrice = parseInt(minPrice);
    }
    if (maxPrice) {
      filter.maxPrice = parseInt(maxPrice);
    }

    // В наличии
    if (searchParams.get('inStock') === 'true') {
      filter.inStock = true;
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

    // Атрибуты
    const attrs = searchParams.getAll('attr');
    if (attrs.length > 0) {
      filter.attributes = {};
      attrs.forEach(param => {
        const [attrId, values] = param.split(':');
        if (attrId && values) {
          filter.attributes![attrId] = {
            values: values.includes(',') ? values.split(',') : values
          };
        }
      });
    }

    return filter;
  }, [searchParams, categoryId]);

  // Загружаем товары
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

  // Загружаем доступные фильтры
  const loadFilters = useCallback(async () => {
    setFiltersLoading(true);
    try {
      const filter = parseSearchParams();
      // Для фильтров исключаем некоторые параметры
      const { page, limit, sortBy, sortOrder, ...baseFilter } = filter;
      const result = await productsApi.getFilters(baseFilter);
      setFilters(result);
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setFiltersLoading(false);
    }
  }, [parseSearchParams]);

  // Загружаем данные при изменении параметров
  useEffect(() => {
    loadProducts();
    loadFilters();
  }, [loadProducts, loadFilters]);

  // Обновляем URL с новыми параметрами
  const updateFilters = (newFilter: Partial<ProductsFilter>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Маппинг между именами в фильтрах и URL параметрами
    const paramMapping: Record<string, string> = {
      brandIds: 'brands',
    };
    
    // Обновляем или удаляем параметры
    Object.entries(newFilter).forEach(([key, value]) => {
      // Пропускаем categoryIds, так как категория фиксирована
      if (key === 'categoryIds') return;
      
      const paramKey = paramMapping[key] || key;
      
      if (value === undefined || value === null || 
          (Array.isArray(value) && value.length === 0)) {
        params.delete(paramKey);
      } else if (key === 'attributes' && typeof value === 'object') {
        // Удаляем старые атрибуты
        Array.from(params.keys())
          .filter(k => k === 'attr')
          .forEach(k => params.delete(k));
        
        // Добавляем новые
        Object.entries(value).forEach(([attrId, attrFilter]) => {
          if (attrFilter && attrFilter.values) {
            const values = Array.isArray(attrFilter.values) 
              ? attrFilter.values.join(',') 
              : attrFilter.values;
            params.append('attr', `${attrId}:${values}`);
          }
        });
      } else if (Array.isArray(value)) {
        params.delete(paramKey);
        value.forEach(v => params.append(paramKey, v));
      } else {
        params.set(paramKey, String(value));
      }
    });

    // Сбрасываем страницу при изменении фильтров
    if (!('page' in newFilter)) {
      params.delete('page');
    }

    router.push(`/catalog/${categorySlug}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/catalog/${categorySlug}?${params.toString()}`);
  };

  if (loading && !products) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentSort = searchParams.get('sort') || 'createdAt:desc';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Фильтры */}
      <div className="lg:col-span-1">
        <ProductsFilters
          filters={{
            ...filters,
            // Исключаем категории из фильтров, так как мы уже находимся в категории
            categories: undefined
          }}
          selectedFilters={parseSearchParams()}
          onFiltersChange={updateFilters}
          loading={filtersLoading}
        />
      </div>

      {/* Товары */}
      <div className="lg:col-span-3">
        {products && products.items.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
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
            
            {/* Карточка помощи эксперта в конце списка */}
            <div className="mt-6">
              <ExpertHelpCard />
            </div>
            
            {/* Пагинация */}
            {products.totalPages > 1 && (
              <ProductsPagination
                currentPage={products.page}
                totalPages={products.totalPages}
                onPageChange={(page) => updateFilters({ page })}
              />
            )}
          </>
        ) : (
          <div className="space-y-6">
            <EmptyCategory categoryName={categoryName} />
            <ExpertHelpCard />
          </div>
        )}
      </div>
    </div>
  );
}