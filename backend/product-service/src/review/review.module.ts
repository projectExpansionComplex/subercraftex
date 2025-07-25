import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './review.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Product, User])],
  providers: [ReviewService],
  controllers: [ReviewController],
  exports: [ReviewService], // Export ReviewService for use in other modules if needed
})
export class ReviewModule {}
