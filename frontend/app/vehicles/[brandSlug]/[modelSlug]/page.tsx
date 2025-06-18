import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { vehicleModelsApi } from '@/lib/api/vehicles';
import { productsApi } from '@/lib/api/products';
import { ModelContent } from './ModelContent';

interface Props {
  params: Promise<{ brandSlug: string; modelSlug: string }>;
  searchParams: Promise<{ page?: string; year?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modelSlug } = await params;
  
  try {
    const model = await vehicleModelsApi.getBySlug(modelSlug);
    
    return {
      title: `${model.brand?.name} ${model.nameCyrillic || model.name} - Запчасти - АСО`,
      description: `Запчасти для ${model.brand?.name} ${model.nameCyrillic || model.name} ${model.yearFrom}-${model.yearTo || 'н.в.'}. Большой выбор, низкие цены, быстрая доставка.`,
    };
  } catch {
    return {
      title: 'Модель не найдена - АСО',
      description: 'Запрашиваемая модель автомобиля не найдена',
    };
  }
}

export default async function VehicleModelPage({ params, searchParams }: Props) {
  const { brandSlug, modelSlug } = await params;
  const { page = '1', year } = await searchParams;
  
  let model;
  
  try {
    model = await vehicleModelsApi.getBySlug(modelSlug);
  } catch {
    notFound();
  }

  // Get products for this vehicle model
  const currentPage = parseInt(page, 10) || 1;
  const selectedYear = year ? parseInt(year, 10) : undefined;
  
  const products = await productsApi.getAll({
    vehicleModelId: model.id,
    vehicleYear: selectedYear,
    page: currentPage,
    limit: 20,
    onlyActive: true,
    inStock: true,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Главная
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href="/vehicles" className="text-gray-500 hover:text-gray-700">
              Каталог автомобилей
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link href={`/vehicles/${brandSlug}`} className="text-gray-500 hover:text-gray-700">
              {model.brand?.name}
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900">{model.nameCyrillic || model.name}</li>
        </ol>
      </nav>

      {/* Model header */}
      <div className="mb-8">
        <div className="flex items-start gap-6">
          {model.image && (
            <img
              src={model.image}
              alt={`${model.brand?.name} ${model.name}`}
              className="w-48 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {model.brand?.name} {model.nameCyrillic || model.name}
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>Годы выпуска: {model.yearFrom} - {model.yearTo || 'н.в.'}</p>
              <p>Класс: {model.class}</p>
            </div>
            
            {/* Year selector */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите год выпуска:
              </label>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/vehicles/${brandSlug}/${modelSlug}`}
                  className={`px-3 py-1 rounded border ${
                    !selectedYear ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-300'
                  }`}
                >
                  Все годы
                </Link>
                {(() => {
                  const startYear = model.yearFrom;
                  const endYear = model.yearTo || new Date().getFullYear();
                  const years = [];
                  for (let y = endYear; y >= startYear; y--) {
                    years.push(y);
                  }
                  return years.map(y => (
                    <Link
                      key={y}
                      href={`/vehicles/${brandSlug}/${modelSlug}?year=${y}`}
                      className={`px-3 py-1 rounded border ${
                        selectedYear === y ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-300'
                      }`}
                    >
                      {y}
                    </Link>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          Запчасти для {model.brand?.name} {model.nameCyrillic || model.name}
          {selectedYear && ` ${selectedYear} года`}
        </h2>
        

        <ModelContent
          modelId={model.id}
          brandSlug={brandSlug}
          modelSlug={modelSlug}
          initialProducts={products}
          selectedYear={selectedYear}
        />
      </section>
    </div>
  );
}