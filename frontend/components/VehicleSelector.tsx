'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vehicleBrandsApi, vehicleModelsApi, VehicleBrand, VehicleModel } from '@/lib/api/vehicles';
import { Button } from '@/components/ui/button';
import { TruckIcon } from '@heroicons/react/24/outline';

export function VehicleSelector() {
  const router = useRouter();
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load models when brand is selected
  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand);
    } else {
      setModels([]);
      setSelectedModel('');
      setSelectedYear('');
    }
  }, [selectedBrand]);

  // Reset year when model changes
  useEffect(() => {
    setSelectedYear('');
  }, [selectedModel]);

  const loadBrands = async () => {
    try {
      const response = await vehicleBrandsApi.getAll({ 
        onlyActive: true, 
        limit: 1000,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      setBrands(response.items);
    } catch (error) {
      console.error('Failed to load brands:', error);
    }
  };

  const loadModels = async (brandSlug: string) => {
    try {
      setLoading(true);
      const modelsList = await vehicleModelsApi.getByBrand(brandSlug);
      setModels(modelsList);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYearOptions = () => {
    if (!selectedModel) return [];
    
    const model = models.find(m => m.slug === selectedModel);
    if (!model) return [];
    
    const startYear = model.yearFrom;
    const endYear = model.yearTo || new Date().getFullYear();
    const years = [];
    
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    
    return years;
  };

  const handleSubmit = () => {
    if (selectedBrand && selectedModel) {
      let url = `/vehicles/${selectedBrand}/${selectedModel}`;
      if (selectedYear) {
        url += `?year=${selectedYear}`;
      }
      router.push(url);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Подбор запчастей по автомобилю</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Brand selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Марка
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите марку</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Модель
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? 'Загрузка...' : 'Выберите модель'}
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.nameCyrillic || model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Год выпуска
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedModel}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Все годы</option>
            {getYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Submit button */}
        <div className="flex items-end">
          <Button
            onClick={handleSubmit}
            disabled={!selectedBrand || !selectedModel}
            className="w-full"
          >
            Найти запчасти
          </Button>
        </div>
      </div>
    </div>
  );
}