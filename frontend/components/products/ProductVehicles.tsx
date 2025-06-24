import { ProductVehicle } from '@/lib/api/products';
import Link from 'next/link';
import { TruckIcon } from '@heroicons/react/24/outline';

interface ProductVehiclesProps {
  vehicles: ProductVehicle[];
}

export function ProductVehicles({ vehicles }: ProductVehiclesProps) {
  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  // Group vehicles by brand
  const vehiclesByBrand = vehicles.reduce((acc, vehicle) => {
    if (!vehicle.vehicleModel?.brand) return acc;
    
    const brandName = vehicle.vehicleModel.brand.name;
    if (!acc[brandName]) {
      acc[brandName] = [];
    }
    acc[brandName].push(vehicle);
    return acc;
  }, {} as Record<string, ProductVehicle[]>);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TruckIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold">Подходит для автомобилей</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(vehiclesByBrand).map(([brandName, brandVehicles]) => (
          <div key={brandName}>
            <h4 className="font-medium text-gray-900 mb-2">{brandName}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {brandVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded p-3 text-sm">
                  <Link
                    href={`/vehicles/${vehicle.vehicleModel?.brand?.slug}/${vehicle.vehicleModel?.slug}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {vehicle.vehicleModel?.name}
                  </Link>
                  <div className="text-gray-600 mt-1">
                    {vehicle.yearFrom || vehicle.yearTo ? (
                      <span>
                        {vehicle.yearFrom || vehicle.vehicleModel?.yearFrom} - {' '}
                        {vehicle.yearTo || vehicle.vehicleModel?.yearTo || 'н.в.'}
                      </span>
                    ) : vehicle.vehicleModel?.yearFrom ? (
                      <span>
                        {vehicle.vehicleModel.yearFrom} - {vehicle.vehicleModel.yearTo || 'н.в.'}
                      </span>
                    ) : null}
                    {vehicle.fitmentNotes && (
                      <div className="text-xs text-gray-500 mt-1">
                        {vehicle.fitmentNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}