import { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchContent } from './SearchContent';

export const metadata: Metadata = {
  title: 'Поиск товаров - АСО',
  description: 'Поиск автозапчастей по названию, артикулу или характеристикам',
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Поиск товаров</h1>
      
      <Suspense fallback={<div>Загрузка...</div>}>
        <SearchContent searchParams={params} />
      </Suspense>
    </div>
  );
}