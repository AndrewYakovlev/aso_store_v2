import { Module } from '@nestjs/common';
import { AnonymousUsersController } from './anonymous-users.controller';
import { AnonymousUsersService } from './anonymous-users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnonymousUsersController],
  providers: [AnonymousUsersService],
  exports: [AnonymousUsersService],
})
export class AnonymousUsersModule {}
