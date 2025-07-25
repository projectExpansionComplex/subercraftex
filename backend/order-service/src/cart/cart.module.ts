import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, User, Product])],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService], // Export CartService for use in other modules if needed
})
export class CartModule {}
