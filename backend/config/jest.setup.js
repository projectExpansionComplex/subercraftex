const mongoose = require('mongoose');

// Connect to the test database before running tests
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/ecommerce-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clean up the database after each test
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});
