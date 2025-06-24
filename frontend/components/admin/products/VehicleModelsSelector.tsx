'use client';

import { useState, useEffect } from 'react';
import { vehicleModelsApi, VehicleModel, vehicleBrandsApi, VehicleBrand } from '@/lib/api/vehicles';
import { ProductVehicle } from '@/lib/api/products';
import { Loader2, ChevronRight, ChevronDown, Search } from 'lucide-react';

interface VehicleSelection {
  vehicleModelId: string;
  yearFrom?: number;
  yearTo?: number;
  fitmentNotes?: string;
  isUniversal?: boolean;
}

interface VehicleModelsSelectorProps {
  brandIds: string[];
  selectedVehicles: ProductVehicle[];
  onChange: (vehicles: VehicleSelection[]) => void;
}

export function VehicleModelsSelector({ 
  brandIds, 
  selectedVehicles,
  onChange 
}: VehicleModelsSelectorProps) {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
  const [modelsByBrand, setModelsByBrand] = useState<Map<string, VehicleModel[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [vehicleSelections, setVehicleSelections] = useState<Map<string, VehicleSelection>>(new Map());
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [loadingBrands, setLoadingBrands] = useState<Set<string>>(new Set());
  const [searchQueries, setSearchQueries] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    // Initialize selections from existing vehicles
    const selections = new Map<string, VehicleSelection>();
    selectedVehicles.forEach(vehicle => {
      selections.set(vehicle.vehicleModelId, {
        vehicleModelId: vehicle.vehicleModelId,
        yearFrom: vehicle.yearFrom,
        yearTo: vehicle.yearTo,
        fitmentNotes: vehicle.fitmentNotes,
        isUniversal: vehicle.isUniversal,
      });
    });
    setVehicleSelections(selections);
  }, [selectedVehicles]);

  useEffect(() => {
    if (brandIds.length > 0) {
      loadBrands();
    } else {
      setBrands([]);
      setModelsByBrand(new Map());
      setVehicleSelections(new Map());
      onChange([]);
    }
  }, [brandIds]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      // Load brand details for selected IDs
      const brandPromises = brandIds.map(id => vehicleBrandsApi.getById(id));
      const loadedBrands = await Promise.all(brandPromises);
      setBrands(loadedBrands);
    } catch (error) {
      console.error('Failed to load vehicle brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBrandExpansion = async (brandId: string) => {
    const newExpanded = new Set(expandedBrands);
    
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId);
    } else {
      newExpanded.add(brandId);
      
      // Load models if not already loaded
      if (!modelsByBrand.has(brandId)) {
        await loadModelsForBrand(brandId);
      }
    }
    
    setExpandedBrands(newExpanded);
  };

  const loadModelsForBrand = async (brandId: string) => {
    setLoadingBrands(prev => new Set(prev).add(brandId));
    
    try {
      const response = await vehicleModelsApi.getAll({
        brandId,
        onlyActive: true,
        limit: 1000,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      setModelsByBrand(prev => {
        const newMap = new Map(prev);
        newMap.set(brandId, response.items);
        return newMap;
      });
    } catch (error) {
      console.error(`Failed to load models for brand ${brandId}:`, error);
    } finally {
      setLoadingBrands(prev => {
        const newSet = new Set(prev);
        newSet.delete(brandId);
        return newSet;
      });
    }
  };

  const handleToggleModel = (modelId: string) => {
    const newSelections = new Map(vehicleSelections);
    
    if (newSelections.has(modelId)) {
      newSelections.delete(modelId);
    } else {
      // Find the model to get default years
      let model: VehicleModel | undefined;
      for (const models of modelsByBrand.values()) {
        model = models.find(m => m.id === modelId);
        if (model) break;
      }
      
      if (model) {
        newSelections.set(modelId, {
          vehicleModelId: modelId,
          yearFrom: model.yearFrom,
          yearTo: model.yearTo,
        });
      }
    }
    
    setVehicleSelections(newSelections);
    onChange(Array.from(newSelections.values()));
  };

  const handleYearChange = (modelId: string, field: 'yearFrom' | 'yearTo', value: string) => {
    const newSelections = new Map(vehicleSelections);
    const selection = newSelections.get(modelId);
    
    if (selection) {
      const year = value ? parseInt(value) : undefined;
      newSelections.set(modelId, {
        ...selection,
        [field]: year,
      });
      setVehicleSelections(newSelections);
      onChange(Array.from(newSelections.values()));
    }
  };

  const handleNotesChange = (modelId: string, notes: string) => {
    const newSelections = new Map(vehicleSelections);
    const selection = newSelections.get(modelId);
    
    if (selection) {
      newSelections.set(modelId, {
        ...selection,
        fitmentNotes: notes || undefined,
      });
      setVehicleSelections(newSelections);
      onChange(Array.from(newSelections.values()));
    }
  };

  const handleUniversalChange = (modelId: string, isUniversal: boolean) => {
    const newSelections = new Map(vehicleSelections);
    const selection = newSelections.get(modelId);
    
    if (selection) {
      newSelections.set(modelId, {
        ...selection,
        isUniversal,
      });
      setVehicleSelections(newSelections);
      onChange(Array.from(newSelections.values()));
    }
  };

  const handleSearchChange = (brandId: string, query: string) => {
    setSearchQueries(prev => {
      const newMap = new Map(prev);
      newMap.set(brandId, query);
      return newMap;
    });
  };

  const getFilteredModels = (brandId: string, models: VehicleModel[]) => {
    const searchQuery = searchQueries.get(brandId) || '';
    if (!searchQuery) return models;
    
    const query = searchQuery.toLowerCase();
    return models.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.nameCyrillic.toLowerCase().includes(query) ||
      model.class.toLowerCase().includes(query)
    );
  };

  const currentYear = new Date().getFullYear();

  if (brandIds.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Сначала выберите марки автомобилей
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-500">Загрузка марок...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        Выберите модели и укажите годы выпуска совместимых автомобилей
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg">
        {brands.map((brand) => {
          const isExpanded = expandedBrands.has(brand.id);
          const models = modelsByBrand.get(brand.id) || [];
          const isLoadingModels = loadingBrands.has(brand.id);
          
          return (
            <div key={brand.id} className="border-b last:border-b-0">
              {/* Brand header */}
              <button
                type="button"
                onClick={() => toggleBrandExpansion(brand.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 mr-2 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2 text-gray-500" />
                  )}
                  <span className="font-medium">{brand.name}</span>
                </div>
                {isLoadingModels && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                )}
              </button>
              
              {/* Models list */}
              {isExpanded && (
                <div className="px-4 pb-3">
                  {isLoadingModels ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      Загрузка моделей...
                    </div>
                  ) : models.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      Нет доступных моделей
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Search input */}
                      <div className="relative mb-3">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQueries.get(brand.id) || ''}
                          onChange={(e) => handleSearchChange(brand.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                            }
                          }}
                          placeholder="Поиск модели..."
                          className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {getFilteredModels(brand.id, models).length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">
                          Модели не найдены
                        </div>
                      ) : (
                        getFilteredModels(brand.id, models).map((model) => {
                        const isSelected = vehicleSelections.has(model.id);
                        const selection = vehicleSelections.get(model.id);
                        
                        return (
                          <div key={model.id} className="space-y-2">
                            <label className="flex items-start">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleModel(model.id)}
                                className="mt-1 mr-3"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {model.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {model.yearFrom} - {model.yearTo || 'н.в.'} | {model.class}
                                </div>
                              </div>
                            </label>
                            
                            {isSelected && selection && (
                              <div className="ml-6 space-y-2 pb-2">
                                <div className="flex gap-2 items-center">
                                  <label className="text-xs text-gray-600 w-24">
                                    Год от:
                                  </label>
                                  <input
                                    type="number"
                                    value={selection.yearFrom || ''}
                                    onChange={(e) => handleYearChange(model.id, 'yearFrom', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                      }
                                    }}
                                    placeholder={model.yearFrom.toString()}
                                    min={model.yearFrom}
                                    max={selection.yearTo || model.yearTo || currentYear}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                  
                                  <label className="text-xs text-gray-600 ml-2">
                                    до:
                                  </label>
                                  <input
                                    type="number"
                                    value={selection.yearTo || ''}
                                    onChange={(e) => handleYearChange(model.id, 'yearTo', e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                      }
                                    }}
                                    placeholder={model.yearTo?.toString() || currentYear.toString()}
                                    min={selection.yearFrom || model.yearFrom}
                                    max={model.yearTo || currentYear}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div className="flex gap-2 items-center">
                                  <label className="text-xs text-gray-600 w-24">
                                    Примечания:
                                  </label>
                                  <input
                                    type="text"
                                    value={selection.fitmentNotes || ''}
                                    onChange={(e) => handleNotesChange(model.id, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                      }
                                    }}
                                    placeholder="Например: только для дизельных двигателей"
                                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <label className="flex items-center ml-24">
                                  <input
                                    type="checkbox"
                                    checked={selection.isUniversal || false}
                                    onChange={(e) => handleUniversalChange(model.id, e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-xs text-gray-600">
                                    Универсальная запчасть (подходит для всех модификаций)
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-500">
        * Если не указаны годы, будут использованы годы выпуска модели
      </div>
    </div>
  );
}