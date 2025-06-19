import { categoriesApi } from '@/lib/api/categories';
import { CategoriesGrid } from '@/components/categories/CategoriesGrid';
import { VehicleSelector } from '@/components/VehicleSelector';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TruckIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

// Force dynamic rendering to avoid API calls during build
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch root categories
  const categories = await categoriesApi.getTree(true);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Автозапчасти для всех марок автомобилей
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Широкий выбор оригинальных и аналоговых запчастей. 
              Быстрая доставка по всей России.
            </p>
            <Link href="/catalog">
              <Button size="lg" variant="secondary">
                Перейти в каталог
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Vehicle Selector */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <VehicleSelector />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <TruckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-muted-foreground">
                Доставка по Москве от 1 дня, по России от 2 дней
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <ShieldCheckIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Гарантия качества</h3>
              <p className="text-muted-foreground">
                Только оригинальные запчасти и проверенные аналоги
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <CreditCardIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Удобная оплата</h3>
              <p className="text-muted-foreground">
                Наличный и безналичный расчет, оплата картой на сайте
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoriesGrid categories={categories} />

      {/* Call to Action */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Не нашли нужную запчасть?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Наши эксперты помогут подобрать необходимые детали для вашего автомобиля
          </p>
          <Link href="/contacts">
            <Button size="lg">
              Связаться с нами
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}