'use client';

import { useState, useEffect } from 'react';
import { productsApi, Product, CreateProductDto, UpdateProductDto } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { brandsApi, BrandWithProductsCount } from '@/lib/api/brands';
import { useAuth } from '@/lib/contexts/AuthContext';
import { generateSlug } from '@/lib/utils/slug';
import { Loader2 } from 'lucide-react';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CategoryWithLevel {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  level: number;
  children?: CategoryWithLevel[];
}

interface ProductSheetProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductSheet({ product, onSave, onCancel }: ProductSheetProps) {
  const { accessToken } = useAuth();
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
    stock: '',
    categoryIds: [] as string[],
    brandId: '',
    images: [] as string[],
    isActive: true,
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    loadCategories();
    loadBrands();
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        slug: product.slug,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryIds: product.categories.map(c => c.id),
        brandId: product.brandId || '',
        images: product.images,
        isActive: product.isActive,
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        slug: '',
        description: '',
        price: '',
        stock: '',
        categoryIds: [],
        brandId: '',
        images: [],
        isActive: true,
      });
    }
    setError(null);
  }, [product]);

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

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !product ? generateSlug(name) : prev.slug,
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

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
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
        stock: parseInt(formData.stock),
        categoryIds: formData.categoryIds,
        brandId: formData.brandId || undefined,
        images: formData.images,
        isActive: formData.isActive,
      };

      if (product) {
        await productsApi.update(product.id, data as UpdateProductDto, accessToken!);
      } else {
        await productsApi.create(data as CreateProductDto, accessToken!);
      }

      onSave();
    } catch (error: any) {
      console.error('Failed to save product:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении товара');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle>
          {product ? 'Редактирование товара' : 'Создание товара'}
        </SheetTitle>
        <SheetDescription>
          {product 
            ? `Редактируйте информацию о товаре "${product.name}"`
            : 'Создайте новый товар'
          }
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Основная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название товара <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div>
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

          {/* Категории */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Категории</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-4">
              {categories.map(category => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-2 flex-shrink-0"
                  />
                  <span 
                    className="text-sm flex-1" 
                    style={{ paddingLeft: `${category.level * 16}px` }}
                  >
                    {category.level > 0 && '└─ '}{category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Изображения */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Изображения</h3>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL изображения"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Добавить
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Изображение ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={submitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              product ? 'Сохранить изменения' : 'Создать товар'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}