'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { ProductsFilter } from '@/lib/api/products';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface Props {
  filters: any;
  selectedFilters: ProductsFilter;
  onFiltersChange: (filters: Partial<ProductsFilter>) => void;
  loading?: boolean;
}

export function ProductsFilters({ filters, selectedFilters, onFiltersChange, loading }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories', 'brands', 'price']));
  
  // Локальные состояния для инпутов цены с debounce
  const [minPriceInput, setMinPriceInput] = useState<string>('');
  const [maxPriceInput, setMaxPriceInput] = useState<string>('');
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Локальные состояния для числовых атрибутов
  const [numberInputs, setNumberInputs] = useState<Record<string, { min: string; max: string }>>({});
  const numberDebounceRefs = useRef<Record<string, NodeJS.Timeout | null>>({});
  
  // Инициализация значений цены при загрузке и изменении фильтров
  useEffect(() => {
    if (filters?.priceRange) {
      // Инициализируем только если значения еще не установлены
      if (!minPriceInput && !maxPriceInput) {
        setMinPriceInput(selectedFilters.minPrice?.toString() || '');
        setMaxPriceInput(selectedFilters.maxPrice?.toString() || '');
      }
    }
  }, [filters?.priceRange]);
  
  // Синхронизация с URL параметрами
  useEffect(() => {
    if (selectedFilters.minPrice !== undefined || selectedFilters.maxPrice !== undefined) {
      setMinPriceInput(selectedFilters.minPrice?.toString() || '');
      setMaxPriceInput(selectedFilters.maxPrice?.toString() || '');
    }
  }, [selectedFilters.minPrice, selectedFilters.maxPrice]);
  
  // Инициализация значений числовых атрибутов
  useEffect(() => {
    if (filters?.attributes) {
      const newNumberInputs: Record<string, { min: string; max: string }> = {};
      
      filters.attributes.forEach((attr: any) => {
        if (attr.type === 'NUMBER' && attr.range) {
          const currentValues = selectedFilters.attributes?.[attr.id]?.values as number[] | undefined;
          if (!numberInputs[attr.id]) {
            newNumberInputs[attr.id] = {
              min: currentValues?.[0]?.toString() || '',
              max: currentValues?.[1]?.toString() || '',
            };
          }
        }
      });
      
      if (Object.keys(newNumberInputs).length > 0) {
        setNumberInputs(prev => ({ ...prev, ...newNumberInputs }));
      }
    }
  }, [filters?.attributes]);
  
  // Синхронизация числовых атрибутов с URL параметрами
  useEffect(() => {
    if (selectedFilters.attributes) {
      const updates: Record<string, { min: string; max: string }> = {};
      
      Object.entries(selectedFilters.attributes).forEach(([attrId, filter]) => {
        const values = filter.values as number[] | undefined;
        if (Array.isArray(values) && values.length === 2) {
          updates[attrId] = {
            min: values[0].toString(),
            max: values[1].toString(),
          };
        }
      });
      
      if (Object.keys(updates).length > 0) {
        setNumberInputs(prev => ({ ...prev, ...updates }));
      }
    }
  }, [selectedFilters.attributes]);
  
  // Очистка таймеров при размонтировании
  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
      Object.values(numberDebounceRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = selectedFilters.categoryIds || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId);
    
    onFiltersChange({ categoryIds: newCategories });
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const currentBrands = selectedFilters.brandIds || [];
    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter(id => id !== brandId);
    
    onFiltersChange({ brandIds: newBrands });
  };

  // Обработка изменения цены с debounce
  const handlePriceInputChange = (type: 'min' | 'max', value: string) => {
    // Обновляем локальное состояние сразу
    if (type === 'min') {
      setMinPriceInput(value);
    } else {
      setMaxPriceInput(value);
    }
    
    // Отменяем предыдущий таймер
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }
    
    // Устанавливаем новый таймер
    priceDebounceRef.current = setTimeout(() => {
      const minValue = type === 'min' ? value : minPriceInput;
      const maxValue = type === 'max' ? value : maxPriceInput;
      
      const min = minValue ? parseInt(minValue) : undefined;
      const max = maxValue ? parseInt(maxValue) : undefined;
      
      // Валидация: минимальная цена не должна быть больше максимальной
      if (min !== undefined && max !== undefined && min >= max) {
        return;
      }
      
      onFiltersChange({
        minPrice: min,
        maxPrice: max,
      });
    }, 1000);
  };
  
  // Обработка слайдера цены - только обновляем локальное состояние
  const handlePriceSliderChange = (values: number[]) => {
    setMinPriceInput(values[0].toString());
    setMaxPriceInput(values[1].toString());
    
    // Отменяем debounce таймер, если он есть
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }
  };
  
  // Применение фильтра при отпускании слайдера
  const handlePriceSliderCommit = (values: number[]) => {
    onFiltersChange({
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleAttributeChange = (attributeId: string, value: any) => {
    const currentAttributes = selectedFilters.attributes || {};
    const newAttributes = { ...currentAttributes };
    
    if (value === null || (Array.isArray(value) && value.length === 0)) {
      delete newAttributes[attributeId];
    } else {
      newAttributes[attributeId] = { values: value };
    }
    
    onFiltersChange({ attributes: newAttributes });
  };
  
  // Обработка изменения числовых атрибутов с debounce
  const handleNumberAttributeInputChange = (attributeId: string, type: 'min' | 'max', value: string, range: { min: number; max: number }) => {
    // Обновляем локальное состояние сразу
    setNumberInputs(prev => ({
      ...prev,
      [attributeId]: {
        ...prev[attributeId],
        [type]: value,
      },
    }));
    
    // Отменяем предыдущий таймер для этого атрибута
    if (numberDebounceRefs.current[attributeId]) {
      clearTimeout(numberDebounceRefs.current[attributeId]!);
    }
    
    // Устанавливаем новый таймер
    numberDebounceRefs.current[attributeId] = setTimeout(() => {
      const currentInput = numberInputs[attributeId] || { min: '', max: '' };
      const minValue = type === 'min' ? value : currentInput.min;
      const maxValue = type === 'max' ? value : currentInput.max;
      
      const min = minValue ? parseFloat(minValue) : range.min;
      const max = maxValue ? parseFloat(maxValue) : range.max;
      
      // Валидация: минимальное значение не должно быть больше максимального
      if (min >= max) {
        return;
      }
      
      handleAttributeChange(attributeId, [min, max]);
    }, 1000);
  };
  
  // Обработка слайдера числовых атрибутов - только обновляем локальное состояние
  const handleNumberAttributeSliderChange = (attributeId: string, values: number[]) => {
    setNumberInputs(prev => ({
      ...prev,
      [attributeId]: {
        min: values[0].toString(),
        max: values[1].toString(),
      },
    }));
    
    // Отменяем debounce таймер, если он есть
    if (numberDebounceRefs.current[attributeId]) {
      clearTimeout(numberDebounceRefs.current[attributeId]!);
    }
  };
  
  // Применение фильтра при отпускании слайдера
  const handleNumberAttributeSliderCommit = (attributeId: string, values: number[]) => {
    handleAttributeChange(attributeId, values);
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setNumberInputs({});
    
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }
    
    Object.values(numberDebounceRefs.current).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    numberDebounceRefs.current = {};
    
    onFiltersChange({
      categoryIds: [],
      brandIds: [],
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      attributes: {},
    });
  };

  if (loading || !filters) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasActiveFilters = 
    (selectedFilters.categoryIds?.length || 0) > 0 ||
    (selectedFilters.brandIds?.length || 0) > 0 ||
    selectedFilters.minPrice !== undefined ||
    selectedFilters.maxPrice !== undefined ||
    selectedFilters.inStock ||
    Object.keys(selectedFilters.attributes || {}).length > 0;

  return (
    <div className="space-y-6">
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Фильтры</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      {/* Категории */}
      {filters.categories?.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('categories')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            Категории
            {expandedSections.has('categories') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has('categories') && (
            <div className="mt-3 space-y-2">
              {filters.categories.map((category: any) => (
                <div key={category.id} className="flex items-center">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedFilters.categoryIds?.includes(category.id) || false}
                    onCheckedChange={(checked) => handleCategoryChange(category.id, !!checked)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="ml-2 text-sm font-normal cursor-pointer flex-1"
                  >
                    {category.name}
                    <span className="text-gray-500 ml-1">({category.count})</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Бренды */}
      {filters.brands?.length > 0 && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('brands')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            Бренды
            {expandedSections.has('brands') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has('brands') && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {filters.brands.map((brand: any) => (
                <div key={brand.id} className="flex items-center">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedFilters.brandIds?.includes(brand.id) || false}
                    onCheckedChange={(checked) => handleBrandChange(brand.id, !!checked)}
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="ml-2 text-sm font-normal cursor-pointer flex-1"
                  >
                    {brand.name}
                    <span className="text-gray-500 ml-1">({brand.count})</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Цена - показываем только если min и max различаются */}
      {filters.priceRange && filters.priceRange.min !== filters.priceRange.max && (
        <div className="border-b pb-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            Цена
            {expandedSections.has('price') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has('price') && (
            <div className="mt-3 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={`От ${filters.priceRange.min}`}
                  value={minPriceInput}
                  onChange={(e) => handlePriceInputChange('min', e.target.value)}
                  min={filters.priceRange.min}
                  max={maxPriceInput ? parseInt(maxPriceInput) - 1 : filters.priceRange.max}
                  className="w-28"
                />
                <span>—</span>
                <Input
                  type="number"
                  placeholder={`До ${filters.priceRange.max}`}
                  value={maxPriceInput}
                  onChange={(e) => handlePriceInputChange('max', e.target.value)}
                  min={minPriceInput ? parseInt(minPriceInput) + 1 : filters.priceRange.min}
                  max={filters.priceRange.max}
                  className="w-28"
                />
              </div>
              
              <div className="text-xs text-gray-500">
                Диапазон: {filters.priceRange.min} - {filters.priceRange.max} ₽
              </div>
              
              <Slider
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                step={10}
                value={[
                  minPriceInput ? parseInt(minPriceInput) : filters.priceRange.min,
                  maxPriceInput ? parseInt(maxPriceInput) : filters.priceRange.max
                ]}
                onValueChange={handlePriceSliderChange}
                onValueCommit={handlePriceSliderCommit}
                className="mt-2"
              />
            </div>
          )}
        </div>
      )}

      {/* В наличии */}
      <div className="border-b pb-4">
        <div className="flex items-center">
          <Checkbox
            id="in-stock"
            checked={selectedFilters.inStock || false}
            onCheckedChange={(checked) => onFiltersChange({ inStock: !!checked || undefined })}
          />
          <Label
            htmlFor="in-stock"
            className="ml-2 text-sm font-normal cursor-pointer"
          >
            Только в наличии
          </Label>
        </div>
      </div>

      {/* Атрибуты */}
      {filters.attributes?.map((attribute: any) => {
        // Пропускаем числовые атрибуты, если min и max совпадают
        if (attribute.type === 'NUMBER' && attribute.range) {
          if (attribute.range.min === attribute.range.max) {
            return null;
          }
        }
        
        // Пропускаем SELECT атрибуты без опций
        if ((attribute.type === 'SELECT_ONE' || attribute.type === 'SELECT_MANY') && (!attribute.options || attribute.options.length === 0)) {
          return null;
        }
        
        return (
        <div key={attribute.id} className="border-b pb-4">
          <button
            onClick={() => toggleSection(`attr-${attribute.id}`)}
            className="flex items-center justify-between w-full text-left font-medium"
          >
            {attribute.name}
            {expandedSections.has(`attr-${attribute.id}`) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {expandedSections.has(`attr-${attribute.id}`) && (
            <div className="mt-3">
              {/* SELECT_ONE и SELECT_MANY */}
              {(attribute.type === 'SELECT_ONE' || attribute.type === 'SELECT_MANY') && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {attribute.options?.map((option: any) => {
                    const currentAttributeFilter = selectedFilters.attributes?.[attribute.id];
                    const currentValues = currentAttributeFilter?.values || [];
                    const valuesArray: string[] = Array.isArray(currentValues) 
                      ? (currentValues as string[])
                      : [currentValues as string];
                    const isChecked = valuesArray.includes(option.id);
                    
                    return (
                      <div key={option.id} className="flex items-center">
                        <Checkbox
                          id={`attr-${attribute.id}-${option.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newValues = checked
                              ? [...valuesArray, option.id]
                              : valuesArray.filter(v => v !== option.id);
                            
                            handleAttributeChange(
                              attribute.id,
                              newValues.length > 0 ? newValues : null
                            );
                          }}
                        />
                        <Label
                          htmlFor={`attr-${attribute.id}-${option.id}`}
                          className="ml-2 text-sm font-normal cursor-pointer flex-1"
                        >
                          {option.value}
                          <span className="text-gray-500 ml-1">({option.count})</span>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* NUMBER */}
              {attribute.type === 'NUMBER' && attribute.range && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder={`От ${attribute.range.min}`}
                      value={numberInputs[attribute.id]?.min || ''}
                      onChange={(e) => handleNumberAttributeInputChange(attribute.id, 'min', e.target.value, attribute.range)}
                      min={attribute.range.min}
                      max={numberInputs[attribute.id]?.max ? parseFloat(numberInputs[attribute.id].max) - 1 : attribute.range.max}
                      className="w-28"
                    />
                    <span>—</span>
                    <Input
                      type="number"
                      placeholder={`До ${attribute.range.max}`}
                      value={numberInputs[attribute.id]?.max || ''}
                      onChange={(e) => handleNumberAttributeInputChange(attribute.id, 'max', e.target.value, attribute.range)}
                      min={numberInputs[attribute.id]?.min ? parseFloat(numberInputs[attribute.id].min) + 1 : attribute.range.min}
                      max={attribute.range.max}
                      className="w-28"
                    />
                    {attribute.unit && <span className="text-sm text-gray-500">{attribute.unit}</span>}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Диапазон: {attribute.range.min} - {attribute.range.max} {attribute.unit || ''}
                  </div>
                  
                  <Slider
                    min={attribute.range.min}
                    max={attribute.range.max}
                    step={1}
                    value={[
                      numberInputs[attribute.id]?.min ? parseFloat(numberInputs[attribute.id].min) : attribute.range.min,
                      numberInputs[attribute.id]?.max ? parseFloat(numberInputs[attribute.id].max) : attribute.range.max
                    ]}
                    onValueChange={(values) => handleNumberAttributeSliderChange(attribute.id, values)}
                    onValueCommit={(values) => handleNumberAttributeSliderCommit(attribute.id, values)}
                    className="mt-2"
                  />
                </div>
              )}

              {/* COLOR */}
              {attribute.type === 'COLOR' && (
                <div className="grid grid-cols-4 gap-2">
                  {attribute.colors?.map((color: any) => {
                    const isSelected = selectedFilters.attributes?.[attribute.id]?.values === color.value;
                    
                    return (
                      <button
                        key={color.value}
                        onClick={() => handleAttributeChange(attribute.id, isSelected ? null : color.value)}
                        className={`
                          w-8 h-8 rounded-full border-2 relative
                          ${isSelected ? 'border-blue-500' : 'border-gray-300'}
                        `}
                        style={{ backgroundColor: color.value }}
                        title={`${color.value} (${color.count})`}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}