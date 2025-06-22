'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b">
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full pl-10 pr-4 py-2 text-lg border-0 focus:outline-none"
            />
            <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
          
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-4 py-2 bg-aso-blue text-white rounded-lg hover:bg-aso-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Найти
          </button>
        </div>
        
        {/* Recent searches or popular items could go here */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-500">
            Введите название товара, артикул или бренд
          </p>
        </div>
      </form>
    </div>
  );
}