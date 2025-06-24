'use client';

import { useState, useEffect } from 'react';
import { productsApi, Product, CreateProductDto, UpdateProductDto } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { brandsApi, BrandWithProductsCount } from '@/lib/api/brands';
import { attributesApi, ProductAttributeValue, SetProductAttributeDto } from '@/lib/api/attributes';
import { useAuth } from '@/lib/contexts/AuthContext';
import { generateSlug } from '@/lib/utils/slug';
import { Loader2 } from 'lucide-react';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CategorySearchSelect } from './CategorySearchSelect';
import { ProductImagesManager } from './ProductImagesManager';
import { BrandCombobox } from './BrandCombobox';
import { ProductAttributes } from './ProductAttributes';
import { VehicleMakeMultiSelect } from './VehicleMakeMultiSelect';
import { VehicleModelsSelector } from './VehicleModelsSelector';
import { CreateProductVehicle } from '@/lib/api/product-vehicles';

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
  const [productAttributes, setProductAttributes] = useState<ProductAttributeValue[]>([]);
  const [pendingAttributes, setPendingAttributes] = useState<SetProductAttributeDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleMakes, setSelectedVehicleMakes] = useState<string[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<CreateProductVehicle[]>([]);

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
    productImages: [] as any[],
    isActive: true,
    excludeFromPromoCodes: false,
  });

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
        oldPrice: product.oldPrice?.toString() || '',
        stock: product.stock.toString(),
        categoryIds: product.categories.map(c => c.id),
        brandId: product.brandId || '',
        productImages: product.productImages || [],
        isActive: product.isActive,
        excludeFromPromoCodes: product.excludeFromPromoCodes || false,
      });
      loadProductAttributes(product.id);
      // Set selected vehicle makes if product has vehicles
      if (product.vehicles && product.vehicles.length > 0) {
        const brandIds = new Set<string>();
        product.vehicles.forEach(vehicle => {
          if (vehicle.vehicleModel?.brandId) {
            brandIds.add(vehicle.vehicleModel.brandId);
          }
        });
        setSelectedVehicleMakes(Array.from(brandIds));
      }
    } else {
      setFormData({
        name: '',
        sku: '',
        slug: '',
        description: '',
        price: '',
        oldPrice: '',
        stock: '',
        categoryIds: [],
        brandId: '',
        productImages: [],
        isActive: true,
        excludeFromPromoCodes: false,
      });
      setProductAttributes([]);
      setSelectedVehicleMakes([]);
      setPendingVehicles([]);
    }
    setError(null);
    setPendingAttributes([]);
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

  const loadProductAttributes = async (productId: string) => {
    try {
      const attributes = await attributesApi.getProductAttributes(productId);
      setProductAttributes(attributes);
    } catch (error) {
      console.error('Failed to load product attributes:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Не отправляем images, так как они управляются через отдельную таблицу ProductImage
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
        excludeFromPromoCodes: formData.excludeFromPromoCodes,
      };

      let savedProductId: string;
      
      if (product) {
        await productsApi.update(product.id, data as UpdateProductDto, accessToken!);
        savedProductId = product.id;
      } else {
        const newProduct = await productsApi.create(data as CreateProductDto, accessToken!);
        savedProductId = newProduct.id;
      }

      // Save product attributes
      if (pendingAttributes.length > 0 && savedProductId) {
        try {
          await attributesApi.setProductAttributes(
            savedProductId,
            { attributes: pendingAttributes },
            accessToken!
          );
        } catch (error) {
          console.error('Failed to save product attributes:', error);
        }
      }

      // Save product vehicles
      if (pendingVehicles.length > 0 && savedProductId) {
        try {
          const { apiRequest } = await import('@/lib/api/client');
          await apiRequest(`/products/${savedProductId}/vehicles/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ vehicles: pendingVehicles }),
          });
        } catch (error) {
          console.error('Failed to save product vehicles:', error);
        }
      }

      // Загружаем временные изображения (blob URL) после создания товара
      const tempImages = formData.productImages.filter(img => 
        img.url.startsWith('blob:') && (img as any)._file
      );
      
      if (tempImages.length > 0 && savedProductId) {
        // Импортируем API для изображений
        const { productImagesApi } = await import('@/lib/api/product-images');
        
        for (const tempImage of tempImages) {
          const file = (tempImage as any)._file as File;
          if (file) {
            try {
              await productImagesApi.uploadImage(
                savedProductId,
                file,
                { 
                  alt: tempImage.alt,
                  isMain: tempImage.isMain 
                },
                accessToken!
              );
            } catch (error) {
              console.error('Failed to upload image after product save:', error);
            }
          }
        }
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
    <div className="flex flex-col h-full overflow-hidden">
      <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
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

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex-shrink-0">
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
                <BrandCombobox
                  value={formData.brandId}
                  onChange={(value) => setFormData(prev => ({ ...prev, brandId: value }))}
                  brands={brands}
                  onBrandsUpdate={loadBrands}
                />
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
                  Старая цена (для отображения скидки)
                </label>
                <input
                  type="number"
                  value={formData.oldPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, oldPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Товар активен</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.excludeFromPromoCodes}
                  onChange={(e) => setFormData(prev => ({ ...prev, excludeFromPromoCodes: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Исключить из промокодов</span>
              </label>
            </div>
          </div>

          {/* Категории */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Категории
              <span className="text-sm font-normal text-gray-500 ml-2">(необязательно)</span>
            </h3>
            <CategorySearchSelect
              categories={categories}
              selectedIds={formData.categoryIds}
              onToggle={handleCategoryToggle}
            />
          </div>

          {/* Характеристики */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Характеристики
              <span className="text-sm font-normal text-gray-500 ml-2">
                (доступны после выбора категорий)
              </span>
            </h3>
            <ProductAttributes
              categoryIds={formData.categoryIds}
              productAttributes={productAttributes}
              onChange={setPendingAttributes}
            />
          </div>

          {/* Совместимость с автомобилями */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Совместимость с автомобилями
              <span className="text-sm font-normal text-gray-500 ml-2">
                (укажите марки и модели автомобилей)
              </span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Марки автомобилей
                </label>
                <VehicleMakeMultiSelect
                  value={selectedVehicleMakes}
                  onChange={setSelectedVehicleMakes}
                />
              </div>
              
              {selectedVehicleMakes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Модели и годы выпуска
                  </label>
                  <VehicleModelsSelector
                    brandIds={selectedVehicleMakes}
                    selectedVehicles={product?.vehicles || []}
                    onChange={setPendingVehicles}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Изображения */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Изображения</h3>
            <ProductImagesManager
              productId={product?.id}
              images={formData.productImages}
              onImagesChange={(images) => setFormData(prev => ({ ...prev, productImages: images }))}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t flex-shrink-0">
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