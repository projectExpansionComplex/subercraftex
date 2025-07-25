import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../review/review.entity';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private productImageRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariant) private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(Review) private reviewRepository: Repository<Review>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    console.log('CreateProductDto received:', createProductDto);
    const { images, variants, category_id, designer_id, ...productData } = createProductDto;

    const category = await this.categoryRepository.findOneBy({ id: category_id });
    console.log('Fetched Category:', category);
    if (!category) {
      throw new NotFoundException(`Category with ID ${category_id} not found`);
    }

    const designer = await this.userRepository.findOneBy({ id: designer_id });
    console.log('Fetched Designer:', designer);
    if (!designer) {
      throw new NotFoundException(`Designer with ID ${designer_id} not found`);
    }

    const newProduct = this.productRepository.create({
      ...productData,
      category,
      designer,
    });
    console.log('New Product entity created:', newProduct);
    const savedProduct = await this.productRepository.save(newProduct);
    console.log('Product saved:', savedProduct);

    if (images && images.length > 0) {
      const productImages = images.map(imageUrl => this.productImageRepository.create({ product: savedProduct, image_url: imageUrl }));
      console.log('Product Images to save:', productImages);
      await this.productImageRepository.save(productImages);
    }

    if (variants && variants.length > 0) {
      const productVariants = variants.map(variant => this.productVariantRepository.create({ product: savedProduct, ...variant }));
      console.log('Product Variants to save:', productVariants);
      await this.productVariantRepository.save(productVariants);
    }

    return this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['images', 'variants'],
    }) as Promise<Product>;
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'designer', 'images', 'variants', 'reviews'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'designer', 'images', 'variants', 'reviews'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const { images, variants, ...productData } = updateProductDto;

    Object.assign(product, productData);

    const savedProduct = await this.productRepository.save(product);

    if (images !== undefined) {
      await this.productImageRepository.delete({ product: savedProduct });
      if (images.length > 0) {
        const productImages = images.map(imageUrl => this.productImageRepository.create({ product: savedProduct, image_url: imageUrl }));
        await this.productImageRepository.save(productImages);
      }
    }

    if (variants !== undefined) {
      await this.productVariantRepository.delete({ product: savedProduct });
      if (variants.length > 0) {
        const productVariants = variants.map(variant => this.productVariantRepository.create({ product: savedProduct, ...variant }));
        await this.productVariantRepository.save(productVariants);
      }
    }

    return savedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}