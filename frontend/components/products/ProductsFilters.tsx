'use client';

import { useState } from 'react';
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

  const handlePriceChange = (values: number[]) => {
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

  const clearAllFilters = () => {
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

      {/* Цена */}
      {filters.priceRange && (
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
                  placeholder="От"
                  value={selectedFilters.minPrice || ''}
                  onChange={(e) => onFiltersChange({ minPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-24"
                />
                <span>—</span>
                <Input
                  type="number"
                  placeholder="До"
                  value={selectedFilters.maxPrice || ''}
                  onChange={(e) => onFiltersChange({ maxPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-24"
                />
              </div>
              
              <Slider
                min={filters.priceRange.min}
                max={filters.priceRange.max}
                step={100}
                value={[
                  selectedFilters.minPrice || filters.priceRange.min,
                  selectedFilters.maxPrice || filters.priceRange.max
                ]}
                onValueChange={handlePriceChange}
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
      {filters.attributes?.map((attribute: any) => (
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
                    const currentValues = selectedFilters.attributes?.[attribute.id]?.values as string[] || [];
                    const isChecked = currentValues.includes(option.id);
                    
                    return (
                      <div key={option.id} className="flex items-center">
                        <Checkbox
                          id={`attr-${attribute.id}-${option.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const newValues = checked
                              ? [...currentValues, option.id]
                              : currentValues.filter(v => v !== option.id);
                            
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
                      placeholder="От"
                      className="w-24"
                      onChange={(e) => {
                        const min = e.target.value ? parseFloat(e.target.value) : attribute.range.min;
                        const max = (selectedFilters.attributes?.[attribute.id]?.values as number[])?.[1] || attribute.range.max;
                        handleAttributeChange(attribute.id, [min, max]);
                      }}
                    />
                    <span>—</span>
                    <Input
                      type="number"
                      placeholder="До"
                      className="w-24"
                      onChange={(e) => {
                        const min = (selectedFilters.attributes?.[attribute.id]?.values as number[])?.[0] || attribute.range.min;
                        const max = e.target.value ? parseFloat(e.target.value) : attribute.range.max;
                        handleAttributeChange(attribute.id, [min, max]);
                      }}
                    />
                    {attribute.unit && <span className="text-sm text-gray-500">{attribute.unit}</span>}
                  </div>
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
      ))}
    </div>
  );
}