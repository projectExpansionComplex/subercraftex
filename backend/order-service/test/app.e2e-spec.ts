import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from './../src/user/user.entity';
import { Product } from './../src/product/product.entity';
import { Category } from './../src/category/category.entity';
import { Cart } from './../src/cart/cart.entity';
import { Order } from './../src/order/order.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

jest.setTimeout(60000); // Increase timeout for beforeAll hook

describe('Order Service (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<Category>;
  let cartRepository: Repository<Cart>;
  let orderRepository: Repository<Order>;

  let testUser: User;
  let testProduct: Product;
  let testCategory: Category;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([User, Product, Category, Cart, Order])],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    productRepository = moduleFixture.get<Repository<Product>>(getRepositoryToken(Product));
    categoryRepository = moduleFixture.get<Repository<Category>>(getRepositoryToken(Category));
    cartRepository = moduleFixture.get<Repository<Cart>>(getRepositoryToken(Cart));
    orderRepository = moduleFixture.get<Repository<Order>>(getRepositoryToken(Order));

    // Clear tables before tests
    await orderRepository.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;');
    await orderRepository.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE;');
    await cartRepository.query('TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE;');
    await cartRepository.query('TRUNCATE TABLE carts RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_variants RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
    await categoryRepository.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

    // Create test user
    testUser = await userRepository.save(userRepository.create({
      username: 'testuser_order_service',
      email: 'test_order_service@example.com',
      password: 'hashedpassword',
      first_name: 'Order',
      last_name: 'User',
      user_type: 'individual',
      verified: true,
    }));

    // Create test category
    testCategory = await categoryRepository.save(categoryRepository.create({
      name: 'Test Category for Order',
      description: 'Category for order service tests',
      image_url: 'http://example.com/order_cat.jpg',
    }));

    // Create test product
    const productToCreate = productRepository.create({
      name: 'Test Product for Order',
      description: 'Product for order service tests',
      price: 100.00,
      thumbnail: 'http://example.com/order_thumb.jpg',
      images: ['http://example.com/order_img1.jpg'].map(url => ({ image_url: url })), // Manually create ProductImage objects
      stock: 10,
    });
    productToCreate.category = testCategory;
    productToCreate.designer = testUser;
    testProduct = await productRepository.save(productToCreate);
  });

  afterAll(async () => {
    // Clean up tables after all tests
    await orderRepository.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;');
    await orderRepository.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE;');
    await cartRepository.query('TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE;');
    await cartRepository.query('TRUNCATE TABLE carts RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_variants RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
    await categoryRepository.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    await app.close();
  });

  describe('CartController', () => {
    it('/carts/:userId (GET) - should get or create a cart for a user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);
      expect(response.body.id).toBeDefined();
      expect(response.body.user.id).toEqual(testUser.id);
    });

    it('/carts/:userId/items (POST) - should add a product to the cart', async () => {
      const addProductData = {
        product_id: testProduct.id,
        quantity: 2,
      };
      await request(app.getHttpServer())
        .post(`/carts/${testUser.id}/items`)
        .send(addProductData)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);

      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].product.id).toEqual(testProduct.id);
      expect(response.body.items[0].quantity).toEqual(2);
      expect(parseFloat(response.body.total)).toEqual(testProduct.price * 2);
    });

    it('/carts/:userId/items/:productId (PUT) - should update product quantity in cart', async () => {
      const updateQuantityData = {
        quantity: 3,
      };
      await request(app.getHttpServer())
        .put(`/carts/${testUser.id}/items/${testProduct.id}`)
        .send(updateQuantityData)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);

      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toEqual(3);
      expect(parseFloat(response.body.total)).toEqual(testProduct.price * 3);
    });

    it('/carts/:userId/items/:productId (DELETE) - should remove product from cart', async () => {
      await request(app.getHttpServer())
        .delete(`/carts/${testUser.id}/items/${testProduct.id}`)
        .expect(204);
      const response = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);
      expect(response.body.items.length).toBe(0);
      expect(parseFloat(response.body.total)).toEqual(0);
    });

    it('/carts/:userId/clear (DELETE) - should clear the cart', async () => {
      // Add product first to clear it
      await request(app.getHttpServer())
        .post(`/carts/${testUser.id}/items`)
        .send({ product_id: testProduct.id, quantity: 1 })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/carts/${testUser.id}/clear`)
        .expect(204);
      const response = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);
      expect(response.body.items.length).toBe(0);
      expect(parseFloat(response.body.total)).toEqual(0);
    });
  });

  describe('OrderController', () => {
    beforeEach(async () => {
      // Ensure cart is empty before each order test
      await request(app.getHttpServer())
        .delete(`/carts/${testUser.id}/clear`)
        .expect(204);

      // Add product to cart for order creation
      await request(app.getHttpServer())
        .post(`/carts/${testUser.id}/items`)
        .send({ product_id: testProduct.id, quantity: 1 })
        .expect(200);
    });

    it('/orders (POST) - should create an order from cart', async () => {
      const cartResponse = await request(app.getHttpServer())
        .get(`/carts/${testUser.id}`)
        .expect(200);
      const cart = cartResponse.body;

      const createOrderData = {
        user_id: testUser.id,
        total: parseFloat(cart.total),
        status: 'pending',
        shipping_address: '123 Test St, Test City',
        payment_method: 'Credit Card',
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: 100,
        })),
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .send(createOrderData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.user.id).toEqual(testUser.id);
      expect(response.body.items.length).toBe(1);
      expect(response.body.total).toEqual(cart.total);
    });

    it('/orders (GET) - should return all orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/orders/:id (GET) - should return an order by ID', async () => {
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          user_id: testUser.id,
          total: testProduct.price,
          status: 'pending',
          shipping_address: '123 Test St, Test City',
          payment_method: 'Credit Card',
          items: [{ product_id: testProduct.id, quantity: 1, price: testProduct.price }],
        })
        .expect(201);
      const createdOrder = orderResponse.body;

      const response = await request(app.getHttpServer())
        .get(`/orders/${createdOrder.id}`)
        .expect(200);
      expect(response.body.id).toEqual(createdOrder.id);
    });

    it('/orders/:id (PUT) - should update an order', async () => {
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          user_id: testUser.id,
          total: testProduct.price,
          status: 'pending',
          shipping_address: '123 Test St, Test City',
          payment_method: 'Credit Card',
          items: [{ product_id: testProduct.id, quantity: 1, price: testProduct.price }],
        })
        .expect(201);
      const createdOrder = orderResponse.body;

      const updatedData = { status: 'shipped' };
      const response = await request(app.getHttpServer())
        .put(`/orders/${createdOrder.id}`)
        .send(updatedData)
        .expect(200);
      expect(response.body.status).toEqual(updatedData.status);
    });

    it('/orders/:id (DELETE) - should delete an order', async () => {
      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .send({
          user_id: testUser.id,
          total: testProduct.price,
          status: 'pending',
          shipping_address: '123 Test St, Test City',
          payment_method: 'Credit Card',
          items: [{ product_id: testProduct.id, quantity: 1, price: testProduct.price }],
        })
        .expect(201);
      const createdOrder = orderResponse.body;

      await request(app.getHttpServer())
        .delete(`/orders/${createdOrder.id}`)
        .expect(204);
    });
  });
});