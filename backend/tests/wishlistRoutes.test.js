const request = require('supertest');
const app = require('../index');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Wishlist = require('../models/wishlistModel');

describe('Wishlist Routes', () => {
  let userToken;

  beforeAll(async () => {
    const user = await User.create({
      name: 'admin',
      email: 'msiysinyuy@gmail.com',
      password: 'msb1@@@@',
    });

    // Simulate user login to get a token
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'msiysinyuy@gmail.com',
      password: 'msb1@@@@',
      });

    userToken = res.body.token;
  });

  it('should add a product to the wishlist', async () => {
    const product = await Product.create({
      name: 'Test Product',
      description: 'A product description',
      price: 100,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const res = await request(app)
      .post('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: product._id,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.products.length).toEqual(1);
  });

  it('should fetch the user’s wishlist', async () => {
    const res = await request(app)
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('should remove a product from the wishlist', async () => {
    const product = await Product.create({
      name: 'Test Product',
      description: 'A product description',
      price: 100,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const wishlist = await Wishlist.findOne({ user: '60b6c55bfc13ae1f8b000001' }); // Replace with a valid user ID

    wishlist.products.push(product._id);
    await wishlist.save();

    const res = await request(app)
      .delete('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        productId: product._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.products.length).toEqual(0);
  });
});
