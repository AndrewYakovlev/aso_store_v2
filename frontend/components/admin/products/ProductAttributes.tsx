'use client';

import { useState, useEffect } from 'react';
import { AttributeType, CategoryAttribute, ProductAttributeValue, SetProductAttributeDto } from '@/lib/api/attributes';
import { Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProductAttributesProps {
  categoryIds: string[];
  productAttributes: ProductAttributeValue[];
  onChange: (attributes: SetProductAttributeDto[]) => void;
}

export function ProductAttributes({ categoryIds, productAttributes, onChange }: ProductAttributesProps) {
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});

  // Load attributes for selected categories
  useEffect(() => {
    if (categoryIds.length === 0) {
      setCategoryAttributes([]);
      return;
    }

    loadCategoryAttributes();
  }, [categoryIds]);

  // Initialize values from existing product attributes
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    productAttributes.forEach(attr => {
      const key = attr.attributeId;
      
      switch (attr.attribute.type) {
        case AttributeType.TEXT:
          initialValues[key] = attr.textValue || '';
          break;
        case AttributeType.NUMBER:
          initialValues[key] = attr.numberValue?.toString() || '';
          break;
        case AttributeType.COLOR:
          initialValues[key] = attr.colorValue || '';
          break;
        case AttributeType.SELECT_ONE:
          initialValues[key] = attr.optionIds[0] || '';
          break;
        case AttributeType.SELECT_MANY:
          initialValues[key] = attr.optionIds || [];
          break;
      }
    });
    
    setValues(initialValues);
  }, [productAttributes]);

  // Update parent component when values change
  useEffect(() => {
    const attributes: SetProductAttributeDto[] = [];
    
    Object.entries(values).forEach(([attributeId, value]) => {
      const categoryAttr = categoryAttributes.find(ca => ca.attributeId === attributeId);
      if (!categoryAttr) return;
      
      const attr = categoryAttr.attribute;
      if (!attr) return;
      
      const dto: SetProductAttributeDto = { attributeId };
      
      switch (attr.type) {
        case AttributeType.TEXT:
          if (value) dto.textValue = value;
          break;
        case AttributeType.NUMBER:
          if (value) dto.numberValue = parseFloat(value);
          break;
        case AttributeType.COLOR:
          if (value) dto.colorValue = value;
          break;
        case AttributeType.SELECT_ONE:
          if (value) dto.optionIds = [value];
          break;
        case AttributeType.SELECT_MANY:
          if (value.length > 0) dto.optionIds = value;
          break;
      }
      
      // Only include if there's a value
      if (dto.textValue || dto.numberValue !== undefined || dto.colorValue || dto.optionIds) {
        attributes.push(dto);
      }
    });
    
    onChange(attributes);
  }, [values, categoryAttributes]);

  const loadCategoryAttributes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamic import to avoid circular dependency
      const { attributesApi } = await import('@/lib/api/attributes');
      const attributes = await attributesApi.getAttributesByCategoryIds(categoryIds);
      setCategoryAttributes(attributes.filter(ca => ca.attribute));
    } catch (err) {
      console.error('Failed to load category attributes:', err);
      setError('Не удалось загрузить характеристики');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (attributeId: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  const renderAttributeInput = (categoryAttr: CategoryAttribute) => {
    const { attribute, isRequired } = categoryAttr;
    if (!attribute) return null;
    
    const value = values[attribute.id] || '';
    
    switch (attribute.type) {
      case AttributeType.TEXT:
        return (
          <div key={attribute.id} className="space-y-2">
            <Label htmlFor={attribute.id}>
              {attribute.name}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
              {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
            </Label>
            <Textarea
              id={attribute.id}
              value={value}
              onChange={(e) => handleValueChange(attribute.id, e.target.value)}
              placeholder={`Введите ${attribute.name.toLowerCase()}`}
              className="min-h-[80px]"
              required={isRequired}
            />
          </div>
        );
        
      case AttributeType.NUMBER:
        return (
          <div key={attribute.id} className="space-y-2">
            <Label htmlFor={attribute.id}>
              {attribute.name}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
              {attribute.unit && <span className="text-gray-500 ml-1">({attribute.unit})</span>}
            </Label>
            <Input
              id={attribute.id}
              type="number"
              step="any"
              value={value}
              onChange={(e) => handleValueChange(attribute.id, e.target.value)}
              placeholder="0"
              required={isRequired}
            />
          </div>
        );
        
      case AttributeType.COLOR:
        return (
          <div key={attribute.id} className="space-y-2">
            <Label htmlFor={attribute.id}>
              {attribute.name}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                id={attribute.id}
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleValueChange(attribute.id, e.target.value)}
                className="w-20 h-10 p-1"
                required={isRequired}
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(attribute.id, e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
                className="flex-1"
              />
            </div>
          </div>
        );
        
      case AttributeType.SELECT_ONE:
        return (
          <div key={attribute.id} className="space-y-2">
            <Label htmlFor={attribute.id}>
              {attribute.name}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleValueChange(attribute.id, val)}
              required={isRequired}
            >
              <SelectTrigger id={attribute.id}>
                <SelectValue placeholder={`Выберите ${attribute.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {attribute.options.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case AttributeType.SELECT_MANY:
        const selectedIds = value || [];
        return (
          <div key={attribute.id} className="space-y-2">
            <Label>
              {attribute.name}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
              {attribute.options.map(option => (
                <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedIds.includes(option.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleValueChange(attribute.id, [...selectedIds, option.id]);
                      } else {
                        handleValueChange(attribute.id, selectedIds.filter((id: string) => id !== option.id));
                      }
                    }}
                  />
                  <span className="text-sm">{option.value}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  if (categoryIds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>Выберите категории для отображения характеристик</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Загрузка характеристик...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (categoryAttributes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Для выбранных категорий нет доступных характеристик</p>
      </div>
    );
  }

  // Group attributes by required/optional
  const requiredAttributes = categoryAttributes.filter(ca => ca.isRequired);
  const optionalAttributes = categoryAttributes.filter(ca => !ca.isRequired);

  return (
    <div className="space-y-6">
      {requiredAttributes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Обязательные характеристики</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredAttributes.map(renderAttributeInput)}
          </div>
        </div>
      )}
      
      {optionalAttributes.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Дополнительные характеристики</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalAttributes.map(renderAttributeInput)}
          </div>
        </div>
      )}
    </div>
  );
}