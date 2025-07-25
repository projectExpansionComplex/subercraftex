import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module'; // Import UserModule
import config from '../ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    ProductModule,
    CategoryModule,
    ReviewModule,
    UserModule, // Add UserModule to imports
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
