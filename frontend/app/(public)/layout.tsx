import { HeaderWrapper } from "@/components/layout/header/HeaderWrapper";
import { Footer } from "@/components/layout/footer/Footer";
import { MainWrapper } from "@/components/layout/MainWrapper";
import { AnonymousTokenProvider } from "@/components/AnonymousTokenProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { FavoritesProvider } from "@/lib/contexts/FavoritesContext";
import { CartProvider } from "@/lib/contexts/CartContext";
import { StoreContactsProvider } from "@/lib/contexts/StoreContactsContext";
import { ChatFloatingButton } from "@/components/chat/ChatFloatingButton";

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
            <StoreContactsProvider>
              <HeaderWrapper />
              <MainWrapper>
                {children}
              </MainWrapper>
              <Footer />
              {/* Chat floating button - visible on tablets and desktop */}
              <div className="hidden md:block">
                <ChatFloatingButton />
              </div>
            </StoreContactsProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </AnonymousTokenProvider>
  );
}
