import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class AddProductToCartDto {
  @IsUUID()
  product_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemQuantityDto {
  @IsNumber()
  @Min(0)
  quantity: number;
}
