'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ContactForm } from '@/components/checkout/ContactForm';
import { DeliveryForm } from '@/components/checkout/DeliveryForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AuthStep } from '@/components/checkout/AuthStep';
import { useCartContext } from '@/lib/contexts/CartContext';
import { ordersApi } from '@/lib/api/orders';
import { ordersClientApi } from '@/lib/api/orders-client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { DeliveryMethod, PaymentMethod } from '@/lib/api/orders';
import { cartApiWithAuth } from '@/lib/api/cart-client-auth';
import { CartSummary } from '@/lib/api/cart';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, loading: cartLoading, refetch: refreshCart, clearCart } = useCartContext();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryMethods, setDeliveryMethods] = useState<DeliveryMethod[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [promoCode, setPromoCode] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    customerName: user?.firstName || '',
    customerPhone: user?.phone || '',
    customerEmail: '',
    deliveryMethodId: '',
    paymentMethodId: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryStreet: '',
    deliveryBuilding: '',
    deliveryApartment: '',
    deliveryPostalCode: '',
    comment: '',
    promoCode: '',
  });

  // Load promo code from URL
  useEffect(() => {
    const promo = searchParams.get('promo');
    if (promo) {
      setPromoCode(promo);
      setFormData(prev => ({ ...prev, promoCode: promo }));
    }
  }, [searchParams]);

  // Load cart summary with promo code
  useEffect(() => {
    async function loadCartSummary() {
      if (promoCode) {
        try {
          const summary = await cartApiWithAuth.getCartSummary(promoCode);
          setCartSummary(summary);
        } catch (error) {
          console.error('Failed to load cart summary:', error);
        }
      }
    }
    loadCartSummary();
  }, [promoCode]);

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

  const handleAuthSuccess = async (data: any) => {
    console.log('Auth success, saving tokens...');
    login(data.accessToken, data.refreshToken, data.user);
    setIsAuthenticated(true);
    
    // Update form data with user info
    setFormData(prev => ({
      ...prev,
      customerName: data.user.firstName || prev.customerName,
      customerPhone: data.user.phone || prev.customerPhone,
      customerEmail: data.user.email || prev.customerEmail,
    }));
    
    // Small delay to ensure tokens are saved
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Refreshing cart after auth...');
    // Refresh cart to get merged data
    await refreshCart();
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

    const authToken = localStorage.getItem('access_token');
    console.log('Before order create - auth token:', authToken ? 'present' : 'missing');

    setLoading(true);
    try {
      const order = await ordersClientApi.create({
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
        promoCode: formData.promoCode || undefined,
      });

      // Clear cart after successful order
      await clearCart();

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
              promoCode={cartSummary?.promoCode}
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}