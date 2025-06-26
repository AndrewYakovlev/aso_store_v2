import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Configure web-push with VAPID keys
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT');

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      this.logger.warn(
        'VAPID keys not configured. Push notifications will not work.',
      );
    }
  }

  async createSubscription(
    data: CreateSubscriptionDto,
    userId?: string,
    anonymousUserId?: string,
  ) {
    // Check if subscription already exists
    const existing = await this.prisma.pushSubscription.findUnique({
      where: { endpoint: data.endpoint },
    });

    if (existing) {
      // Update existing subscription
      return this.prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: data.keys.p256dh,
          auth: data.keys.auth,
          userAgent: data.userAgent,
          isActive: true,
          userId,
          anonymousUserId,
        },
      });
    }

    // Create new subscription
    return this.prisma.pushSubscription.create({
      data: {
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        userAgent: data.userAgent,
        userId,
        anonymousUserId,
      },
    });
  }

  async removeSubscription(endpoint: string) {
    return this.prisma.pushSubscription.delete({
      where: { endpoint },
    });
  }

  async getUserSubscriptions(userId?: string, anonymousUserId?: string) {
    const where: any = {
      isActive: true,
    };

    if (userId) {
      where.userId = userId;
    } else if (anonymousUserId) {
      where.anonymousUserId = anonymousUserId;
    } else {
      return [];
    }

    return this.prisma.pushSubscription.findMany({ where });
  }

  async sendNotificationToUser(
    userId: string | undefined,
    anonymousUserId: string | undefined,
    notification: SendNotificationDto,
  ) {
    const subscriptions = await this.getUserSubscriptions(
      userId,
      anonymousUserId,
    );

    const results = await Promise.allSettled(
      subscriptions.map((sub) => this.sendNotification(sub, notification)),
    );

    // Log results
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to send notification to subscription ${subscriptions[index].id}:`,
          result.reason,
        );
      }
    });

    return {
      sent: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  async sendNotificationToEndpoint(
    endpoint: string,
    notification: SendNotificationDto,
  ) {
    const subscription = await this.prisma.pushSubscription.findUnique({
      where: { endpoint, isActive: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found or inactive');
    }

    return this.sendNotification(subscription, notification);
  }

  private async sendNotification(
    subscription: {
      endpoint: string;
      p256dh: string;
      auth: string;
      id: string;
    },
    notification: SendNotificationDto,
  ) {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon-192x192.png',
          badge: notification.badge || '/badge-72x72.png',
          data: notification.data,
          actions: notification.actions,
          tag: notification.tag,
          requireInteraction: notification.requireInteraction,
        }),
      );

      this.logger.log(
        `Notification sent successfully to subscription ${subscription.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send notification to subscription ${subscription.id}:`,
        error,
      );

      // Handle invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription is no longer valid, mark as inactive
        await this.prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { isActive: false },
        });
      }

      throw error;
    }
  }

  async testNotification(endpoint: string) {
    return this.sendNotificationToEndpoint(endpoint, {
      title: 'Тестовое уведомление',
      body: 'Это тестовое уведомление от АСО Store',
      icon: '/icon-192x192.png',
      data: { type: 'test' },
    });
  }
}
