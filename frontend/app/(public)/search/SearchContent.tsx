'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi, ProductsFilter } from '@/lib/api/products';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsFilters } from '@/components/products/ProductsFilters';
import { ProductsPagination } from '@/components/products/ProductsPagination';
import { ExpertHelpCard } from '@/components/products/ExpertHelpCard';
import { Loader2 } from 'lucide-react';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function SearchContent({ searchParams }: Props) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [products, setProducts] = useState<any>(null);
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Парсим параметры из URL
  const parseSearchParams = useCallback((): ProductsFilter => {
    const filter: ProductsFilter = {
      page: 1,
      limit: 20,
      onlyActive: true,
    };

    // Поисковый запрос
    if (searchParams.q) {
      filter.search = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
    }

    // Категории
    if (searchParams.categories) {
      filter.categoryIds = Array.isArray(searchParams.categories) 
        ? searchParams.categories 
        : [searchParams.categories];
    }

    // Бренды
    if (searchParams.brands) {
      filter.brandIds = Array.isArray(searchParams.brands) 
        ? searchParams.brands 
        : [searchParams.brands];
    }

    // Цена
    if (searchParams.minPrice) {
      filter.minPrice = parseInt(searchParams.minPrice as string);
    }
    if (searchParams.maxPrice) {
      filter.maxPrice = parseInt(searchParams.maxPrice as string);
    }

    // В наличии
    if (searchParams.inStock === 'true') {
      filter.inStock = true;
    }

    // Страница
    if (searchParams.page) {
      filter.page = parseInt(searchParams.page as string);
    }

    // Сортировка
    if (searchParams.sort) {
      const [sortBy, sortOrder] = (searchParams.sort as string).split(':');
      filter.sortBy = sortBy;
      filter.sortOrder = sortOrder as 'asc' | 'desc';
    }

    // Атрибуты
    if (searchParams.attr) {
      filter.attributes = {};
      const attrParams = Array.isArray(searchParams.attr) ? searchParams.attr : [searchParams.attr];
      
      attrParams.forEach(param => {
        const [attrId, values] = param.split(':');
        if (attrId && values) {
          filter.attributes![attrId] = {
            values: values.includes(',') ? values.split(',') : values
          };
        }
      });
    }

    return filter;
  }, [searchParams]);

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
    const params = new URLSearchParams(urlSearchParams.toString());
    
    // Маппинг между именами в фильтрах и URL параметрами
    const paramMapping: Record<string, string> = {
      categoryIds: 'categories',
      brandIds: 'brands',
    };
    
    // Обновляем или удаляем параметры
    Object.entries(newFilter).forEach(([key, value]) => {
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

    router.push(`/search?${params.toString()}`);
  };

  if (loading && !products) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Фильтры */}
      <div className="lg:col-span-1">
        <ProductsFilters
          filters={filters}
          selectedFilters={parseSearchParams()}
          onFiltersChange={updateFilters}
          loading={filtersLoading}
        />
      </div>

      {/* Результаты поиска */}
      <div className="lg:col-span-3">
        {/* Информация о результатах */}
        <div className="mb-6">
          <p className="text-gray-600">
            {products?.total > 0 ? (
              <>
                Найдено товаров: <span className="font-semibold">{products.total}</span>
                {searchParams.q && (
                  <> по запросу "<span className="font-semibold">{searchParams.q}</span>"</>
                )}
              </>
            ) : (
              'Товары не найдены'
            )}
          </p>

          {/* Сортировка */}
          {products?.total > 0 && (
            <div className="mt-4">
              <select
                value={`${parseSearchParams().sortBy || 'createdAt'}:${parseSearchParams().sortOrder || 'desc'}`}
                onChange={(e) => {
                  const params = new URLSearchParams(urlSearchParams.toString());
                  params.set('sort', e.target.value);
                  router.push(`/search?${params.toString()}`);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="createdAt:desc">Сначала новые</option>
                <option value="price:asc">Сначала дешевые</option>
                <option value="price:desc">Сначала дорогие</option>
                <option value="name:asc">По названию (А-Я)</option>
                <option value="name:desc">По названию (Я-А)</option>
              </select>
            </div>
          )}
        </div>

        {/* Товары */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products?.items.length > 0 ? (
          <>
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                По вашему запросу ничего не найдено
              </p>
              <p className="text-gray-400 mt-2">
                Попробуйте изменить параметры поиска или фильтры
              </p>
            </div>
            <ExpertHelpCard />
          </div>
        )}
      </div>
    </div>
  );
}