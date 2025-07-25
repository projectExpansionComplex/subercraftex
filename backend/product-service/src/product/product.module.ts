import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../review/review.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductVariant, Review, Category, User])],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService], // Export ProductService for use in other modules if needed
})
export class ProductModule {}
