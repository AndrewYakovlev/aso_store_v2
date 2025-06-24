import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, ProductImagesController],
  providers: [ProductsService, ProductImagesService],
  exports: [ProductsService],
})
export class ProductsModule {}
