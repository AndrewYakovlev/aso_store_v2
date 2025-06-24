'use client';

import { useState, useEffect } from 'react';
import { vehicleBrandsApi, VehicleBrand } from '@/lib/api/vehicles';
import { X, ChevronDown, Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface VehicleMakeMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function VehicleMakeMultiSelect({ 
  value, 
  onChange,
  placeholder = "Выберите марки автомобилей"
}: VehicleMakeMultiSelectProps) {
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
  };

  const toggleBrand = (brandId: string) => {
    const newValue = value.includes(brandId)
      ? value.filter(id => id !== brandId)
      : [...value, brandId];
    onChange(newValue);
  };

  const removeBrand = (brandId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== brandId));
  };

  const selectedBrands = brands.filter(brand => value.includes(brand.id));
  
  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.nameCyrillic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearchQuery(''); // Clear search when closing
        }
      }}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full min-h-[42px] px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <span className={value.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
              {value.length > 0 ? `Выбрано марок: ${value.length}` : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
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
                autoFocus
              />
            </div>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Загрузка...</div>
            ) : filteredBrands.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'Марки не найдены' : 'Нет доступных марок'}
              </div>
            ) : (
              <div className="p-1">
                {filteredBrands.map((brand) => (
                  <label
                    key={brand.id}
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <span className={value.includes(brand.id) ? 'font-medium' : ''}>
                        {brand.name}
                      </span>
                      {brand.country && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({brand.country})
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected brands tags */}
      {selectedBrands.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBrands.map((brand) => (
            <div
              key={brand.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-md"
            >
              <span>{brand.name}</span>
              <button
                type="button"
                onClick={(e) => removeBrand(brand.id, e)}
                className="hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}