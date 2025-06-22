import { Metadata } from 'next';
import { ChatPage } from '@/components/chat/ChatPage';

export const metadata: Metadata = {
  title: 'Чат с экспертом | АСО',
  description: 'Получите консультацию от наших экспертов по подбору автозапчастей',
};

export default function Chat() {
  return <ChatPage />;
}