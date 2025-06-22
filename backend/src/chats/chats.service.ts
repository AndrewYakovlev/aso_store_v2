import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateProductOfferDto } from './dto/create-product-offer.dto';
import { UpdateProductOfferDto } from './dto/update-product-offer.dto';
import {
  ChatDto,
  ChatListDto,
  ChatMessageDto,
  ProductOfferDto,
} from './dto/chat.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ChatsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createChat(
    userId: string | null,
    anonymousUserId: string | null,
    createChatDto: CreateChatDto,
  ): Promise<ChatDto> {
    if (!userId && !anonymousUserId) {
      throw new BadRequestException('User or anonymous user ID is required');
    }

    // Check if active chat already exists
    const existingChat = await this.prisma.chat.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(anonymousUserId ? [{ anonymousUserId }] : []),
        ],
        isActive: true,
      },
    });

    if (existingChat) {
      // If initial message provided, send it
      if (createChatDto.message) {
        await this.sendMessage(
          existingChat.id,
          userId || anonymousUserId || '',
          {
            content: createChatDto.message,
          },
        );
      }
      return this.getChatById(existingChat.id, userId, anonymousUserId, false);
    }

    // Create new chat
    const chat = await this.prisma.chat.create({
      data: {
        ...(userId ? { userId } : { anonymousUserId }),
      },
    });

    // Send initial message if provided
    if (createChatDto.message) {
      await this.sendMessage(chat.id, userId || anonymousUserId || '', {
        content: createChatDto.message,
      });
    }

    // Send welcome message from system
    await this.sendSystemMessage(
      chat.id,
      'Добро пожаловать в чат с экспертом! Наш специалист ответит вам в ближайшее время.',
    );

    return this.getChatById(chat.id, userId, anonymousUserId, false);
  }

  async getChatById(
    chatId: string,
    userId: string | null,
    anonymousUserId: string | null,
    isManager: boolean = false,
  ): Promise<ChatDto> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            offer: true,
          },
        },
        offers: {
          include: {
            chat: {
              select: {
                managerId: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Check access permissions - managers can access any chat
    if (!isManager) {
      if (userId && chat.userId !== userId) {
        throw new BadRequestException('Access denied');
      }
      if (anonymousUserId && chat.anonymousUserId !== anonymousUserId) {
        throw new BadRequestException('Access denied');
      }
    }

    return await this.formatChatDto(chat, userId || anonymousUserId);
  }

  async getUserChats(
    userId: string | null,
    anonymousUserId: string | null,
  ): Promise<ChatListDto[]> {
    if (!userId && !anonymousUserId) {
      // Return empty array if no user identification yet
      return [];
    }

    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(anonymousUserId ? [{ anonymousUserId }] : []),
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(
      chats.map((chat) =>
        this.formatChatListDto(chat, userId || anonymousUserId),
      ),
    );
  }

  async getManagerChats(managerId: string): Promise<ChatListDto[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          { managerId },
          { managerId: null }, // Include unassigned chats
        ],
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        anonymousUser: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return Promise.all(
      chats.map((chat) => this.formatChatListDto(chat, managerId)),
    );
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<ChatMessageDto> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content: sendMessageDto.content,
        // Messages are marked as delivered immediately when sent via API
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    // Update chat's updatedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    // Send push notification to the recipient
    try {
      const recipientId = senderId === chat.userId ? chat.managerId : chat.userId;
      const recipientAnonymousId = senderId === chat.anonymousUserId ? null : chat.anonymousUserId;
      
      if (recipientId || recipientAnonymousId) {
        // Get sender info for notification
        const sender = await this.prisma.user.findUnique({
          where: { id: senderId },
          select: { firstName: true, lastName: true },
        });
        
        const senderName = sender 
          ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Менеджер'
          : chat.user ? `${chat.user.firstName || ''} ${chat.user.lastName || ''}`.trim() || 'Покупатель' : 'Покупатель';
        
        await this.notificationsService.sendNotificationToUser(
          recipientId || undefined,
          recipientAnonymousId || undefined,
          {
            title: `Новое сообщение от ${senderName}`,
            body: sendMessageDto.content.length > 100 
              ? sendMessageDto.content.substring(0, 100) + '...' 
              : sendMessageDto.content,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: `chat-${chatId}`,
            data: {
              type: 'chat_message',
              chatId,
              messageId: message.id,
            },
            actions: [
              {
                action: 'open-chat',
                title: 'Открыть чат',
              },
            ],
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the message send
      console.error('Failed to send push notification:', error);
    }

    // Load manager info if sender is manager
    let manager: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null = null;
    if (senderId === chat.managerId) {
      manager = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    return this.formatMessageDto(message, chat, manager);
  }

  async sendSystemMessage(
    chatId: string,
    content: string,
  ): Promise<ChatMessageDto> {
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: 'system',
        content,
        // System messages are also marked as delivered immediately
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    return this.formatMessageDto(message);
  }

  async markMessagesAsRead(
    chatId: string,
    userId: string,
  ): Promise<{ count: number }> {
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { count: result.count };
  }

  async assignManager(chatId: string, managerId: string): Promise<ChatDto> {
    const chat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { managerId },
    });

    // Get manager info for system message
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const managerName = manager
      ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() ||
        'Менеджер'
      : 'Менеджер';

    await this.sendSystemMessage(
      chatId,
      `К чату подключился ${managerName}. Он ответит на ваши вопросы.`,
    );

    return this.getChatById(chatId, null, null, true);
  }

  async createProductOffer(
    chatId: string,
    managerId: string,
    createProductOfferDto: CreateProductOfferDto,
  ): Promise<ProductOfferDto> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Assign manager to chat if not assigned
    if (!chat.managerId) {
      await this.prisma.chat.update({
        where: { id: chatId },
        data: { managerId },
      });
    }

    // Validate that only one of isOriginal or isAnalog can be true
    if (createProductOfferDto.isOriginal && createProductOfferDto.isAnalog) {
      throw new BadRequestException(
        'Product cannot be both original and analog',
      );
    }

    const offer = await this.prisma.productOffer.create({
      data: {
        chatId,
        managerId,
        name: createProductOfferDto.name,
        description: createProductOfferDto.description,
        price: new Decimal(createProductOfferDto.price),
        oldPrice: createProductOfferDto.oldPrice
          ? new Decimal(createProductOfferDto.oldPrice)
          : null,
        image: createProductOfferDto.image || (createProductOfferDto.images?.[0] ?? null),
        images: createProductOfferDto.images || [],
        deliveryDays: createProductOfferDto.deliveryDays,
        isOriginal: createProductOfferDto.isOriginal || false,
        isAnalog: createProductOfferDto.isAnalog || false,
        expiresAt: createProductOfferDto.expiresAt,
      },
    });

    // Create a message with the offer
    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: managerId,
        content: `Товарное предложение: ${offer.name}`,
        offerId: offer.id,
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    // Send push notification about product offer
    try {
      const recipientId = chat.userId;
      const recipientAnonymousId = chat.anonymousUserId;
      
      if (recipientId || recipientAnonymousId) {
        // Get manager info for notification
        const manager = await this.prisma.user.findUnique({
          where: { id: managerId },
          select: { firstName: true, lastName: true },
        });
        
        const managerName = manager 
          ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Менеджер'
          : 'Менеджер';
        
        await this.notificationsService.sendNotificationToUser(
          recipientId || undefined,
          recipientAnonymousId || undefined,
          {
            title: `Новое предложение от ${managerName}`,
            body: `${offer.name} - ${offer.price} ₽`,
            icon: offer.image || '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: `offer-${offer.id}`,
            data: {
              type: 'product_offer',
              chatId,
              offerId: offer.id,
            },
            actions: [
              {
                action: 'view-offer',
                title: 'Посмотреть предложение',
              },
            ],
            requireInteraction: true, // Keep notification visible until user interacts
          },
        );
      }
    } catch (error) {
      // Log error but don't fail the offer creation
      console.error('Failed to send push notification for offer:', error);
    }

    return this.formatProductOfferDto(offer);
  }

  async deactivateOffer(
    offerId: string,
    managerId: string,
  ): Promise<ProductOfferDto> {
    const offer = await this.prisma.productOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.managerId !== managerId) {
      throw new BadRequestException('Access denied');
    }

    const updatedOffer = await this.prisma.productOffer.update({
      where: { id: offerId },
      data: { isActive: false },
    });

    return this.formatProductOfferDto(updatedOffer);
  }

  async updateProductOffer(
    offerId: string,
    managerId: string,
    updateProductOfferDto: UpdateProductOfferDto,
  ): Promise<ProductOfferDto> {
    const offer = await this.prisma.productOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.managerId !== managerId) {
      throw new BadRequestException('Access denied');
    }

    // Validate that only one of isOriginal or isAnalog can be true
    if (updateProductOfferDto.isOriginal && updateProductOfferDto.isAnalog) {
      throw new BadRequestException(
        'Product cannot be both original and analog',
      );
    }

    const updatedOffer = await this.prisma.productOffer.update({
      where: { id: offerId },
      data: {
        name: updateProductOfferDto.name,
        description: updateProductOfferDto.description,
        price: updateProductOfferDto.price
          ? new Decimal(updateProductOfferDto.price)
          : undefined,
        oldPrice: updateProductOfferDto.oldPrice !== undefined
          ? updateProductOfferDto.oldPrice
            ? new Decimal(updateProductOfferDto.oldPrice)
            : null
          : undefined,
        images: updateProductOfferDto.images,
        image: updateProductOfferDto.images?.[0] ?? undefined,
        deliveryDays: updateProductOfferDto.deliveryDays,
        isOriginal: updateProductOfferDto.isOriginal,
        isAnalog: updateProductOfferDto.isAnalog,
        isActive: updateProductOfferDto.isActive,
        expiresAt: updateProductOfferDto.expiresAt,
      },
    });

    return this.formatProductOfferDto(updatedOffer);
  }

  async cancelProductOffer(
    offerId: string,
    managerId: string,
  ): Promise<ProductOfferDto> {
    const offer = await this.prisma.productOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.managerId !== managerId) {
      throw new BadRequestException('Access denied');
    }

    const updatedOffer = await this.prisma.productOffer.update({
      where: { id: offerId },
      data: { 
        isCancelled: true,
        isActive: false 
      },
    });

    return this.formatProductOfferDto(updatedOffer);
  }

  async closeChat(chatId: string): Promise<ChatDto> {
    const chat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { isActive: false },
    });

    await this.sendSystemMessage(chatId, 'Чат был закрыт.');

    return this.getChatById(chatId, null, null, true);
  }

  private async formatChatDto(
    chat: any,
    currentUserId: string | null,
  ): Promise<ChatDto> {
    // Load manager info if chat has managerId
    let manager: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null = null;
    if (chat.managerId) {
      manager = await this.prisma.user.findUnique({
        where: { id: chat.managerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    const messages = chat.messages.map((msg) =>
      this.formatMessageDto(msg, chat, manager),
    );
    const offers = chat.offers.map((offer) =>
      this.formatProductOfferDto(offer, manager),
    );

    // Count unread messages that are not from the current user
    const unreadCount = chat.messages.filter(
      (msg) =>
        !msg.isRead &&
        msg.senderId !== currentUserId &&
        msg.senderId !== 'system',
    ).length;

    return {
      id: chat.id,
      userId: chat.userId,
      anonymousUserId: chat.anonymousUserId,
      managerId: chat.managerId,
      isActive: chat.isActive,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messages,
      offers,
      lastMessage: messages[messages.length - 1],
      unreadCount,
    };
  }

  async formatChatListDto(
    chat: any,
    currentUserId: string | null,
  ): Promise<ChatListDto> {
    // Load manager info if chat has managerId
    let manager: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null = null;
    if (chat.managerId) {
      manager = await this.prisma.user.findUnique({
        where: { id: chat.managerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    }

    const lastMessage = chat.messages[0]
      ? this.formatMessageDto(chat.messages[0], chat, manager)
      : undefined;

    // Count all unread messages in the chat that are not from the current user
    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        chatId: chat.id,
        senderId: currentUserId ? { not: currentUserId } : undefined,
        isRead: false,
      },
    });

    return {
      id: chat.id,
      userId: chat.userId,
      anonymousUserId: chat.anonymousUserId,
      managerId: chat.managerId,
      isActive: chat.isActive,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessage,
      unreadCount,
      customerName: chat.user
        ? `${chat.user.firstName || ''} ${chat.user.lastName || ''}`.trim()
        : 'Анонимный пользователь',
      customerPhone: chat.user?.phone,
    };
  }

  private formatMessageDto(
    message: any,
    chat?: any,
    manager?: any,
  ): ChatMessageDto {
    let senderName = 'Неизвестный';
    let senderRole: 'customer' | 'manager' | 'system' = 'customer';

    if (message.senderId === 'system') {
      senderName = 'Система';
      senderRole = 'system';
    } else if (chat) {
      if (
        message.senderId === chat.userId ||
        message.senderId === chat.anonymousUserId
      ) {
        senderName = chat.user
          ? `${chat.user.firstName || ''} ${chat.user.lastName || ''}`.trim() ||
            'Клиент'
          : 'Клиент';
        senderRole = 'customer';
      } else if (
        message.senderId === chat.managerId ||
        (manager && message.senderId === manager.id)
      ) {
        senderName = manager
          ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() ||
            'Менеджер'
          : 'Менеджер';
        senderRole = 'manager';
      }
    }

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      offerId: message.offerId,
      offer: message.offer
        ? this.formatProductOfferDto(message.offer, manager)
        : undefined,
      isRead: message.isRead,
      isDelivered: message.isDelivered,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      senderName,
      senderRole,
    };
  }

  private formatProductOfferDto(offer: any, manager?: any): ProductOfferDto {
    return {
      id: offer.id,
      chatId: offer.chatId,
      managerId: offer.managerId,
      name: offer.name,
      description: offer.description,
      price: offer.price,
      oldPrice: offer.oldPrice,
      image: offer.image,
      images: offer.images || [],
      deliveryDays: offer.deliveryDays,
      isOriginal: offer.isOriginal,
      isAnalog: offer.isAnalog,
      isActive: offer.isActive,
      isCancelled: offer.isCancelled || false,
      createdAt: offer.createdAt,
      expiresAt: offer.expiresAt,
      managerName: manager
        ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() ||
          'Менеджер'
        : 'Менеджер',
      messageId: offer.messageId,
    };
  }
}
