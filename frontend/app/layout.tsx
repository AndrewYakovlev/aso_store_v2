import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnonymousTokenProvider } from '@/components/AnonymousTokenProvider';
import { NotificationProvider } from '@/lib/contexts/NotificationContext';
import { NotificationInitializer } from '@/components/NotificationInitializer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'АСО - Автозапчасти онлайн',
  description: 'Интернет-магазин автозапчастей с широким ассортиментом',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <AnonymousTokenProvider>
          <NotificationProvider>
            <NotificationInitializer />
            {children}
            <Toaster />
          </NotificationProvider>
        </AnonymousTokenProvider>
      </body>
    </html>
  );
}