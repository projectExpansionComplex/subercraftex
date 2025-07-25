import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { Category } from './../src/category/category.entity';
import { Product } from './../src/product/product.entity';
import { Review } from './../src/review/review.entity';
import { User } from './../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Product Service (e2e)', () => {
  let app: INestApplication;
  let categoryRepository: Repository<Category>;
  let productRepository: Repository<Product>;
  let reviewRepository: Repository<Review>;
  let userRepository: Repository<User>;

  let testCategory: Category;
  let testUser: User;
  let testProduct: Product;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // app.useGlobalPipes(new ValidationPipe({ transform: true })); // Temporarily disable validation pipe
    await app.init();

    categoryRepository = moduleFixture.get<Repository<Category>>(getRepositoryToken(Category));
    productRepository = moduleFixture.get<Repository<Product>>(getRepositoryToken(Product));
    reviewRepository = moduleFixture.get<Repository<Review>>(getRepositoryToken(Review));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // Clear tables before tests
    await reviewRepository.query('TRUNCATE TABLE reviews RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_variants RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
    await categoryRepository.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

    // Create test user and category
    testUser = await userRepository.save(userRepository.create({
      username: 'designer_test',
      email: 'designer@example.com',
      password: 'hashedpassword', // Password is not used by user-service directly
      first_name: 'Test',
      last_name: 'User',
      user_type: 'individual',
      verified: true,
    }));

    testCategory = await categoryRepository.save(categoryRepository.create({
      name: 'Test Category',
      description: 'A category for testing',
      image_url: 'http://example.com/cat.jpg',
    }));
  });

  afterAll(async () => {
    // Clean up tables after all tests
    await reviewRepository.query('TRUNCATE TABLE reviews RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE product_variants RESTART IDENTITY CASCADE;');
    await productRepository.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE;');
    await categoryRepository.query('TRUNCATE TABLE categories RESTART IDENTITY CASCADE;');
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
    await app.close();
  });

  // Category Tests
  describe('CategoryController', () => {
    it('/categories (POST) - should create a category', () => {
      const categoryData = {
        name: 'New Category',
        description: 'Description for new category',
        image_url: 'http://example.com/new_cat.jpg',
      };
      return request(app.getHttpServer())
        .post('/categories')
        .send(categoryData)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toEqual(categoryData.name);
        });
    });

    it('/categories (GET) - should return all categories', async () => {
      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/categories/:id (GET) - should return a category by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/${testCategory.id}`)
        .expect(200);
      expect(response.body.id).toEqual(testCategory.id);
    });

    it('/categories/:id (PUT) - should update a category', () => {
      const updatedData = { name: 'Updated Category Name' };
      return request(app.getHttpServer())
        .put(`/categories/${testCategory.id}`)
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toEqual(updatedData.name);
        });
    });

    it('/categories/:id (DELETE) - should delete a category', async () => {
      const categoryToDelete = await categoryRepository.save(categoryRepository.create({
        name: 'Category to Delete',
        description: 'Temp',
        image_url: 'http://example.com/del.jpg',
      }));
      return request(app.getHttpServer())
        .delete(`/categories/${categoryToDelete.id}`)
        .expect(204);
    });
  });

  // Product Tests
  describe('ProductController', () => {
    it('/products (POST) - should create a product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A product for testing',
        price: 99.99,
        category_id: testCategory.id,
        thumbnail: 'http://example.com/thumb.jpg',
        images: ['http://example.com/img1.jpg', 'http://example.com/img2.jpg'],
        designer_id: testUser.id,
        stock: 10,
        tags: ['test', 'example'],
        variants: [
          { name: 'Small', price: 90.00, stock: 5 },
          { name: 'Large', price: 110.00, stock: 5 },
        ],
      };
      const response = await request(app.getHttpServer())
        .post('/products')
        .send(productData)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toEqual(productData.name);
      expect(response.body.images.length).toBe(2);
      expect(response.body.variants.length).toBe(2);
      testProduct = response.body; // Save for later tests
    });

    it('/products (GET) - should return all products', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .expect(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/products/:id (GET) - should return a product by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${testProduct.id}`)
        .expect(200);
      expect(response.body.id).toEqual(testProduct.id);
      expect(response.body.images).toBeInstanceOf(Array);
      expect(response.body.variants).toBeInstanceOf(Array);
    });

    it('/products/:id (PUT) - should update a product', () => {
      const updatedData = { price: 105.00, stock: 12 };
      return request(app.getHttpServer())
        .put(`/products/${testProduct.id}`)
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toEqual(updatedData.price);
          expect(res.body.stock).toEqual(updatedData.stock);
        });
    });

    it('/products/:id (DELETE) - should delete a product', async () => {
      const productToDelete = await productRepository.save(productRepository.create({
        name: 'Product to Delete',
        description: 'Temp',
        price: 10,
        category: testCategory,
        thumbnail: 'http://example.com/del.jpg',
        images: [],
        designer: testUser,
        stock: 1,
      }));
      return request(app.getHttpServer())
        .delete(`/products/${productToDelete.id}`)
        .expect(204);
    });
  });

  // Review Tests
  describe('ReviewController', () => {
    it('/reviews (POST) - should create a review', () => {
      const reviewData = {
        rating: 5,
        comment: 'Great product!',
        product_id: testProduct.id,
        user_id: testUser.id,
      };
      return request(app.getHttpServer())
        .post('/reviews')
        .send(reviewData)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.rating).toEqual(reviewData.rating);
        });
    });

    it('/reviews (GET) - should return all reviews', async () => {
      const response = await request(app.getHttpServer())
        .get('/reviews')
        .expect(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/reviews/:id (GET) - should return a review by ID', async () => {
      const createdReview = await reviewRepository.findOne({ where: { product: { id: testProduct.id } } });
      if (!createdReview) throw new Error('Review not found for test');
      const response = await request(app.getHttpServer())
        .get(`/reviews/${createdReview.id}`)
        .expect(200);
      expect(response.body.id).toEqual(createdReview.id);
    });

    it('/reviews/:id (PUT) - should update a review', async () => {
      const createdReview = await reviewRepository.findOne({ where: { product: { id: testProduct.id } } });
      if (!createdReview) throw new Error('Review not found for test');
      const updatedData = { comment: 'Even better now!' };
      return request(app.getHttpServer())
        .put(`/reviews/${createdReview.id}`)
        .send(updatedData)
        .expect(200)
        .expect((res) => {
          expect(res.body.comment).toEqual(updatedData.comment);
        });
    });

    it('/reviews/:id (DELETE) - should delete a review', async () => {
      const reviewToDelete = await reviewRepository.save(reviewRepository.create({
        rating: 1,
        comment: 'Bad product',
        product: testProduct,
        user: testUser,
      }));
      return request(app.getHttpServer())
        .delete(`/reviews/${reviewToDelete.id}`)
        .expect(204);
    });
  });
});