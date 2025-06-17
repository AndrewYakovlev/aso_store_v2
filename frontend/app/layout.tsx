import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AnonymousTokenProvider } from "@/components/AnonymousTokenProvider";
import { AuthProvider } from "@/lib/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "АСО - интернет-магазин автозапчастей",
  description: "Широкий ассортимент автозапчастей для всех марок автомобилей. Быстрая доставка, гарантия качества.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnonymousTokenProvider>
          <AuthProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
          </AuthProvider>
        </AnonymousTokenProvider>
      </body>
    </html>
  );
}
