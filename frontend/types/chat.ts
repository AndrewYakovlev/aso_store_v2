export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  isDelivered: boolean;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
  senderName?: string;
  senderRole?: 'customer' | 'manager' | 'system';
}

export interface ProductOffer {
  id: string;
  chatId: string;
  managerId: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  managerName?: string;
}

export interface Chat {
  id: string;
  userId?: string;
  anonymousUserId?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  offers: ProductOffer[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatListItem {
  id: string;
  userId?: string;
  anonymousUserId?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  customerName?: string;
  customerPhone?: string;
}

export interface CreateChatDto {
  message?: string;
  productId?: string;
}

export interface SendMessageDto {
  content: string;
}

export interface CreateProductOfferDto {
  name: string;
  description?: string;
  price: number;
  expiresAt?: string;
}