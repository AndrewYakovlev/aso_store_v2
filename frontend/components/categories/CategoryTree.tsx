'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CategoryTree as CategoryTreeType } from '@/lib/api/categories';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface CategoryTreeItemProps {
  category: CategoryTreeType;
  level?: number;
}

function CategoryTreeItem({ category, level = 0 }: CategoryTreeItemProps) {
  const [isOpen, setIsOpen] = useState(level < 1);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded-md',
          level > 0 && 'ml-4'
        )}
      >
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            {isOpen ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        
        <Link
          href={`/catalog/${category.slug}`}
          className="flex-1 hover:text-blue-600"
        >
          <span className="font-medium">{category.name}</span>
          {category.productCount !== undefined && (
            <span className="text-sm text-muted-foreground ml-2">
              ({category.productCount})
            </span>
          )}
        </Link>
      </div>

      {hasChildren && isOpen && (
        <div className="ml-2">
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryTreeProps {
  categories: CategoryTreeType[];
  title?: string;
}

export function CategoryTree({ categories, title = 'Категории' }: CategoryTreeProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      {title && (
        <h3 className="font-semibold text-lg mb-4">{title}</h3>
      )}
      <div className="space-y-1">
        {categories.map((category) => (
          <CategoryTreeItem key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}