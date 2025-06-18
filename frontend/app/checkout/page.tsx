'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ContactForm } from '@/components/checkout/ContactForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AuthStep } from '@/components/checkout/AuthStep';
import { useCart } from '@/lib/hooks/useCart';
import { ordersApi } from '@/lib/api/orders';
import { useAuth } from '@/contexts/AuthContext';
import { DeliveryMethod, PaymentMethod } from '@/lib/api/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customerName: user?.firstName || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    deliveryMethodId: '',
    paymentMethodId: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryStreet: '',
    deliveryBuilding: '',
    deliveryApartment: '',
    deliveryPostalCode: '',
    comment: '',
  });

  // Load delivery and payment methods
  useEffect(() => {
    async function loadMethods() {
      try {
        const [delivery, payment] = await Promise.all([
          ordersApi.getDeliveryMethods(),
          ordersApi.getPaymentMethods(),
        ]);
        setDeliveryMethods(delivery);
        setPaymentMethods(payment);
        
        // Set default selections
        if (delivery.length > 0) {
          setFormData(prev => ({ ...prev, deliveryMethodId: delivery[0].id }));
        }
        if (payment.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethodId: payment[0].id }));
        }
      } catch (error) {
        console.error('Failed to load methods:', error);
      }
    }
    loadMethods();
  }, []);

  // Update user data when loaded
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setFormData(prev => ({
        ...prev,
        customerName: user.firstName || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
        customerEmail: user.email || prev.customerEmail,
      }));
    }
  }, [user]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAuthSuccess = (data: any) => {
    login(data.accessToken, data.refreshToken, data.user);
    setIsAuthenticated(true);
    // Update form data with user info
    setFormData(prev => ({
      ...prev,
      customerName: data.user.firstName || prev.customerName,
      customerPhone: data.user.phone || prev.customerPhone,
      customerEmail: data.user.email || prev.customerEmail,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Укажите ваше имя';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Укажите телефон для связи';
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Некорректный email';
    }

    const selectedDelivery = deliveryMethods.find(m => m.id === formData.deliveryMethodId);
    if (selectedDelivery?.code !== 'pickup') {
      if (!formData.deliveryAddress.trim() && !formData.deliveryCity.trim()) {
        newErrors.deliveryAddress = 'Укажите адрес доставки';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const order = await ordersApi.create({
        deliveryMethodId: formData.deliveryMethodId,
        paymentMethodId: formData.paymentMethodId,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        deliveryCity: formData.deliveryCity || undefined,
        deliveryStreet: formData.deliveryStreet || undefined,
        deliveryBuilding: formData.deliveryBuilding || undefined,
        deliveryApartment: formData.deliveryApartment || undefined,
        deliveryPostalCode: formData.deliveryPostalCode || undefined,
        comment: formData.comment || undefined,
      });

      // Redirect to success page
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading || !cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Корзина пуста</h1>
          <p className="text-gray-600 mb-8">Добавьте товары в корзину для оформления заказа</p>
          <Button onClick={() => router.push('/catalog')}>
            Перейти в каталог
          </Button>
        </div>
      </div>
    );
  }

  const selectedDeliveryMethod = deliveryMethods.find(m => m.id === formData.deliveryMethodId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Оформление заказа</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {!isAuthenticated ? (
            <AuthStep
              phone={formData.customerPhone}
              onPhoneChange={(phone) => handleFieldChange('customerPhone', phone)}
              onAuthSuccess={handleAuthSuccess}
            />
          ) : (
            <>
              <ContactForm
                data={{
                  customerName: formData.customerName,
                  customerPhone: formData.customerPhone,
                  customerEmail: formData.customerEmail,
                }}
                onChange={handleFieldChange}
                errors={errors}
              />

              <DeliveryForm
            methods={deliveryMethods}
            selectedMethodId={formData.deliveryMethodId}
            onMethodChange={(id) => handleFieldChange('deliveryMethodId', id)}
            addressData={{
              deliveryAddress: formData.deliveryAddress,
              deliveryCity: formData.deliveryCity,
              deliveryStreet: formData.deliveryStreet,
              deliveryBuilding: formData.deliveryBuilding,
              deliveryApartment: formData.deliveryApartment,
              deliveryPostalCode: formData.deliveryPostalCode,
            }}
            onAddressChange={handleFieldChange}
            errors={errors}
          />

          <PaymentForm
            methods={paymentMethods}
            selectedMethodId={formData.paymentMethodId}
            onMethodChange={(id) => handleFieldChange('paymentMethodId', id)}
          />

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Комментарий к заказу</h2>
                <div>
                  <Label htmlFor="comment">Дополнительная информация</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) => handleFieldChange('comment', e.target.value)}
                    placeholder="Ваши пожелания к заказу"
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <OrderSummary
              items={cart.items}
              deliveryMethod={selectedDeliveryMethod}
              totalPrice={cart.totalPrice}
            />

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || cart.items.length === 0 || !isAuthenticated}
            >
              {loading ? 'Оформление...' : !isAuthenticated ? 'Сначала подтвердите телефон' : 'Оформить заказ'}
            </Button>

            <p className="text-sm text-gray-600 text-center mt-4">
              Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}