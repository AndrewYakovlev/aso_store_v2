import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnonymousTokenProvider } from '@/components/AnonymousTokenProvider';
import { NotificationProvider } from '@/lib/contexts/NotificationContext';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'АСО - Автозапчасти онлайн',
  description: 'Интернет-магазин автозапчастей с широким ассортиментом',
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
            {children}
          </NotificationProvider>
        </AnonymousTokenProvider>
      </body>
    </html>
  );
}