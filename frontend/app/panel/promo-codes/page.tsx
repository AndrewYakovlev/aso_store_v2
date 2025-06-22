'use client';

import { useState, useEffect } from 'react';
import { Plus, History, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/admin/DataTable';
import { PromoCodeForm } from '@/components/admin/promo-codes/PromoCodeForm';
import { PromoCodeTriggers } from '@/components/admin/promo-codes/PromoCodeTriggers';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { promoCodesApi, PromoCode } from '@/lib/api/promo-codes';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { createPromoCodesColumns } from '@/components/admin/promo-codes/columns';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function PromoCodesPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPromoCodes();
  }, [currentPage, accessToken]);

  async function loadPromoCodes() {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const response = await promoCodesApi.getPromoCodes(accessToken, {
        page: currentPage,
        limit: 20,
      });
      setPromoCodes(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить промокоды',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(data: any) {
    if (!accessToken) return;
    
    try {
      if (editingPromoCode) {
        await promoCodesApi.updatePromoCode(accessToken, editingPromoCode.id, data);
        toast({
          title: 'Успешно',
          description: 'Промокод обновлен',
        });
      } else {
        await promoCodesApi.createPromoCode(accessToken, data);
        toast({
          title: 'Успешно',
          description: 'Промокод создан',
        });
      }
      setIsCreateOpen(false);
      setEditingPromoCode(null);
      loadPromoCodes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить промокод',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    
    if (!confirm('Вы уверены, что хотите удалить этот промокод?')) {
      return;
    }

    setDeleting(id);
    try {
      await promoCodesApi.deletePromoCode(accessToken, id);
      toast({
        title: 'Успешно',
        description: 'Промокод удален',
      });
      loadPromoCodes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить промокод',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  }

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setIsCreateOpen(true);
  };

  const columns = createPromoCodesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    deleting,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Промокоды</h1>
        <p className="text-muted-foreground">
          Управление промокодами и триггерами
        </p>
      </div>

      <Tabs defaultValue="promo-codes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promo-codes">Промокоды</TabsTrigger>
          <TabsTrigger value="triggers">Триггеры</TabsTrigger>
        </TabsList>

        <TabsContent value="promo-codes" className="space-y-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push('/panel/promo-codes/usage')}
            >
              <History className="h-4 w-4 mr-2" />
              История использования
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать промокод
            </Button>
          </div>

          {loading && (!promoCodes || promoCodes.length === 0) ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <DataTable
                data={promoCodes}
                columns={columns}
              />
              {promoCodes && promoCodes.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-500">
                  Промокоды не найдены
                </div>
              )}
              {totalPages > 1 && (
                <div className="p-4 border-t">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="triggers">
          <PromoCodeTriggers />
        </TabsContent>
      </Tabs>

      <Sheet
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingPromoCode(null);
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {editingPromoCode ? 'Редактировать промокод' : 'Создать промокод'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PromoCodeForm
              promoCode={editingPromoCode}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setIsCreateOpen(false);
                setEditingPromoCode(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}