import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddProductToCartDto, UpdateCartItemQuantityDto } from './dto/cart.dto';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId')
  getCartByUserId(@Param('userId') userId: string) {
    return this.cartService.getCartByUserId(userId);
  }

  @Post(':userId/items')
  @HttpCode(HttpStatus.OK)
  addProductToCart(
    @Param('userId') userId: string,
    @Body() addProductToCartDto: AddProductToCartDto,
  ) {
    const { product_id, quantity } = addProductToCartDto;
    return this.cartService.addProductToCart(userId, product_id, quantity);
  }

  @Put(':userId/items/:productId')
  @HttpCode(HttpStatus.OK)
  updateCartItemQuantity(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
  ) {
    const { quantity } = updateCartItemQuantityDto;
    return this.cartService.updateCartItemQuantity(userId, productId, quantity);
  }

  @Delete(':userId/items/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProductFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeProductFromCart(userId, productId);
  }

  @Delete(':userId/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@Param('userId') userId: string) {
    return this.cartService.clearCart(userId);
  }
}