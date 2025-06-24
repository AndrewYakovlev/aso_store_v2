'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, Product, CreateProductDto, UpdateProductDto } from '@/lib/api/products';
import { categoriesApi, Category } from '@/lib/api/categories';
import { brandsApi, BrandWithProductsCount } from '@/lib/api/brands';
import { useAuth } from '@/lib/contexts/AuthContext';
import { generateSlug } from '@/lib/utils/slug';
import { Loader2 } from 'lucide-react';
import { CategorySearchSelect } from './CategorySearchSelect';
import { ProductImagesManager } from './ProductImagesManager';

interface CategoryWithLevel extends Category {
  level: number;
  children?: CategoryWithLevel[];
}

interface AdminProductFormProps {
  productId?: string;
}

export function AdminProductForm({ productId }: AdminProductFormProps) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryWithLevel[]>([]);
  const [brands, setBrands] = useState<BrandWithProductsCount[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    price: '',
    oldPrice: '',
    stock: '',
    categoryIds: [] as string[],
    brandId: '',
    images: [] as string[],
    productImages: [] as any[],
    isActive: true,
  });

  useEffect(() => {
    loadCategories();
    loadBrands();
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      
      // Создаем древовидную структуру и плоский список с уровнями
      const categoriesMap = new Map<string, CategoryWithLevel>();
      const rootCategories: CategoryWithLevel[] = [];

      // Сначала создаем все узлы
      data.forEach(category => {
        categoriesMap.set(category.id, { ...category, children: [], level: 0 });
      });

      // Затем строим дерево
      data.forEach(category => {
        const categoryNode = categoriesMap.get(category.id)!;
        if (category.parentId) {
          const parent = categoriesMap.get(category.parentId);
          if (parent) {
            categoryNode.level = parent.level + 1;
            parent.children!.push(categoryNode);
          }
        } else {
          rootCategories.push(categoryNode);
        }
      });

      // Создаем плоский список с правильным порядком
      const flatCategories: CategoryWithLevel[] = [];
      const addToFlat = (cats: CategoryWithLevel[]) => {
        cats.sort((a, b) => a.sortOrder - b.sortOrder);
        cats.forEach(cat => {
          flatCategories.push(cat);
          if (cat.children && cat.children.length > 0) {
            addToFlat(cat.children);
          }
        });
      };

      addToFlat(rootCategories);
      setCategories(flatCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await brandsApi.getAll({ onlyActive: true });
      setBrands(response.items);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const loadProduct = async () => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const data = await productsApi.getById(productId);
      setFormData({
        name: data.name,
        sku: data.sku,
        slug: data.slug,
        description: data.description || '',
        price: data.price.toString(),
        oldPrice: data.oldPrice?.toString() || '',
        stock: data.stock.toString(),
        categoryIds: data.categories.map(c => c.id),
        brandId: data.brandId || '',
        images: data.images,
        productImages: data.productImages || [],
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Не удалось загрузить товар');
    } finally {
      setLoading(false);
    }
  };


  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !productId ? generateSlug(name) : prev.slug,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const data: CreateProductDto | UpdateProductDto = {
        name: formData.name,
        sku: formData.sku,
        slug: formData.slug,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        stock: parseInt(formData.stock),
        categoryIds: formData.categoryIds.length > 0 ? formData.categoryIds : undefined,
        brandId: formData.brandId || undefined,
        isActive: formData.isActive,
      };

      if (productId) {
        await productsApi.update(productId, data as UpdateProductDto, accessToken!);
      } else {
        await productsApi.create(data as CreateProductDto, accessToken!);
      }

      router.push('/panel/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении товара');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название товара <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Артикул <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL-адрес <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бренд
            </label>
            <select
              value={formData.brandId}
              onChange={(e) => setFormData(prev => ({ ...prev, brandId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Выберите бренд</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Старая цена (для отображения скидки)
            </label>
            <input
              type="number"
              value={formData.oldPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, oldPrice: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              min="0"
              step="0.01"
              placeholder="Оставьте пустым, если нет скидки"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Остаток на складе <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              min="0"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            rows={4}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Товар активен</span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          Категории 
          <span className="text-sm font-normal text-gray-500 ml-2">(необязательно)</span>
        </h2>
        
        <CategorySearchSelect
          categories={categories}
          selectedIds={formData.categoryIds}
          onToggle={handleCategoryToggle}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Изображения</h2>
        
        <ProductImagesManager
          productId={productId}
          images={formData.productImages}
          onImagesChange={(images) => setFormData(prev => ({ ...prev, productImages: images }))}
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : (
            productId ? 'Сохранить изменения' : 'Создать товар'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push('/panel/products')}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}