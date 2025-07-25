import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, IsUrl, ValidateNested, IsBoolean, IsUUID, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUUID()
  category_id: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  thumbnail: string;

  @IsArray()
  @IsUrl()
  images: string[];

  @IsUUID()
  designer_id: string;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sales_count?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_length?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  country_of_origin?: string;

  @IsOptional()
  @IsUUID()
  sustainability_metrics_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsUrl()
  images?: string[];

  @IsOptional()
  @IsUUID()
  designer_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sales_count?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_length?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_width?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dimensions_height?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  country_of_origin?: string;

  @IsOptional()
  @IsUUID()
  sustainability_metrics_id?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
