import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from './../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    // Clear the users table before tests
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');

    // Create a test user directly in the database
    testUser = await userRepository.save(userRepository.create({
      username: 'testuser_user_service',
      email: 'test_user_service@example.com',
      password: 'hashedpassword', // Password is not used by user-service directly
      first_name: 'Test',
      last_name: 'User',
      user_type: 'individual',
      verified: true,
    }));
  });

  afterAll(async () => {
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'); // Clean up users table
    await app.close();
  });

  it('/users/:id (GET) - should return a user by ID', () => {
    return request(app.getHttpServer())
      .get(`/users/${testUser.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(testUser.id);
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body.password).toBeUndefined(); // Password should not be returned
      });
  });

  it('/users/email/:email (GET) - should return a user by email', () => {
    return request(app.getHttpServer())
      .get(`/users/email/${testUser.email}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(testUser.id);
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body.password).toBeUndefined();
      });
  });

  it('/users/:id (PUT) - should update a user', () => {
    const updatedData = {
      bio: 'Updated bio for test user',
      location: 'Test City',
    };
    return request(app.getHttpServer())
      .put(`/users/${testUser.id}`)
      .send(updatedData)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(testUser.id);
        expect(res.body.bio).toEqual(updatedData.bio);
        expect(res.body.location).toEqual(updatedData.location);
      });
  });

  it('/users (GET) - should return all users', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].id).toBeDefined();
  });

  it('/users/:id (GET) - should return 404 for non-existent user', () => {
    return request(app.getHttpServer())
      .get('/users/99999999-9999-9999-9999-999999999999') // Non-existent UUID
      .expect(404);
  });

  it('/users/email/:email (GET) - should return 404 for non-existent email', () => {
    return request(app.getHttpServer())
      .get('/users/email/nonexistent@example.com')
      .expect(404);
  });
});