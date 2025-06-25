'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi, User } from '@/lib/api/users';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { UserProfileTab } from '@/components/admin/users/tabs/UserProfileTab';
import { UserCartTab } from '@/components/admin/users/tabs/UserCartTab';
import { UserFavoritesTab } from '@/components/admin/users/tabs/UserFavoritesTab';
import { UserChatsTab } from '@/components/admin/users/tabs/UserChatsTab';
import { UserOrdersTab } from '@/components/admin/users/tabs/UserOrdersTab';
import { UserAnonymousTab } from '@/components/admin/users/tabs/UserAnonymousTab';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadUser();
  }, [resolvedParams.id]);

  const loadUser = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      const userData = await usersApi.getById(accessToken, resolvedParams.id);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      router.push('/panel/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    await loadUser();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/panel/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b px-6">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Профиль
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Заказы
              </TabsTrigger>
              <TabsTrigger 
                value="cart" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Корзина
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Избранное
              </TabsTrigger>
              <TabsTrigger 
                value="chats" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Чаты
              </TabsTrigger>
              <TabsTrigger 
                value="anonymous" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-4 py-3"
              >
                Анонимные сессии
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="p-0">
            <UserProfileTab user={user} onUpdate={handleUserUpdate} />
          </TabsContent>

          <TabsContent value="orders" className="p-0">
            <UserOrdersTab userId={user.id} />
          </TabsContent>

          <TabsContent value="cart" className="p-0">
            <UserCartTab userId={user.id} />
          </TabsContent>

          <TabsContent value="favorites" className="p-0">
            <UserFavoritesTab userId={user.id} />
          </TabsContent>

          <TabsContent value="chats" className="p-0">
            <UserChatsTab userId={user.id} />
          </TabsContent>

          <TabsContent value="anonymous" className="p-0">
            <UserAnonymousTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}