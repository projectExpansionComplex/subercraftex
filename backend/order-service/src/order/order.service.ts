import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { User } from '../user/user.entity'; // Assuming User entity is available
import { Product } from '../product/product.entity'; // Assuming Product entity is available

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { user_id, items, ...orderData } = createOrderDto;

    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const newOrder = this.orderRepository.create({ ...orderData, user });
    const savedOrder = await this.orderRepository.save(newOrder);

    for (const itemDto of items) {
      const product = await this.productRepository.findOneBy({ id: itemDto.product_id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${itemDto.product_id} not found`);
      }
      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product,
        quantity: itemDto.quantity,
        price: itemDto.price,
      });
      await this.orderItemRepository.save(orderItem);
    }

    return (await this.orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['user', 'items', 'items.product'],
    }))!;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }
}