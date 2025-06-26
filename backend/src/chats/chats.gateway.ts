import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  anonymousUserId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly chatsService: ChatsService) {}

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.query.userId as string;
    const anonymousUserId = client.handshake.query.anonymousUserId as string;
    const userRole = client.handshake.query.userRole as string;

    console.log('WebSocket connection:', { userId, anonymousUserId, userRole });

    if (userId || anonymousUserId) {
      const userKey = userId || anonymousUserId;
      client.userId = userId;
      client.anonymousUserId = anonymousUserId;
      client.userRole = userRole;

      // Store socket connection
      if (!this.userSockets.has(userKey)) {
        this.userSockets.set(userKey, new Set());
      }
      this.userSockets.get(userKey)!.add(client.id);

      // Join user's chat rooms
      const chats = await this.chatsService.getUserChats(
        userId,
        anonymousUserId,
      );
      for (const chat of chats) {
        void client.join(`chat:${chat.id}`);
        console.log(`Client ${client.id} auto-joined chat:${chat.id}`);
      }

      // If manager, join manager room
      if (userRole === 'MANAGER' || userRole === 'ADMIN') {
        void client.join('managers');
      }

      console.log(`Client ${client.id} connected for user ${userKey}`);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userKey = client.userId || client.anonymousUserId;
    if (userKey && this.userSockets.has(userKey)) {
      this.userSockets.get(userKey)!.delete(client.id);
      if (this.userSockets.get(userKey)!.size === 0) {
        this.userSockets.delete(userKey);
      }
    }
    console.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    void client.join(`chat:${chatId}`);
    console.log(`Client ${client.id} joined chat:${chatId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    void client.leave(`chat:${chatId}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    const senderId = client.userId || client.anonymousUserId;
    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.chatsService.sendMessage(
        data.chatId,
        senderId,
        {
          content: data.content,
        },
      );

      // Emit to all users in the chat room
      this.server.to(`chat:${data.chatId}`).emit('newMessage', {
        chatId: data.chatId,
        message,
      });

      // Immediately emit delivery status
      this.server.to(`chat:${data.chatId}`).emit('messageDelivered', {
        chatId: data.chatId,
        messageId: message.id,
        deliveredAt: message.deliveredAt,
      });

      // Notify managers about new message
      if (client.userRole !== 'MANAGER' && client.userRole !== 'ADMIN') {
        this.server.to('managers').emit('chatUpdate', {
          chatId: data.chatId,
          type: 'new_message',
          message,
        });
      }

      return { success: true, message };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() chatId: string,
  ) {
    const userId = client.userId || client.anonymousUserId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const result = await this.chatsService.markMessagesAsRead(chatId, userId);

      // Notify other users in the chat about read status
      client.to(`chat:${chatId}`).emit('messagesRead', {
        chatId,
        readerId: userId,
        readAt: new Date(),
      });

      return { success: true, ...result };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const userId = client.userId || client.anonymousUserId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Emit to other users in the chat room
    client.to(`chat:${data.chatId}`).emit('userTyping', {
      chatId: data.chatId,
      userId,
      isTyping: data.isTyping,
    });

    return { success: true };
  }

  // Method to emit events from service layer
  emitNewChat(chat: Record<string, unknown>) {
    // Notify managers about new chat
    this.server.to('managers').emit('newChat', chat);
  }

  emitChatUpdate(chatId: string, update: Record<string, unknown>) {
    this.server.to(`chat:${chatId}`).emit('chatUpdate', {
      chatId,
      ...update,
    });
  }

  emitNewOffer(chatId: string, offer: Record<string, unknown>) {
    this.server.to(`chat:${chatId}`).emit('newOffer', {
      chatId,
      offer,
    });
  }
}
