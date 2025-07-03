const request = require('supertest');
const app = require('../src/server');
const Wishlist = require('../models/wishlistModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { globalToken, globalUser } = require('../config/jest.setup');

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
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          userId: globalUser._id,
          productId: product._id,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Product added to wishlist successfully');
    }, 30000);
  });

  describe('GET /api/wishlist/:userId', () => {
    it('should get the wishlist for a user', async () => {
      await Wishlist.create({
        user: globalUser._id,
        products: [product._id],
      });

      const res = await request(app)
        .get(`/api/wishlist/${globalUser._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.products.length).toEqual(1);
      expect(res.body.products[0].name).toEqual('Test Product');
    }, 30000);
  });

  describe('DELETE /api/wishlist', () => {
    it('should remove a product from the wishlist', async () => {
      await Wishlist.create({
        user: globalUser._id,
        products: [product._id],
      });

      const res = await request(app)
        .delete('/api/wishlist')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          userId: globalUser._id,
          productId: product._id,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product removed from wishlist successfully');
    }, 30000);
  });
});
