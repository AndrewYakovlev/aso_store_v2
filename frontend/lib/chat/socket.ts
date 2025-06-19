import { io, Socket } from 'socket.io-client';
import type { ChatMessage, ProductOffer } from '@/types/chat';

export interface ChatSocketEvents {
  // Client to server
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: { chatId: string; content: string }) => void;
  markAsRead: (chatId: string) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;

  // Server to client
  newMessage: (data: { chatId: string; message: ChatMessage }) => void;
  messagesRead: (data: { chatId: string; readerId: string }) => void;
  userTyping: (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  newOffer: (data: { chatId: string; offer: ProductOffer }) => void;
  chatUpdate: (data: { chatId: string; type: string; [key: string]: any }) => void;
  newChat: (chat: any) => void;
}

class ChatSocketClient {
  private socket: Socket<ChatSocketEvents> | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(userId?: string, anonymousUserId?: string, userRole?: string, token?: string) {
    if (this.socket?.connected) {
      return;
    }

    const query: any = {};
    if (userId) query.userId = userId;
    if (anonymousUserId) query.anonymousUserId = anonymousUserId;
    if (userRole) query.userRole = userRole;
    if (token) query.token = token;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    this.socket = io(baseUrl, {
      path: '/socket.io/',
      query,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    // Set up event listeners
    this.socket.on('newMessage', (data) => {
      console.log('Socket received newMessage:', data);
      this.emit('newMessage', data);
    });

    this.socket.on('messagesRead', (data) => {
      this.emit('messagesRead', data);
    });

    this.socket.on('userTyping', (data) => {
      this.emit('userTyping', data);
    });

    this.socket.on('newOffer', (data) => {
      this.emit('newOffer', data);
    });

    this.socket.on('chatUpdate', (data) => {
      this.emit('chatUpdate', data);
    });

    this.socket.on('newChat', (data) => {
      this.emit('newChat', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string) {
    this.socket?.emit('joinChat', chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leaveChat', chatId);
  }

  sendMessage(chatId: string, content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('sendMessage', { chatId, content });
      resolve({ success: true });
    });
  }

  markAsRead(chatId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('markAsRead', chatId);
      resolve({ success: true });
    });
  }

  setTyping(chatId: string, isTyping: boolean) {
    this.socket?.emit('typing', { chatId, isTyping });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    console.log(`Emitting event ${event} to ${this.listeners.get(event)?.size || 0} listeners`, data);
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

export const chatSocket = new ChatSocketClient();