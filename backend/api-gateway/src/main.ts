import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Proxy for Auth Service
  app.use('/auth', createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL, 
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '/auth',
    },
  }));

  // Proxy for User Service
  app.use('/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/users': '/users',
    },
  }));

  // Proxy for Product Service
  app.use('/products', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/products': '/products',
    },
  }));

  // Proxy for Category Service (part of Product Service)
  app.use('/categories', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/categories': '/categories',
    },
  }));

  // Proxy for Review Service (part of Product Service)
  app.use('/reviews', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/reviews': '/reviews',
    },
  }));

  // Proxy for Order Service
  app.use('/orders', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/orders': '/orders',
    },
  }));

  // Proxy for Cart Service (part of Order Service)
  app.use('/carts', createProxyMiddleware({
    target: process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/carts': '/carts',
    },
  }));

  await app.listen(process.env.API_GATEWAY_PORT ?? 8000);
}
bootstrap();