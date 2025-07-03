const request = require('supertest');
const app = require('../src/server');
const Wishlist = require('../models/wishlistModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

describe('Wishlist Routes', () => {
  let user;
  let product;

  beforeEach(async () => {
    user = await User.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      user_type: 'individual'
    });

    product = await Product.create({
      name: 'Test Product',
      price: 100,
      description: 'This is a test product.',
    });
  });

  afterEach(async () => {
    await Wishlist.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  describe('POST /api/wishlist', () => {
    it('should add a product to the wishlist', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .send({
          userId: user._id,
          productId: product._id,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Product added to wishlist successfully');
    });
  });

  describe('GET /api/wishlist/:userId', () => {
    it('should get the wishlist for a user', async () => {
      await Wishlist.create({
        user: user._id,
        products: [product._id],
      });

      const res = await request(app).get(`/api/wishlist/${user._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.products.length).toEqual(1);
      expect(res.body.products[0].name).toEqual('Test Product');
    });
  });

  describe('DELETE /api/wishlist', () => {
    it('should remove a product from the wishlist', async () => {
      await Wishlist.create({
        user: user._id,
        products: [product._id],
      });

      const res = await request(app)
        .delete('/api/wishlist')
        .send({
          userId: user._id,
          productId: product._id,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product removed from wishlist successfully');
    });
  });
});
