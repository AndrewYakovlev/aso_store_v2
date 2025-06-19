'use client';

import { useState, useEffect } from 'react';
import { categoriesApi, Category, CreateCategoryDto, UpdateCategoryDto } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  PencilIcon, 
  TrashIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';

export function AdminCategoriesList() {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<UpdateCategoryDto>({});
  const [newForm, setNewForm] = useState<CreateCategoryDto>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoriesApi.getAll({ 
        onlyActive: false, 
        includeProductCount: true 
      });
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (match) => {
        const ru = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
        const en = ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya'];
        return en[ru.indexOf(match)] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || undefined,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await categoriesApi.update(id, editForm, accessToken!);
      await loadCategories();
      setEditingId(null);
      setEditForm({});
    } catch (error: any) {
      console.error('Failed to update category:', error);
      alert(error.response?.data?.message || 'Ошибка при обновлении категории');
    }
  };

  const handleCreateNew = async () => {
    if (!newForm.name || !newForm.slug) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      await categoriesApi.create(newForm, accessToken!);
      await loadCategories();
      setCreatingNew(false);
      setNewForm({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        sortOrder: 0,
      });
    } catch (error: any) {
      console.error('Failed to create category:', error);
      alert(error.response?.data?.message || 'Ошибка при создании категории');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    setDeleting(id);
    try {
      await categoriesApi.delete(id, accessToken!);
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.message || 'Ошибка при удалении категории');
    } finally {
      setDeleting(null);
    }
  };

  const renderCategoryRow = (category: Category, level: number = 0) => {
    const isEditing = editingId === category.id;

    return (
      <tr key={category.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            {level > 0 && <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />}
            {isEditing ? (
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">{category.name}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <input
              type="text"
              value={editForm.slug || ''}
              onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
              className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
            />
          ) : (
            <span className="text-sm text-gray-500">{category.slug}</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900">{category.productCount || 0}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <input
              type="number"
              value={editForm.sortOrder || 0}
              onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) })}
              className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500 w-20"
            />
          ) : (
            <span className="text-sm text-gray-900">{category.sortOrder}</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {isEditing ? (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.isActive ?? true}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="mr-2"
              />
            </label>
          ) : (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Активна' : 'Неактивна'}
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSaveEdit(category.id)}
                  className="text-green-600 hover:text-green-900"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(category)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={deleting === category.id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-center py-12">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Категории товаров</h2>
          <button
            onClick={() => setCreatingNew(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Добавить категорию
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Товаров
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Порядок
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {creatingNew && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={newForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewForm({ 
                        ...newForm, 
                        name,
                        slug: generateSlug(name)
                      });
                    }}
                    placeholder="Название категории"
                    className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={newForm.slug}
                    onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                    placeholder="url-адрес"
                    className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">-</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    value={newForm.sortOrder}
                    onChange={(e) => setNewForm({ ...newForm, sortOrder: parseInt(e.target.value) })}
                    className="px-2 py-1 border rounded focus:outline-none focus:border-blue-500 w-20"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newForm.isActive}
                      onChange={(e) => setNewForm({ ...newForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">Активна</span>
                  </label>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCreateNew}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setCreatingNew(false);
                        setNewForm({
                          name: '',
                          slug: '',
                          description: '',
                          isActive: true,
                          sortOrder: 0,
                        });
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {categories.map(category => renderCategoryRow(category))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && !creatingNew && (
        <div className="text-center py-12">
          <p className="text-gray-500">Категории не найдены</p>
        </div>
      )}
    </div>
  );
}