import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AnonymousTokenProvider } from "@/components/AnonymousTokenProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnonymousTokenProvider>
      <AuthProvider>
        <AdminGuard>
          <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <AdminHeader />
              <main className="flex-1 overflow-x-auto overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-6 py-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </AdminGuard>
      </AuthProvider>
    </AnonymousTokenProvider>
  );
}