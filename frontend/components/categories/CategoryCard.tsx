import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Category } from '@/lib/api/categories';
import { 
  WrenchScrewdriverIcon,
  FunnelIcon,
  StopIcon,
  Cog6ToothIcon,
  BoltIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

// Map category slugs to icons
const categoryIcons: Record<string, React.ReactNode> = {
  'masla-i-tekhnicheskie-zhidkosti': <BeakerIcon className="w-8 h-8" />,
  'filtry': <FunnelIcon className="w-8 h-8" />,
  'tormoznaya-sistema': <StopIcon className="w-8 h-8" />,
  'podveska': <WrenchScrewdriverIcon className="w-8 h-8" />,
  'dvigatel': <Cog6ToothIcon className="w-8 h-8" />,
  'elektrika': <BoltIcon className="w-8 h-8" />,
};

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const icon = categoryIcons[category.slug] || <WrenchScrewdriverIcon className="w-8 h-8" />;

  return (
    <Link href={`/catalog/${category.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-2 sm:space-y-4">
            <div className="text-blue-600">
              {icon}
            </div>
            <h3 className="font-medium text-sm sm:text-lg line-clamp-2">
              {category.name}
            </h3>
            {category.productCount !== undefined && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                {category.productCount} товаров
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}