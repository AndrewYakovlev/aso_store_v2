import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CartModule),
    forwardRef(() => FavoritesModule),
    forwardRef(() => ChatsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
