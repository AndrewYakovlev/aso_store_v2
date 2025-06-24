'use client';

import { useState, useEffect, useRef } from 'react';
import { Category } from '@/lib/api/categories';
import { Search, X } from 'lucide-react';

interface CategoryWithLevel extends Category {
  level: number;
}

interface CategorySearchSelectProps {
  categories: CategoryWithLevel[];
  selectedIds: string[];
  onToggle: (categoryId: string) => void;
  placeholder?: string;
}

export function CategorySearchSelect({
  categories,
  selectedIds,
  onToggle,
  placeholder = "Поиск категорий..."
}: CategorySearchSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        {selectedCount > 0 ? (
          `Выбрано категорий: ${selectedCount}`
        ) : (
          'Категории не выбраны (необязательно)'
        )}
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto border rounded-lg p-4">
        {filteredCategories.length === 0 ? (
          <p className="text-gray-500 text-sm">Категории не найдены</p>
        ) : (
          filteredCategories.map(category => (
            <label key={category.id} className="flex items-center hover:bg-gray-50 px-2 py-1 rounded">
              <input
                type="checkbox"
                checked={selectedIds.includes(category.id)}
                onChange={() => onToggle(category.id)}
                className="mr-2 flex-shrink-0"
              />
              <span 
                className="text-sm flex-1" 
                style={{ paddingLeft: `${category.level * 16}px` }}
              >
                {category.level > 0 && '└─ '}{category.name}
              </span>
              {searchQuery && category.level > 0 && (
                <span className="text-xs text-gray-400 ml-2">
                  ({getParentPath(category.id, categories)})
                </span>
              )}
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function getParentPath(categoryId: string, categories: CategoryWithLevel[]): string {
  const category = categories.find(c => c.id === categoryId);
  if (!category || !category.parentId) return '';
  
  const parent = categories.find(c => c.id === category.parentId);
  if (!parent) return '';
  
  const parentPath = getParentPath(parent.id, categories);
  return parentPath ? `${parentPath} → ${parent.name}` : parent.name;
}