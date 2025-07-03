const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect('mongodb+srv://subercraftex:subercraftexpass@cluster0.2a7nq.mongodb.net/ecommerce-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});