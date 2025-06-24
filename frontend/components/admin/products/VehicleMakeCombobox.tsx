'use client';

import { useState, useEffect } from 'react';
import { vehicleBrandsApi, VehicleBrand } from '@/lib/api/vehicles';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VehicleMakeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VehicleMakeCombobox({ 
  value, 
  onChange,
  placeholder = "Выберите марку автомобиля"
}: VehicleMakeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async (search?: string) => {
    setLoading(true);
    try {
      const response = await vehicleBrandsApi.getAll({
        search,
        onlyActive: true,
        limit: 1000,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      setBrands(response.items);
    } catch (error) {
      console.error('Failed to load vehicle brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2 || query.length === 0) {
      loadBrands(query);
    }
  };

  const selectedBrand = brands.find(brand => brand.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
        >
          <span className={selectedBrand ? 'text-gray-900' : 'text-gray-500'}>
            {selectedBrand ? selectedBrand.nameCyrillic : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Поиск марки..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Загрузка...</div>
          ) : brands.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'Марки не найдены' : 'Нет доступных марок'}
            </div>
          ) : (
            <div className="p-1">
              {/* Option to clear selection */}
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md flex items-center justify-between"
              >
                <span className="text-gray-500">Не выбрано</span>
              </button>
              
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onChange(brand.id);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 rounded-md flex items-center justify-between"
                >
                  <span className={value === brand.id ? 'font-medium' : ''}>
                    {brand.nameCyrillic}
                  </span>
                  {value === brand.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}