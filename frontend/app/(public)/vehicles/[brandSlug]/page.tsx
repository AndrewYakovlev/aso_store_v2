import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { vehicleBrandsApi, vehicleModelsApi } from '@/lib/api/vehicles';
import { BreadcrumbsComponent, BreadcrumbItemType } from '@/components/shared/BreadcrumbsComponent';

interface Props {
  params: Promise<{ brandSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  
  try {
    const brand = await vehicleBrandsApi.getBySlug(brandSlug);
    
    return {
      title: `${brand.name} - Модели автомобилей - АСО`,
      description: `Выберите модель ${brand.name} для подбора запчастей. ${brand.country ? `Производитель: ${brand.country}.` : ''}`,
    };
  } catch {
    return {
      title: 'Марка не найдена - АСО',
      description: 'Запрашиваемая марка автомобиля не найдена',
    };
  }
}

export default async function VehicleBrandPage({ params }: Props) {
  const { brandSlug } = await params;
  
  let brand;
  let models;
  
  try {
    brand = await vehicleBrandsApi.getBySlug(brandSlug);
    models = await vehicleModelsApi.getByBrand(brandSlug);
  } catch {
    notFound();
  }

  // Group models by class
  const modelsByClass = models.reduce((acc, model) => {
    if (!acc[model.class]) {
      acc[model.class] = [];
    }
    acc[model.class].push(model);
    return acc;
  }, {} as Record<string, typeof models>);

  const classOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'S', 'SUV', 'Crossover', 'Minivan', 'Pickup'];
  const sortedClasses = Object.keys(modelsByClass).sort((a, b) => {
    const indexA = classOrder.indexOf(a);
    const indexB = classOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <BreadcrumbsComponent 
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог автомобилей', href: '/vehicles' },
            { label: brand.name }
          ] as BreadcrumbItemType[]}
        />
      </div>

      {/* Brand header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {brand.logo && (
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-16 w-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{brand.name}</h1>
            {brand.country && (
              <p className="text-gray-600">Страна: {brand.country}</p>
            )}
          </div>
        </div>
        <p className="text-gray-600">
          Всего моделей: {models.length}
        </p>
      </div>

      {/* Models by class */}
      <div className="space-y-8">
        {sortedClasses.map((vehicleClass) => {
          const classModels = modelsByClass[vehicleClass];
          
          return (
            <section key={vehicleClass}>
              <h2 className="text-xl font-semibold mb-4">
                Класс {vehicleClass} ({classModels.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {classModels.map((model) => (
                  <Link
                    key={model.id}
                    href={`/vehicles/${brandSlug}/${model.slug}`}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                  >
                    {model.image && (
                      <img
                        src={model.image}
                        alt={model.name}
                        className="w-full h-32 object-cover rounded mb-3"
                      />
                    )}
                    <h3 className="font-medium">{model.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {model.yearFrom} - {model.yearTo || 'н.в.'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}