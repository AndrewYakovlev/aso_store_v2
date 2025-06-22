import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminNotificationListener } from '@/components/admin/AdminNotificationListener';
import { AnonymousTokenProvider } from "@/components/AnonymousTokenProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ActiveChatProvider } from "@/lib/contexts/ActiveChatContext";
import { Toaster } from 'sonner';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnonymousTokenProvider>
      <AuthProvider>
        <AdminGuard>
          <ActiveChatProvider>
            <AdminNotificationListener />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: '#1F2937',
                  color: '#fff',
                  border: '1px solid #374151',
                },
                actionButtonStyle: {
                  backgroundColor: '#3B82F6',
                  color: '#fff',
                },
              }}
            />
            <div className="flex h-screen bg-gray-100">
              <AdminSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-auto bg-gray-100">
                  {children}
                </main>
              </div>
            </div>
          </ActiveChatProvider>
        </AdminGuard>
      </AuthProvider>
    </AnonymousTokenProvider>
  );
}