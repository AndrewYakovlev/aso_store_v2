'use client';

import { ProductAttributeValueDto } from '@/lib/api/attributes/types';

interface ProductAttributesProps {
  attributes: ProductAttributeValueDto[];
}

export function ProductAttributes({ attributes }: ProductAttributesProps) {
  console.log('ProductAttributes received:', attributes);
  
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Характеристики</h3>
      <dl className="space-y-3">
        {attributes.map((attrValue) => {
          const attribute = attrValue.attribute;
          let value: string | null = null;

          // Определяем значение в зависимости от типа
          switch (attribute.type) {
            case 'SELECT_ONE':
            case 'SELECT_MANY':
              if (attrValue.optionIds && attrValue.optionIds.length > 0) {
                const selectedOptions = attribute.options?.filter(opt => 
                  attrValue.optionIds?.includes(opt.id)
                );
                value = selectedOptions?.map(opt => opt.value).join(', ') || null;
              }
              break;
            case 'NUMBER':
              if (attrValue.numberValue !== null) {
                value = `${attrValue.numberValue}${attribute.unit ? ' ' + attribute.unit : ''}`;
              }
              break;
            case 'TEXT':
              value = attrValue.textValue || null;
              break;
            case 'COLOR':
              value = attrValue.colorValue || null;
              break;
          }

          if (!value) return null;

          return (
            <div key={attribute.id} className="flex justify-between">
              <dt className="text-gray-500">{attribute.name}:</dt>
              <dd className="text-gray-900 font-medium">
                {attribute.type === 'COLOR' ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: value }}
                    />
                    <span>{value}</span>
                  </div>
                ) : (
                  value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}