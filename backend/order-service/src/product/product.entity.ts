import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { User } from '../user/user.entity'; // Assuming User entity will be shared or replicated
import { ProductImage } from './product-image.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../review/review.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Category, category => category.products, { cascade: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  thumbnail: string;

  @ManyToOne(() => User, { cascade: true }) // Assuming User entity will be available or imported
  @JoinColumn({ name: 'designer_id' })
  designer: User;

  @Column()
  stock: number;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ default: 0 })
  sales_count: number;

  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0 })
  average_rating: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  materials: string[];

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  dimensions_length: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  dimensions_width: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  dimensions_height: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  weight: number;

  @Column({ nullable: true })
  country_of_origin: string;

  @Column({ nullable: true })
  sustainability_metrics_id: string; // Assuming this will be a foreign key to a SustainabilityMetrics entity

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => ProductImage, productImage => productImage.product, { eager: true, cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, productVariant => productVariant.product, { eager: true, cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];
}
