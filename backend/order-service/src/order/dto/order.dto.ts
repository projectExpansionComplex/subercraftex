import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, IsUUID, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  product_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateOrderDto {
  @IsUUID()
  user_id: string;

  @IsNumber()
  @Min(0)
  total: number;

  @IsEnum(['pending', 'shipped', 'delivered', 'cancelled'])
  status: string;

  @IsString()
  @IsNotEmpty()
  shipping_address: string;

  @IsString()
  @IsNotEmpty()
  payment_method: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class UpdateOrderDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsEnum(['pending', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shipping_address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  payment_method?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
