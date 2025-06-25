import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AttributesModule } from './attributes/attributes.module';
import { BrandsModule } from './brands/brands.module';
import { VehicleBrandsModule } from './vehicle-brands/vehicle-brands.module';
import { VehicleModelsModule } from './vehicle-models/vehicle-models.module';
import { ProductVehiclesModule } from './product-vehicles/product-vehicles.module';
import { ImportsModule } from './imports/imports.module';
import { ChatsModule } from './chats/chats.module';
import { UsersModule } from './users/users.module';
import { DeliveryMethodsModule } from './delivery-methods/delivery-methods.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { OrderStatusesModule } from './order-statuses/order-statuses.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UploadsModule } from './uploads/uploads.module';
import { PromoCodesModule } from './promo-codes/promo-codes.module';
import { SettingsModule } from './settings/settings.module';
import { AnonymousUsersModule } from './anonymous-users/anonymous-users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    FavoritesModule,
    CartModule,
    OrdersModule,
    AttributesModule,
    BrandsModule,
    VehicleBrandsModule,
    VehicleModelsModule,
    ProductVehiclesModule,
    ImportsModule,
    ChatsModule,
    UsersModule,
    DeliveryMethodsModule,
    NotificationsModule,
    PaymentMethodsModule,
    OrderStatusesModule,
    StatisticsModule,
    UploadsModule,
    PromoCodesModule,
    SettingsModule,
    AnonymousUsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
