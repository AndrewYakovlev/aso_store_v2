'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getStorePhones,
  deleteStorePhone,
  type StorePhone,
} from '@/lib/api/settings';
import { StorePhoneDialog } from './StorePhoneDialog';
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
import { formatPhoneForDisplay } from '@/lib/utils/phone';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

export function StorePhonesList() {
  const { accessToken } = useAuth();
  const [phones, setPhones] = useState<StorePhone[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<StorePhone | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<StorePhone | null>(null);

  useEffect(() => {
    loadPhones();
  }, []);

  const loadPhones = async () => {
    try {
      const data = await getStorePhones();
      setPhones(data);
    } catch (error) {
      console.error('Failed to load phones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (phone: StorePhone) => {
    setEditingPhone(phone);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPhone(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!phoneToDelete || !accessToken) return;

    try {
      await deleteStorePhone(phoneToDelete.id, accessToken!);
      await loadPhones();
      setDeleteDialogOpen(false);
      setPhoneToDelete(null);
    } catch (error) {
      console.error('Failed to delete phone:', error);
    }
  };

  const handleSuccess = () => {
    setDialogOpen(false);
    setEditingPhone(null);
    loadPhones();
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          Всего номеров: {phones.length}
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Добавить номер
        </Button>
      </div>

      <div className="space-y-3">
        {phones.map((phone) => (
          <div
            key={phone.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {formatPhoneForDisplay(phone.phone)}
                  </span>
                  {phone.isMain && (
                    <Badge variant="secondary" className="text-xs">
                      Основной
                    </Badge>
                  )}
                  {!phone.isActive && (
                    <Badge variant="destructive" className="text-xs">
                      Неактивен
                    </Badge>
                  )}
                </div>
                {phone.name && (
                  <div className="text-sm text-gray-600 mt-1">{phone.name}</div>
                )}
                <div className="flex items-center space-x-3 mt-2">
                  {phone.isWhatsApp && (
                    <div className="flex items-center text-green-600 text-sm">
                      <FaWhatsapp className="w-4 h-4 mr-1" />
                      WhatsApp
                    </div>
                  )}
                  {phone.isTelegram && (
                    <div className="flex items-center text-blue-600 text-sm">
                      <FaTelegram className="w-4 h-4 mr-1" />
                      Telegram
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(phone)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              {accessToken && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhoneToDelete(phone);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        {phones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Нет добавленных телефонов
          </div>
        )}
      </div>

      <StorePhoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        phone={editingPhone}
        onSuccess={handleSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить телефон?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить номер{' '}
              {phoneToDelete && formatPhoneForDisplay(phoneToDelete.phone)}?
              {phoneToDelete?.name && ` (${phoneToDelete.name})`}
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