import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { Product } from '../product/product.entity'; // Assuming Product entity is available
import { User } from '../user/user.entity'; // Assuming User entity is available

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getCartByUserId(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      cart = this.cartRepository.create({ user });
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async addProductToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = product.price; // Update price in case it changed
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        price: product.price,
      });
      cart.items.push(cartItem); // Explicitly add to cart items array
    }

    await this.cartItemRepository.save(cartItem);
    await this.updateCartTotal(cart);
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    return updatedCart as Cart;
  }

  async updateCartItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart`);
    }

    if (quantity <= 0) {
      console.log('Removing cart item:', cartItem);
      await this.cartItemRepository.remove(cartItem);
      cart.items = cart.items.filter(item => item.id !== cartItem.id);
    } else {
      cartItem.quantity = quantity;
      console.log('Updating cart item quantity:', cartItem);
      await this.cartItemRepository.save(cartItem);
      const index = cart.items.findIndex(item => item.id === cartItem.id);
      if (index !== -1) {
        cart.items[index].quantity = quantity;
      }
    }

    await this.updateCartTotal(cart);
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    console.log('Cart after update quantity:', updatedCart);
    return updatedCart as Cart;
  }

  async removeProductFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (!cartItem) {
      throw new NotFoundException(`Product with ID ${productId} not found in cart`);
    }

    console.log('Removing cart item:', cartItem);
    await this.cartItemRepository.remove(cartItem);
    // Reload the cart to ensure its items are up-to-date
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    if (!updatedCart) {
      throw new NotFoundException(`Cart with ID ${cart.id} not found after item removal`);
    }
    await this.updateCartTotal(updatedCart); // Update total on the reloaded cart

    console.log('Cart after remove product:', updatedCart);
    return updatedCart;
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    console.log('Clearing cart for user:', userId);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
    cart.items = []; // Clear cart items array
    await this.updateCartTotal(cart);
    const updatedCart = await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product'],
    });
    console.log('Cart after clear:', updatedCart);
    return updatedCart as Cart;
  }

  private async updateCartTotal(cart: Cart): Promise<void> {
    const items = await this.cartItemRepository.find({ where: { cart: { id: cart.id } }, relations: ['product'] });
    cart.total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    await this.cartRepository.save(cart);
  }
}