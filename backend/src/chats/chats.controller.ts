import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Request,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
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
import { ChatsGateway } from './chats.gateway';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    @Inject(forwardRef(() => ChatsGateway))
    private readonly chatsGateway: ChatsGateway,
  ) {}

  @Post()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Create new chat or get existing active chat' })
  @ApiResponse({ status: 201, type: ChatDto })
  async createChat(
    @Request() req,
    @Body() createChatDto: CreateChatDto,
  ): Promise<ChatDto> {
    const userId = req.user?.type !== 'anonymous' ? req.user?.id : null;
    const anonymousUserId =
      req.user?.type === 'anonymous' ? req.user?.id : null;

    const chat = await this.chatsService.createChat(
      userId,
      anonymousUserId,
      createChatDto,
    );

    // Notify managers about new chat if it's newly created
    if (this.chatsGateway.server && chat.messages.length <= 2) {
      // New chat typically has 1-2 messages
      const chatListItem = await this.chatsService.formatChatListDto(
        chat as any,
        null,
      );
      this.chatsGateway.server.to('managers').emit('newChat', chatListItem);
    }

    return chat;
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get user chats' })
  @ApiResponse({ status: 200, type: [ChatListDto] })
  async getUserChats(@Request() req): Promise<ChatListDto[]> {
    const userId = req.user?.type !== 'anonymous' ? req.user?.id : null;
    const anonymousUserId =
      req.user?.type === 'anonymous' ? req.user?.id : null;

    return this.chatsService.getUserChats(userId, anonymousUserId);
  }

  @Get('manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get chats for manager' })
  @ApiResponse({ status: 200, type: [ChatListDto] })
  async getManagerChats(@Request() req): Promise<ChatListDto[]> {
    return this.chatsService.getManagerChats(req.user.id);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Get chat by ID' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, type: ChatDto })
  async getChatById(@Request() req, @Param('id') id: string): Promise<ChatDto> {
    const userId = req.user?.type !== 'anonymous' ? req.user?.id : null;
    const anonymousUserId =
      req.user?.type === 'anonymous' ? req.user?.id : null;
    const isManager =
      req.user?.role === 'MANAGER' || req.user?.role === 'ADMIN';

    return this.chatsService.getChatById(
      id,
      userId,
      anonymousUserId,
      isManager,
    );
  }

  @Post(':id/messages')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Send message to chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 201, type: ChatMessageDto })
  async sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
  ): Promise<ChatMessageDto> {
    const senderId = req.user?.id;
    if (!senderId) {
      throw new BadRequestException('Sender ID is required');
    }

    const message = await this.chatsService.sendMessage(
      id,
      senderId,
      sendMessageDto,
    );

    // Emit message through WebSocket
    console.log(`Emitting message to chat:${id}`, message);
    if (this.chatsGateway.server) {
      this.chatsGateway.server.to(`chat:${id}`).emit('newMessage', {
        chatId: id,
        message,
      });

      // Immediately emit delivery status
      this.chatsGateway.server.to(`chat:${id}`).emit('messageDelivered', {
        chatId: id,
        messageId: message.id,
        deliveredAt: message.deliveredAt,
      });

      // Also notify managers about new message
      this.chatsGateway.server.to('managers').emit('chatUpdate', {
        chatId: id,
        type: 'new_message',
        message,
      });

      console.log('Message emitted successfully');
    } else {
      console.error('WebSocket server not initialized');
    }

    return message;
  }

  @Patch(':id/messages/read')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200 })
  async markMessagesAsRead(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ count: number }> {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const result = await this.chatsService.markMessagesAsRead(id, userId);

    // Emit read status through WebSocket
    if (this.chatsGateway.server && result.count > 0) {
      this.chatsGateway.server.to(`chat:${id}`).emit('messagesRead', {
        chatId: id,
        readerId: userId,
        readAt: new Date(),
      });
    }

    return result;
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign manager to chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, type: ChatDto })
  async assignManager(
    @Request() req,
    @Param('id') id: string,
  ): Promise<ChatDto> {
    return this.chatsService.assignManager(id, req.user.id);
  }

  @Post(':id/offers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product offer in chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 201, type: ProductOfferDto })
  async createProductOffer(
    @Request() req,
    @Param('id') id: string,
    @Body() createProductOfferDto: CreateProductOfferDto,
  ): Promise<ProductOfferDto> {
    const offer = await this.chatsService.createProductOffer(
      id,
      req.user.id,
      createProductOfferDto,
    );

    // Get the chat with the new message to emit through WebSocket
    const chat = await this.chatsService.getChatById(id, req.user.id, null, true);
    const messageWithOffer = chat.messages.find(msg => msg.offerId === offer.id);

    if (messageWithOffer && this.chatsGateway.server) {
      // Emit the message with offer through WebSocket
      this.chatsGateway.server.to(`chat:${id}`).emit('newMessage', {
        chatId: id,
        message: messageWithOffer,
      });

      // Emit delivery status
      this.chatsGateway.server.to(`chat:${id}`).emit('messageDelivered', {
        chatId: id,
        messageId: messageWithOffer.id,
        deliveredAt: messageWithOffer.deliveredAt,
      });
    }

    return offer;
  }

  @Patch('offers/:offerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, type: ProductOfferDto })
  async updateProductOffer(
    @Request() req,
    @Param('offerId') offerId: string,
    @Body() updateProductOfferDto: UpdateProductOfferDto,
  ): Promise<ProductOfferDto> {
    return this.chatsService.updateProductOffer(offerId, req.user.id, updateProductOfferDto);
  }

  @Patch('offers/:offerId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel product offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, type: ProductOfferDto })
  async cancelProductOffer(
    @Request() req,
    @Param('offerId') offerId: string,
  ): Promise<ProductOfferDto> {
    return this.chatsService.cancelProductOffer(offerId, req.user.id);
  }

  @Patch('offers/:offerId/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate product offer' })
  @ApiParam({ name: 'offerId', description: 'Offer ID' })
  @ApiResponse({ status: 200, type: ProductOfferDto })
  async deactivateOffer(
    @Request() req,
    @Param('offerId') offerId: string,
  ): Promise<ProductOfferDto> {
    return this.chatsService.deactivateOffer(offerId, req.user.id);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close chat' })
  @ApiParam({ name: 'id', description: 'Chat ID' })
  @ApiResponse({ status: 200, type: ChatDto })
  async closeChat(@Param('id') id: string): Promise<ChatDto> {
    return this.chatsService.closeChat(id);
  }
}
