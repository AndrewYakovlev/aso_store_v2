import { Metadata } from 'next';
import { TruckIcon, CreditCardIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useStoreContacts } from '@/lib/contexts/StoreContactsContext';

export const metadata: Metadata = {
  title: 'Доставка и оплата | АСО',
  description: 'Информация о способах доставки и оплаты в интернет-магазине АСО',
};

export default function DeliveryAndPaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Доставка и оплата</h1>
      
      {/* Доставка */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <TruckIcon className="h-8 w-8 text-aso-blue" />
          Способы доставки
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Самовывоз</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Бесплатно
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Готовность заказа от 30 минут
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Оплата при получении
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Доставка курьером</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                По городу - от 300 ₽
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Доставка в день заказа
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Бесплатно при заказе от 5000 ₽
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Доставка транспортной компанией</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                СДЭК, DPD, Boxberry
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Срок доставки от 2 дней
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Стоимость рассчитывается индивидуально
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Почта России</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Доставка по всей России
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Срок доставки от 7 дней
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Отслеживание посылки
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Оплата */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
          <CreditCardIcon className="h-8 w-8 text-aso-blue" />
          Способы оплаты
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Наличными</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                При самовывозе
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Курьеру при доставке
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Выдача чека
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Банковской картой</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Онлайн на сайте
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                При получении (терминал)
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Visa, MasterCard, МИР
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Безналичный расчет</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Для юридических лиц
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Счет на оплату
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                Полный пакет документов
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">Электронные платежи</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                ЮMoney (Яндекс.Деньги)
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                QIWI Кошелек
              </li>
              <li className="flex items-start">
                <span className="text-aso-blue mr-2">•</span>
                СБП (Система быстрых платежей)
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Дополнительная информация */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Важная информация</h2>
        <div className="space-y-3 text-gray-600">
          <p>
            <strong>Время работы:</strong> Обработка заказов производится ежедневно с 9:00 до 21:00. 
            Заказы, оформленные после 21:00, обрабатываются на следующий день.
          </p>
          <p>
            <strong>Резервирование товара:</strong> После оформления заказа товар резервируется на 24 часа. 
            По истечении этого времени резерв может быть снят.
          </p>
          <p>
            <strong>Проверка товара:</strong> При получении заказа обязательно проверьте комплектность 
            и внешний вид товара в присутствии курьера или сотрудника пункта выдачи.
          </p>
        </div>
      </section>
    </div>
  );
}