import { Metadata } from 'next';
import Link from 'next/link';
import { vehicleBrandsApi } from '@/lib/api/vehicles';
import { getImageUrl } from '@/lib/utils/image';

// Force dynamic rendering to avoid API calls during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Каталог автомобилей - АСО',
  description: 'Выберите марку автомобиля для подбора запчастей',
};

export default async function VehicleBrandsPage() {
  // Get all popular brands (with high limit to get all)
  const popularBrandsUnsorted = await vehicleBrandsApi.getPopular(100);
  
  // Sort popular brands alphabetically by name
  const popularBrands = [...popularBrandsUnsorted].sort((a, b) => 
    a.name.localeCompare(b.name, 'ru')
  );
  
  // Get all brands grouped by country
  const allBrands = await vehicleBrandsApi.getAll({
    onlyActive: true,
    limit: 1000, // Get all brands
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Get available countries
  const countries = await vehicleBrandsApi.getCountries();

  // Group brands by country
  const brandsByCountry = allBrands.items.reduce((acc, brand) => {
    const country = brand.country || 'Другие';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(brand);
    return acc;
  }, {} as Record<string, typeof allBrands.items>);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Каталог автомобилей</h1>

      {/* Popular brands section */}
      {popularBrands.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Популярные марки</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {popularBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/vehicles/${brand.slug}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 text-center"
              >
                {brand.logo ? (
                  <img
                    src={getImageUrl(brand.logo)}
                    alt={brand.name}
                    className="h-12 w-auto mx-auto mb-3 object-contain group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="h-12 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-gray-400">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                )}
                <h3 className="font-medium text-sm">{brand.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {brand.modelsCount} {brand.modelsCount === 1 ? 'модель' : 'моделей'}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All brands by country */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Все марки по странам</h2>
        <div className="space-y-8">
          {countries.map((country) => {
            const brands = brandsByCountry[country];
            if (!brands || brands.length === 0) return null;

            return (
              <div key={country}>
                <h3 className="text-lg font-medium mb-3 text-gray-700">
                  {country} ({brands.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {brands.map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/vehicles/${brand.slug}`}
                      className="bg-gray-50 hover:bg-gray-100 rounded px-4 py-2 text-sm transition-colors"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}