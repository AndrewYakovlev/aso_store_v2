'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getStoreAddresses,
  deleteStoreAddress,
  type StoreAddress,
} from '@/lib/api/settings';
import { StoreAddressDialog } from './StoreAddressDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const addressTypeLabels = {
  main: 'Главный офис',
  warehouse: 'Склад',
  pickup_point: 'Пункт самовывоза',
};

export function StoreAddressList() {
  const { accessToken } = useAuth();
  const [addresses, setAddresses] = useState<StoreAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<StoreAddress | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<StoreAddress | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await getStoreAddresses();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to load addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: StoreAddress) => {
    setEditingAddress(address);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!addressToDelete || !accessToken) return;

    try {
      await deleteStoreAddress(addressToDelete.id, accessToken!);
      await loadAddresses();
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingAddress(null);
    loadAddresses();
  };

  const formatFullAddress = (address: StoreAddress) => {
    const parts = [
      address.city,
      address.street,
      `д. ${address.building}`,
      address.office && `офис ${address.office}`,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Всего адресов: {addresses.length}
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Добавить адрес
        </Button>
      </div>

      <div className="space-y-3">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="border rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">
                    {address.name || addressTypeLabels[address.type as keyof typeof addressTypeLabels]}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {addressTypeLabels[address.type as keyof typeof addressTypeLabels]}
                  </Badge>
                  {!address.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Неактивен
                    </Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 ml-7">
                  {formatFullAddress(address)}
                  {address.postalCode && `, ${address.postalCode}`}
                </div>

                {address.workingHours && (
                  <div className="flex items-center mt-2 ml-7 text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {address.workingHours}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {accessToken && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAddressToDelete(address);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет добавленных адресов
          </div>
        )}
      </div>

      <StoreAddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        address={editingAddress}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить адрес?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить адрес{' '}
              {addressToDelete && (addressToDelete.name || formatFullAddress(addressToDelete))}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}