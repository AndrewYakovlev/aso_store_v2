import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

export class ProductOfferDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  managerId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  price: number | Decimal;

  @ApiPropertyOptional()
  oldPrice?: number | Decimal;

  @ApiPropertyOptional({
    description: 'Image URL (deprecated, use images instead)',
  })
  image?: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiPropertyOptional()
  deliveryDays?: number;

  @ApiPropertyOptional()
  isOriginal?: boolean;

  @ApiPropertyOptional()
  isAnalog?: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isCancelled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  expiresAt?: Date;

  @ApiPropertyOptional()
  managerName?: string;

  @ApiPropertyOptional()
  messageId?: string;
}

export class ChatMessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  chatId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  offerId?: string;

  @ApiPropertyOptional({ type: () => ProductOfferDto })
  offer?: ProductOfferDto;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  isDelivered: boolean;

  @ApiPropertyOptional()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  readAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  senderName?: string;

  @ApiPropertyOptional()
  senderRole?: 'customer' | 'manager' | 'system';
}

export class ChatDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  anonymousUserId?: string;

  @ApiPropertyOptional()
  managerId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [ChatMessageDto] })
  messages: ChatMessageDto[];

  @ApiProperty({ type: [ProductOfferDto] })
  offers: ProductOfferDto[];

  @ApiPropertyOptional()
  lastMessage?: ChatMessageDto;

  @ApiProperty()
  unreadCount: number;
}

export class ChatListDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  anonymousUserId?: string;

  @ApiPropertyOptional()
  managerId?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  lastMessage?: ChatMessageDto;

  @ApiProperty()
  unreadCount: number;

  @ApiPropertyOptional()
  customerName?: string;

  @ApiPropertyOptional()
  customerPhone?: string;
}
