'use client';

import { useState, useEffect } from 'react';
import { brandsApi, BrandWithProductsCount, BrandsFilter } from '@/lib/api/brands';
import { BrandDto } from '@/lib/api/brands/types';
import { useAuth } from '@/lib/contexts/AuthContext';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { BrandSheet } from './BrandSheet';
import { DataTable } from '../DataTable';
import { createBrandsColumns } from './columns';

export function AdminBrandsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const [brands, setBrands] = useState<BrandWithProductsCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandDto | null>(null);

  const limit = 20;

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    setSearch(searchQuery);
    setCurrentPage(page);
    loadBrands(searchQuery, page);
  }, [searchParams]);

  const loadBrands = async (searchQuery: string, page: number) => {
    setLoading(true);
    try {
      const filter: BrandsFilter = {
        search: searchQuery || undefined,
        page,
        limit,
        onlyActive: false,
        sortBy: 'name',
        sortOrder: 'asc',
      };
      
      const response = await brandsApi.getAll(filter);
      setBrands(response.items);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    router.push(`/panel/brands?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/panel/brands?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот бренд?')) {
      return;
    }

    setDeleting(id);
    try {
      await brandsApi.delete(id, accessToken!);
      await loadBrands(search, currentPage);
    } catch (error: any) {
      console.error('Failed to delete brand:', error);
      alert(error.response?.data?.message || 'Ошибка при удалении бренда');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (brand: BrandDto) => {
    setEditingBrand(brand);
    setSheetOpen(true);
  };

  const handleCreate = () => {
    setEditingBrand(null);
    setSheetOpen(true);
  };

  const handleSheetClose = () => {
    setSheetOpen(false);
    setEditingBrand(null);
  };

  const handleSheetSave = async () => {
    await loadBrands(search, currentPage);
    handleSheetClose();
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Бренды товаров</h2>
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Добавить бренд
            </button>
          </div>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Найти
            </button>
          </form>
        </div>

        <DataTable
          columns={createBrandsColumns({
            onEdit: handleEdit,
            onDelete: handleDelete,
            deleting,
          })}
          data={brands}
        />

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Показано {(currentPage - 1) * limit + 1} - {Math.min(currentPage * limit, total)} из {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded ${
                      page === currentPage 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[500px]">
          <BrandSheet
            brand={editingBrand}
            onSave={handleSheetSave}
            onCancel={handleSheetClose}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}