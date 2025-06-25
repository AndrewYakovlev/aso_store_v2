'use client';

import { useState } from 'react';
import { AdminUsersList } from "@/components/admin/users/AdminUsersList";
import { AdminAnonymousUsersList } from "@/components/admin/users/AdminAnonymousUsersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('registered');

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Управление пользователями</h1>
          <p className="text-sm text-gray-600 mt-1">
            Управление зарегистрированными и анонимными пользователями
          </p>
        </div>
        
        <Tabs defaultValue="registered" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="registered" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Зарегистрированные
              </TabsTrigger>
              <TabsTrigger value="anonymous" className="flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" />
                Анонимные
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="registered" className="mt-0">
            <AdminUsersList />
          </TabsContent>
          
          <TabsContent value="anonymous" className="mt-0">
            <AdminAnonymousUsersList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}