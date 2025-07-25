import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from './../src/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe()); // Apply global pipes for e2e tests
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await userRepository.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;'); // Clean up users table
    await app.close();
  });

  it('/auth/register (POST) - should register a new user', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    };
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.username).toEqual(userData.username);
        expect(res.body.email).toEqual(userData.email);
        expect(res.body.password).toBeUndefined(); // Password should not be returned
      });
  });

  it('/auth/login (POST) - should login an existing user', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.access_token).toBeDefined();
  });

  it('/auth/register (POST) - should not register with existing email', () => {
    const userData = {
      username: 'anotheruser',
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Another',
      last_name: 'User',
    };
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userData)
      .expect(409); // Conflict
  });

  it('/auth/login (POST) - should not login with invalid credentials', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginData)
      .expect(401); // Unauthorized
  });
});