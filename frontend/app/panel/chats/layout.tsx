import { Suspense } from 'react';

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Загрузка чатов...</div>
      </div>
    }>
      {children}
    </Suspense>
  );
}