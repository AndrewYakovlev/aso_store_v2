import { Header } from "@/components/Header";
import { AnonymousTokenProvider } from "@/components/AnonymousTokenProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { FavoritesProvider } from "@/lib/contexts/FavoritesContext";
import { CartProvider } from "@/lib/contexts/CartContext";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnonymousTokenProvider>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <ChatWidget />
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </AnonymousTokenProvider>
  );
}
