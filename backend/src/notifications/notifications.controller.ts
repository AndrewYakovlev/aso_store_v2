import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: 'Subscribe to push notifications' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
  })
  async subscribe(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.id;
    const anonymousUserId = req.anonymousUserId;

    return this.notificationsService.createSubscription(
      createSubscriptionDto,
      userId,
      anonymousUserId,
    );
  }

  @Delete('unsubscribe/:endpoint')
  @ApiOperation({ summary: 'Unsubscribe from push notifications' })
  @ApiResponse({
    status: 200,
    description: 'Subscription removed successfully',
  })
  async unsubscribe(@Param('endpoint') endpoint: string) {
    return this.notificationsService.removeSubscription(endpoint);
  }

  @Post('test/:endpoint')
  @ApiOperation({ summary: 'Send test notification' })
  @ApiResponse({ status: 200, description: 'Test notification sent' })
  async testNotification(@Param('endpoint') endpoint: string) {
    return this.notificationsService.testNotification(endpoint);
  }

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Get VAPID public key' })
  @ApiResponse({ status: 200, description: 'VAPID public key' })
  getVapidPublicKey() {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
    };
  }
}
