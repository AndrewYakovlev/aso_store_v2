import { categoriesApi } from '@/lib/api/categories';
import { CategoryTree } from '@/components/categories/CategoryTree';

export default async function CatalogPage() {
  const categories = await categoriesApi.getTree(true);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог автозапчастей</h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <CategoryTree categories={categories} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <p className="text-lg text-muted-foreground">
              Выберите категорию из списка слева для просмотра товаров
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}