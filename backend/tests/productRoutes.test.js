const request = require('supertest');
const app = require('../src/server'); // The main app file
const Product = require('../models/productModel');

describe('Product Routes', () => {
  it('should create a new product', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({
        name: 'Test Product',
        description: 'A product description',
        price: 100,
        category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Test Product');
  });

  it('should fetch all products', async () => {
    await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 50,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a single product by ID', async () => {
    const product = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 50,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Product 1');
  });

  it('should update a product', async () => {
    const product = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 50,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .send({ price: 60 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('price', 60);
  });

  it('should delete a product', async () => {
    const product = await Product.create({
      name: 'Product 1',
      description: 'Description 1',
      price: 50,
      category: '60b6c55bfc13ae1f8b000001', // Replace with a valid category ID
    });

    const res = await request(app).delete(`/api/products/${product._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Product deleted successfully');
  });
});
