'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { usersApi, UserDto } from '@/lib/api/users';
import { ordersApi, DeliveryMethod, PaymentMethod } from '@/lib/api/orders';
import { productsApi, Product } from '@/lib/api/products';
import { formatPhoneForDisplay, normalizePhone } from '@/lib/utils/phone';
import { formatPrice } from '@/lib/utils';
import { Loader2, SearchIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderItem {
  productId?: string;
  offerId?: string;
  product?: Product;
  offer?: ProductOffer;
  quantity: number;
  price: number;
}

interface ProductOffer {
  id?: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  images?: string[];
  deliveryDays?: number;
  isOriginal?: boolean;
  isAnalog?: boolean;
}

export function ManagerOrderForm() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Customer data
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [customer, setCustomer] = useState<UserDto | null>(null);
  
  // Order data
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryBuilding, setDeliveryBuilding] = useState('');
  const [deliveryApartment, setDeliveryApartment] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [comment, setComment] = useState('');
  
  // Order items
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [foundProducts, setFoundProducts] = useState<Product[]>([]);
  
  // Product offer state
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState<ProductOffer>({
    name: '',
    description: '',
    price: 0,
    deliveryDays: 1,
    isOriginal: true,
    isAnalog: false,
  });

  useEffect(() => {
    loadDeliveryAndPaymentMethods();
  }, []);

  const loadDeliveryAndPaymentMethods = async () => {
    try {
      const [delivery, payment] = await Promise.all([
        ordersApi.getDeliveryMethods(),
        ordersApi.getPaymentMethods(),
      ]);
      setDeliveryMethods(delivery);
      setPaymentMethods(payment);
      
      // Set defaults
      if (delivery.length > 0) setSelectedDeliveryMethod(delivery[0].id);
      if (payment.length > 0) setSelectedPaymentMethod(payment[0].id);
    } catch (error) {
      console.error('Failed to load methods:', error);
    }
  };

  const searchCustomer = async () => {
    if (!customerPhone) return;
    
    setSearchingCustomer(true);
    try {
      console.log('Searching for customer with phone:', customerPhone);
      console.log('Access token available:', !!accessToken);
      
      const result = await usersApi.findOrCreateByPhone(
        normalizePhone(customerPhone),
        undefined, // Не передаем имя при поиске
        accessToken!
      );
      
      setCustomer(result);
      
      // Если это новый пользователь, устанавливаем "Клиент" и позволяем менеджеру изменить
      if (result.isNewUser) {
        setCustomerName('Клиент');
      } else {
        // Для существующего пользователя показываем его реальное имя
        setCustomerName(result.firstName || result.phone);
      }
      
      setCustomerEmail(result.email || '');
      
      // Set delivery address from customer profile if available
      if (result.defaultShippingAddress) {
        setDeliveryAddress(result.defaultShippingAddress);
      }
    } catch (error: any) {
      console.error('Failed to find/create customer:', error);
      console.error('Error details:', error.message, error.status);
      alert('Ошибка при поиске клиента: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setSearchingCustomer(false);
    }
  };

  const searchProducts = async () => {
    if (!productSearch || productSearch.length < 2) return;
    
    setSearchingProducts(true);
    try {
      const result = await productsApi.getAll({
        search: productSearch,
        limit: 10,
        onlyActive: true,
      });
      setFoundProducts(result.items);
    } catch (error) {
      console.error('Failed to search products:', error);
    } finally {
      setSearchingProducts(false);
    }
  };

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Increase quantity if product already in order
      setOrderItems(orderItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new product
      setOrderItems([...orderItems, {
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
      }]);
    }
    
    // Clear search
    setProductSearch('');
    setFoundProducts([]);
  };

  const addProductOffer = () => {
    if (!offerData.name || offerData.price <= 0) {
      alert('Заполните обязательные поля товарного предложения');
      return;
    }

    // Add offer to order items
    setOrderItems([...orderItems, {
      offer: offerData,
      quantity: 1,
      price: offerData.price,
    }]);

    // Reset offer form
    setOfferData({
      name: '',
      description: '',
      price: 0,
      deliveryDays: 1,
      isOriginal: true,
      isAnalog: false,
    });
    setShowOfferForm(false);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
    } else {
      setOrderItems(orderItems.map((item, i) =>
        i === index ? { ...item, quantity } : item
      ));
    }
  };

  const updateItemPrice = (index: number, price: number) => {
    setOrderItems(orderItems.map((item, i) =>
      i === index ? { ...item, price } : item
    ));
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const deliveryMethod = deliveryMethods.find(m => m.id === selectedDeliveryMethod);
    const deliveryPrice = deliveryMethod?.price || 0;
    
    return itemsTotal + deliveryPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) {
      alert('Сначала найдите или создайте клиента');
      return;
    }
    
    if (orderItems.length === 0) {
      alert('Добавьте товары в заказ');
      return;
    }
    
    setSubmitting(true);
    try {
      const orderData = {
        customerPhone: normalizePhone(customerPhone),
        customerName,
        customerEmail: customerEmail || undefined,
        deliveryMethodId: selectedDeliveryMethod,
        paymentMethodId: selectedPaymentMethod,
        deliveryAddress: deliveryAddress || undefined,
        deliveryCity: deliveryCity || undefined,
        deliveryStreet: deliveryStreet || undefined,
        deliveryBuilding: deliveryBuilding || undefined,
        deliveryApartment: deliveryApartment || undefined,
        deliveryPostalCode: deliveryPostalCode || undefined,
        comment: comment || undefined,
        items: orderItems.map(item => {
          if (item.offer && !item.offer.id) {
            // Новое товарное предложение
            return {
              offerData: {
                name: item.offer.name,
                description: item.offer.description,
                oldPrice: item.offer.oldPrice,
                deliveryDays: item.offer.deliveryDays,
                isOriginal: item.offer.isOriginal,
                isAnalog: item.offer.isAnalog,
              },
              quantity: item.quantity,
              price: item.price,
            };
          } else {
            // Существующий товар или предложение
            return {
              productId: item.productId,
              offerId: item.offerId || item.offer?.id,
              quantity: item.quantity,
              price: item.price,
            };
          }
        }),
      };
      
      const order = await ordersApi.createManagerOrder(orderData, accessToken!);
      
      alert(`Заказ №${order.orderNumber} успешно создан`);
      router.push(`/panel/orders/${order.id}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Ошибка при создании заказа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      onKeyDown={(e) => {
        // Предотвращаем отправку формы при нажатии Enter во всех полях кроме textarea
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}
      className="space-y-6"
    >
      {/* Customer section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Данные клиента</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Телефон клиента</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchCustomer();
                  }
                }}
                placeholder="+7 (999) 123-45-67"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchCustomer}
                disabled={searchingCustomer || !customerPhone}
              >
                {searchingCustomer ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="name">Имя клиента</Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email клиента</Label>
            <Input
              id="email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          
          {customer && (
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <h3 className="font-medium mb-1">Информация о клиенте</h3>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">ФИО:</span> {customer.firstName} {customer.lastName} {customer.middleName}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Телефон:</span> {formatPhoneForDisplay(customer.phone)}
                  </p>
                  {customer.email && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {customer.email}
                    </p>
                  )}
                  {customer.companyName && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Компания:</span> {customer.companyName}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Дата регистрации:</span> {new Date(customer.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                  {customer.isNewUser && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Новый клиент
                    </p>
                  )}
                </div>
              </div>
              
              {customer.orderStats && (
                <div>
                  <h4 className="font-medium mb-1">Статистика заказов</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Количество заказов:</span> {customer.orderStats.count}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Общая сумма:</span> {formatPrice(customer.orderStats.totalAmount)}
                    </p>
                    {customer.orderStats.lastOrderDate && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Последний заказ:</span> {new Date(customer.orderStats.lastOrderDate).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Products section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Товары</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowOfferForm(!showOfferForm)}
          >
            {showOfferForm ? 'Отмена' : 'Создать товарное предложение'}
          </Button>
        </div>
        
        {/* Product offer form */}
        {showOfferForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-3">Новое товарное предложение</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="offerName">Название товара *</Label>
                <Input
                  id="offerName"
                  value={offerData.name}
                  onChange={(e) => setOfferData({ ...offerData, name: e.target.value })}
                  placeholder="Например: Фильтр масляный"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="offerPrice">Цена *</Label>
                <Input
                  id="offerPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerData.price}
                  onChange={(e) => setOfferData({ ...offerData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="offerOldPrice">Старая цена</Label>
                <Input
                  id="offerOldPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerData.oldPrice || ''}
                  onChange={(e) => setOfferData({ ...offerData, oldPrice: parseFloat(e.target.value) || undefined })}
                />
              </div>
              
              <div>
                <Label htmlFor="offerDelivery">Срок доставки (дней)</Label>
                <Input
                  id="offerDelivery"
                  type="number"
                  min="1"
                  value={offerData.deliveryDays}
                  onChange={(e) => setOfferData({ ...offerData, deliveryDays: parseInt(e.target.value) || 1 })}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="offerDescription">Описание</Label>
                <textarea
                  id="offerDescription"
                  value={offerData.description}
                  onChange={(e) => setOfferData({ ...offerData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Дополнительная информация о товаре"
                />
              </div>
              
              <div className="col-span-2">
                <Label>Тип товара</Label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="offerType"
                      checked={offerData.isOriginal}
                      onChange={() => setOfferData({ ...offerData, isOriginal: true, isAnalog: false })}
                      className="mr-2"
                    />
                    Оригинал
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="offerType"
                      checked={offerData.isAnalog}
                      onChange={() => setOfferData({ ...offerData, isOriginal: false, isAnalog: true })}
                      className="mr-2"
                    />
                    Аналог
                  </label>
                </div>
              </div>
              
              <div className="col-span-2">
                <Button
                  type="button"
                  onClick={addProductOffer}
                  disabled={!offerData.name || offerData.price <= 0}
                >
                  Добавить товарное предложение
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <Label htmlFor="productSearch">Поиск товара</Label>
          <div className="flex gap-2">
            <Input
              id="productSearch"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchProducts();
                }
              }}
              placeholder="Название или артикул"
            />
            <Button
              type="button"
              variant="outline"
              onClick={searchProducts}
              disabled={searchingProducts || !productSearch}
            >
              {searchingProducts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {foundProducts.length > 0 && (
          <div className="mb-4 space-y-2">
            {foundProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Артикул: {product.sku} | Цена: {formatPrice(product.price)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addProduct(product)}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Order items */}
        {orderItems.length > 0 ? (
          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name || item.offer?.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.product ? `Артикул: ${item.product.sku}` : 'Товарное предложение'}
                  </p>
                  {item.offer && item.offer.description && (
                    <p className="text-sm text-gray-500">{item.offer.description}</p>
                  )}
                  {item.offer && (
                    <p className="text-xs text-blue-600">
                      {item.offer.isOriginal ? 'Оригинал' : 'Аналог'} • Доставка: {item.offer.deliveryDays} дн.
                    </p>
                  )}
                </div>
                
                <div className="w-24">
                  <Label className="text-xs">Кол-во</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div className="w-32">
                  <Label className="text-xs">Цена</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
                
                <div className="text-right w-32">
                  <p className="text-sm text-gray-600">Сумма</p>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Товары не добавлены
          </p>
        )}
      </Card>

      {/* Delivery section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Доставка</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryMethod">Способ доставки</Label>
            <select
              id="deliveryMethod"
              value={selectedDeliveryMethod}
              onChange={(e) => setSelectedDeliveryMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              {deliveryMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name} ({formatPrice(method.price)})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Способ оплаты</Label>
            <select
              id="paymentMethod"
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            >
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="address">Полный адрес</Label>
            <Input
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Введите полный адрес или заполните поля ниже"
            />
          </div>
          
          <div>
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              value={deliveryCity}
              onChange={(e) => setDeliveryCity(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="street">Улица</Label>
            <Input
              id="street"
              value={deliveryStreet}
              onChange={(e) => setDeliveryStreet(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="building">Дом</Label>
            <Input
              id="building"
              value={deliveryBuilding}
              onChange={(e) => setDeliveryBuilding(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="apartment">Квартира/Офис</Label>
            <Input
              id="apartment"
              value={deliveryApartment}
              onChange={(e) => setDeliveryApartment(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="postalCode">Индекс</Label>
            <Input
              id="postalCode"
              value={deliveryPostalCode}
              onChange={(e) => setDeliveryPostalCode(e.target.value)}
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="comment">Комментарий к заказу</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Итого</h2>
          <p className="text-2xl font-bold">{formatPrice(calculateTotal())}</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting || orderItems.length === 0 || !customer}
            className="flex-1"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Создание заказа...
              </>
            ) : (
              'Создать заказ'
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/panel/orders')}
          >
            Отмена
          </Button>
        </div>
      </Card>
    </form>
  );
}