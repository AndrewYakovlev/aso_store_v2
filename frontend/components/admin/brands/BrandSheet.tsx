'use client';

import { useState, useEffect } from 'react';
import { brandsApi, BrandDto, CreateBrandDto, UpdateBrandDto } from '@/lib/api/brands';
import { useAuth } from '@/lib/contexts/AuthContext';
import { generateSlug } from '@/lib/utils/slug';
import { Loader2 } from 'lucide-react';
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface BrandSheetProps {
  brand: BrandDto | null;
  onSave: () => void;
  onCancel: () => void;
}

export function BrandSheet({ brand, onSave, onCancel }: BrandSheetProps) {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    country: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        country: brand.country || '',
        isActive: brand.isActive,
        sortOrder: brand.sortOrder,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        website: '',
        country: '',
        isActive: true,
        sortOrder: 0,
      });
    }
    setError(null);
  }, [brand]);

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: !brand ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: CreateBrandDto | UpdateBrandDto = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        website: formData.website || undefined,
        country: formData.country || undefined,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      if (brand) {
        await brandsApi.update(brand.id, data as UpdateBrandDto, accessToken!);
      } else {
        await brandsApi.create(data as CreateBrandDto, accessToken!);
      }

      onSave();
    } catch (error: any) {
      console.error('Failed to save brand:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении бренда');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 py-4 border-b">
        <SheetTitle>
          {brand ? 'Редактирование бренда' : 'Создание бренда'}
        </SheetTitle>
        <SheetDescription>
          {brand 
            ? `Редактируйте информацию о бренде "${brand.name}"`
            : 'Создайте новый бренд товаров'
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название бренда <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите название бренда"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL-адрес (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="url-адрес-бренда"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Опишите бренд"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL логотипа
            </label>
            <input
              type="url"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo && (
              <div className="mt-2">
                <img
                  src={formData.logo}
                  alt="Предпросмотр логотипа"
                  className="h-16 w-16 object-contain border rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Веб-сайт
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://brand-website.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Страна происхождения
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Россия, Германия, Япония..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порядок сортировки
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Бренды с меньшим номером отображаются первыми
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                Бренд активен
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Неактивные бренды не отображаются на сайте
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              brand ? 'Сохранить изменения' : 'Создать бренд'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}