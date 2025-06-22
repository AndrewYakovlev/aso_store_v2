'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Search, Filter, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { promoCodesApi } from '@/lib/api/promo-codes';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/lib/contexts/AuthContext';

interface PromoCodeUsage {
  id: string;
  promoCode: {
    code: string;
    description?: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
  };
  user: {
    id: string;
    phone: string;
    firstName?: string;
    lastName?: string;
  } | null;
  order: {
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  orderAmount: number;
  discountAmount: number;
  usedAt: string;
}

export default function PromoCodeUsageHistoryPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [usageHistory, setUsageHistory] = useState<PromoCodeUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    promoCodeId: '',
    userId: '',
    orderId: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    loadUsageHistory();
  }, [currentPage, filters, accessToken]);

  const loadUsageHistory = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const data = await promoCodesApi.getAllUsageHistory(accessToken, {
        ...filters,
        page: currentPage,
        limit: 20,
      });
      setUsageHistory(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to load usage history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadUsageHistory();
  };

  const handleReset = () => {
    setFilters({
      promoCodeId: '',
      userId: '',
      orderId: '',
      dateFrom: '',
      dateTo: '',
    });
    setCurrentPage(1);
  };

  const getDiscountText = (usage: PromoCodeUsage) => {
    const { discountType, discountValue } = usage.promoCode;
    return discountType === 'PERCENTAGE' 
      ? `${discountValue}%` 
      : formatPrice(discountValue);
  };

  const getUserName = (user: PromoCodeUsage['user']) => {
    if (!user) return 'Гость';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || user.phone;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">История использования промокодов</h1>
          <p className="text-muted-foreground mt-1">
            Просмотр всех использований промокодов
          </p>
        </div>
        <Button
          onClick={() => router.push('/panel/promo-codes')}
          variant="outline"
        >
          К промокодам
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Фильтры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="orderId">Номер заказа</Label>
              <Input
                id="orderId"
                placeholder="Поиск по номеру заказа"
                value={filters.orderId}
                onChange={(e) => handleFilterChange('orderId', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateFrom">Дата от</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Дата до</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Поиск
            </Button>
            <Button onClick={handleReset} variant="outline">
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Всего использований
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{usageHistory.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общая сумма скидок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatPrice(
                usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0)
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средняя скидка
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {usageHistory.length > 0
                ? formatPrice(
                    usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0) /
                      usageHistory.length
                  )
                : formatPrice(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Промокод</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Заказ</TableHead>
                <TableHead>Сумма заказа</TableHead>
                <TableHead>Скидка</TableHead>
                <TableHead>Статус заказа</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Загрузка...
                  </TableCell>
                </TableRow>
              ) : usageHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    История использования не найдена
                  </TableCell>
                </TableRow>
              ) : (
                usageHistory.map((usage) => (
                  <TableRow key={usage.id}>
                    <TableCell>
                      {format(new Date(usage.usedAt), 'dd.MM.yyyy HH:mm', {
                        locale: ru,
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-mono font-medium">{usage.promoCode.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {getDiscountText(usage)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push(`/panel/users/${usage.user?.id}`)}
                      >
                        {getUserName(usage.user)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-mono"
                        onClick={() => router.push(`/panel/orders/${usage.order.orderNumber}`)}
                      >
                        {usage.order.orderNumber}
                      </Button>
                    </TableCell>
                    <TableCell>{formatPrice(usage.order.totalAmount)}</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      -{formatPrice(usage.discountAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{usage.order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}