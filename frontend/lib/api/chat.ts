import { UnifiedApiClient } from './unified-client';
import { apiRequest } from './client';
import type {
  Chat,
  ChatListItem,
  ChatMessage,
  CreateChatDto,
  SendMessageDto,
  CreateProductOfferDto,
  UpdateProductOfferDto,
  ProductOffer,
} from '@/types/chat';

export const chatApi = {
  // Create new chat or get existing active chat
  createChat: async (data: CreateChatDto): Promise<Chat> => {
    return UnifiedApiClient.post<Chat>('/chats', data);
  },

  // Get user chats
  getUserChats: async (): Promise<ChatListItem[]> => {
    return UnifiedApiClient.get<ChatListItem[]>('/chats');
  },

  // Get chat by ID
  getChatById: async (id: string, accessToken?: string): Promise<Chat> => {
    // If accessToken is explicitly provided (for manager), use it
    if (accessToken) {
      return apiRequest<Chat>(`/chats/${id}`, { token: accessToken });
    }
    // Otherwise use UnifiedApiClient which will handle auth priority
    return UnifiedApiClient.get<Chat>(`/chats/${id}`);
  },

  // Send message to chat
  sendMessage: async (chatId: string, data: SendMessageDto, accessToken?: string): Promise<ChatMessage> => {
    // If accessToken is explicitly provided (for manager), use it
    if (accessToken) {
      return apiRequest<ChatMessage>(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
        token: accessToken,
      });
    }
    // Otherwise use UnifiedApiClient which will handle auth priority
    return UnifiedApiClient.post<ChatMessage>(`/chats/${chatId}/messages`, data);
  },

  // Mark messages as read
  markMessagesAsRead: async (chatId: string, accessToken?: string): Promise<{ count: number }> => {
    // If accessToken is explicitly provided (for manager), use it
    if (accessToken) {
      return apiRequest<{ count: number }>(`/chats/${chatId}/messages/read`, {
        method: 'PATCH',
        token: accessToken,
      });
    }
    // Otherwise use UnifiedApiClient which will handle auth priority
    return UnifiedApiClient.patch<{ count: number }>(`/chats/${chatId}/messages/read`);
  },

  // Manager endpoints
  getManagerChats: async (accessToken: string): Promise<ChatListItem[]> => {
    return apiRequest<ChatListItem[]>('/chats/manager', {
      token: accessToken,
    });
  },

  assignManager: async (chatId: string, accessToken: string): Promise<Chat> => {
    return apiRequest<Chat>(`/chats/${chatId}/assign`, {
      method: 'PATCH',
      token: accessToken,
    });
  },

  createProductOffer: async (
    chatId: string,
    data: CreateProductOfferDto,
    accessToken: string,
  ): Promise<ProductOffer> => {
    return apiRequest<ProductOffer>(`/chats/${chatId}/offers`, {
      method: 'POST',
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  deactivateOffer: async (offerId: string, accessToken: string): Promise<ProductOffer> => {
    return apiRequest<ProductOffer>(`/chats/offers/${offerId}/deactivate`, {
      method: 'PATCH',
      token: accessToken,
    });
  },

  updateProductOffer: async (
    offerId: string,
    data: UpdateProductOfferDto,
    accessToken: string
  ): Promise<ProductOffer> => {
    return apiRequest<ProductOffer>(`/chats/offers/${offerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token: accessToken,
    });
  },

  cancelProductOffer: async (
    offerId: string,
    accessToken: string
  ): Promise<ProductOffer> => {
    return apiRequest<ProductOffer>(`/chats/offers/${offerId}/cancel`, {
      method: 'PATCH',
      token: accessToken,
    });
  },

  closeChat: async (chatId: string, accessToken: string): Promise<Chat> => {
    return apiRequest<Chat>(`/chats/${chatId}/close`, {
      method: 'PATCH',
      token: accessToken,
    });
  },
};