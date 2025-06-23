import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorePhonesList } from '@/components/admin/settings/StorePhonesList';
import { StoreAddressList } from '@/components/admin/settings/StoreAddressList';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Настройки магазина</h1>

      <Tabs defaultValue="phones" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="phones">Телефоны</TabsTrigger>
          <TabsTrigger value="addresses">Адреса</TabsTrigger>
        </TabsList>

        <TabsContent value="phones" className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Телефоны магазина</h2>
              <p className="text-gray-600 mb-6">
                Управляйте телефонными номерами магазина. Вы можете указать, какие номера
                доступны в WhatsApp и Telegram для быстрой связи с клиентами.
              </p>
              <StorePhonesList />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="mt-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Адреса магазина</h2>
              <p className="text-gray-600 mb-6">
                Управляйте адресами вашего магазина, складов и пунктов самовывоза.
              </p>
              <StoreAddressList />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}