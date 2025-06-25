'use client';

import { AdminGuard } from '@/components/admin/AdminGuard';
import { ProductSheet } from '@/components/admin/products/ProductSheet';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function NewProductPage() {
  const router = useRouter();

  const handleSave = () => {
    toast({
      title: 'Успешно',
      description: 'Товар успешно создан',
    });
    router.push('/panel/products');
  };

  const handleCancel = () => {
    router.push('/panel/products');
  };

  return (
    <AdminGuard>
      <div className="container mx-auto max-w-7xl">
        <Sheet open={true}>
          <SheetContent className="sm:max-w-[900px] overflow-hidden p-0">
            <ProductSheet 
              product={null} 
              onSave={handleSave} 
              onCancel={handleCancel} 
            />
          </SheetContent>
        </Sheet>
      </div>
    </AdminGuard>
  );
}