import Link from 'next/link';
import { categoriesApi } from '@/lib/api/categories';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Каталог автозапчастей - АСО',
  description: 'Широкий выбор автозапчастей и расходных материалов. Масла, фильтры, тормозные системы и многое другое.',
};

export default async function CatalogPage() {
  // Получаем только корневые категории
  const allCategories = await categoriesApi.getTree(true);
  const rootCategories = allCategories.filter(cat => !cat.parentId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Каталог автозапчастей</h1>
      <p className="text-muted-foreground mb-8">
        Выберите категорию товаров для просмотра ассортимента
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rootCategories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog/${category.slug}`}
            className="group block"
          >
            <div className="border rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h2>
              
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              {/* Показываем подкатегории, если есть */}
              {category.children && category.children.length > 0 && (
                <div className="space-y-1 mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Подкатегории:</p>
                  {category.children.slice(0, 3).map((subcat) => (
                    <p key={subcat.id} className="text-sm text-muted-foreground">
                      • {subcat.name}
                    </p>
                  ))}
                  {category.children.length > 3 && (
                    <p className="text-sm text-primary font-medium">
                      и еще {category.children.length - 3}...
                    </p>
                  )}
                </div>
              )}
              
              {/* Количество товаров, если есть */}
              {category.productCount !== undefined && category.productCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Товаров: <span className="font-medium text-foreground">{category.productCount}</span>
                  </p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {rootCategories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Категории товаров временно недоступны
          </p>
        </div>
      )}
    </div>
  );
}