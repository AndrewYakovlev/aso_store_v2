import { Category } from '@/lib/api/categories';
import { CategoryCard } from './CategoryCard';

interface CategoriesGridProps {
  categories: Category[];
  title?: string;
}

export function CategoriesGrid({ categories, title = 'Категории товаров' }: CategoriesGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}