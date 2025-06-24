'use client';

import * as React from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { brandsApi, BrandWithProductsCount, CreateBrandDto } from '@/lib/api/brands';
import { generateSlug } from '@/lib/utils/slug';
import { useAuth } from '@/lib/contexts/AuthContext';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  brands: BrandWithProductsCount[];
  onBrandsUpdate: () => void;
}

export function BrandCombobox({ value, onChange, brands, onBrandsUpdate }: BrandComboboxProps) {
  const { accessToken } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [newBrandData, setNewBrandData] = React.useState({
    name: '',
    slug: '',
    description: '',
    country: '',
  });

  const selectedBrand = brands.find(brand => brand.id === value);

  const handleNewBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);

    try {
      const data: CreateBrandDto = {
        name: newBrandData.name,
        slug: newBrandData.slug,
        description: newBrandData.description || undefined,
        country: newBrandData.country || undefined,
        isActive: true,
        sortOrder: 0,
      };

      const newBrand = await brandsApi.create(data, accessToken!);
      
      // Обновляем список брендов
      await onBrandsUpdate();
      
      // Выбираем созданный бренд
      onChange(newBrand.id);
      
      // Закрываем диалог и сбрасываем форму
      setDialogOpen(false);
      setNewBrandData({
        name: '',
        slug: '',
        description: '',
        country: '',
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Failed to create brand:', error);
      setError(error.response?.data?.message || 'Ошибка при создании бренда');
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setNewBrandData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const filteredBrands = React.useMemo(() => {
    if (!searchValue) return brands;
    
    const search = searchValue.toLowerCase();
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(search)
    );
  }, [brands, searchValue]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 py-2 h-[42px] font-normal border-gray-300 hover:bg-gray-50 text-left"
          >
            <span className={selectedBrand ? "" : "text-gray-500"}>
              {selectedBrand ? selectedBrand.name : "Выберите бренд"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Поиск бренда..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">Бренд не найден</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(true);
                      setNewBrandData(prev => ({
                        ...prev,
                        name: searchValue,
                        slug: generateSlug(searchValue),
                      }));
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    Создать бренд "{searchValue}"
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value=""
                  onSelect={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === "" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-muted-foreground">Без бренда</span>
                </CommandItem>
                {filteredBrands.map((brand) => (
                  <CommandItem
                    key={brand.id}
                    value={brand.id}
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === brand.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{brand.name}</span>
                      {brand.country && (
                        <span className="text-xs text-muted-foreground">{brand.country}</span>
                      )}
                    </div>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {brand._count?.products || 0} товаров
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {filteredBrands.length > 0 && (
                <div className="p-1 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(true);
                      setNewBrandData({
                        name: '',
                        slug: '',
                        description: '',
                        country: '',
                      });
                    }}
                    className="w-full justify-start gap-2 text-sm"
                  >
                    <Plus className="h-3 w-3" />
                    Добавить новый бренд
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Создание нового бренда</DialogTitle>
            <DialogDescription>
              Добавьте новый бренд для использования в товарах
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleNewBrandSubmit} onClick={(e) => e.stopPropagation()}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Название бренда <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={newBrandData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Bosch"
                  required
                  autoFocus
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="slug" className="text-sm font-medium">
                  URL-адрес (slug) <span className="text-red-500">*</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={newBrandData.slug}
                  onChange={(e) => setNewBrandData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="bosch"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Страна происхождения
                </label>
                <input
                  id="country"
                  type="text"
                  value={newBrandData.country}
                  onChange={(e) => setNewBrandData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Германия"
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Описание
                </label>
                <textarea
                  id="description"
                  value={newBrandData.description}
                  onChange={(e) => setNewBrandData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Краткое описание бренда"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDialogOpen(false);
                }}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                onClick={(e) => e.stopPropagation()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  'Создать бренд'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}