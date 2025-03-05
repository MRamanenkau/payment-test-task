import { IsNotEmpty, IsNumber, IsString, Min, MaxLength, Matches, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class Product {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  name: string;

  @IsNotEmpty({ message: 'Product price is required' })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Product price must be a valid number' })
  @Min(0, { message: 'Product price must be greater than or equal to 0' })
  price: number;
}

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'Amount must be a valid number' })
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsNotEmpty({ message: 'Currency is required' })
  @IsString({ message: 'Currency must be a string' })
  @MaxLength(3, { message: 'Currency code must be 3 characters or less' })
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a valid 3-letter ISO code (e.g., EUR, USD)' })
  currency: string;

  @IsNotEmpty({ message: 'Cardholder name is required' })
  @IsString({ message: 'Cardholder name must be a string' })
  @MaxLength(100, { message: 'Cardholder name must not exceed 100 characters' })
  cardholder_name: string;

  @IsNotEmpty({ message: 'Card number is required' })
  @IsString({ message: 'Card number must be a string' })
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits' })
  card_number: string;

  @IsNotEmpty({ message: 'Expiration date is required' })
  @IsString({ message: 'Expiration date must be a string' })
  @Matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
    message: 'Expiration date must be in MM/YY format (e.g., 12/25)',
  })
  expires: string;

  @IsNotEmpty({ message: 'Security code is required' })
  @IsString({ message: 'Security code must be a string' })
  @Matches(/^\d{3,4}$/, { message: 'Security code must be 3 or 4 digits' })
  cvc: string;

  @IsOptional()
  @IsString({ message: 'Email must be a string' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsArray({ message: 'Products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Product[];

  @IsOptional()
  @IsNumber({}, { message: 'Color depth must be a number' })
  color_depth: number;

  @IsNotEmpty({ message: 'Javascript enabled status is required' })
  javascript_enabled: boolean;

  @IsString({ message: 'Language must be a string' })
  language: string;

  @IsString({ message: 'Remember card must be a string' })
  remember_card: string;

  @IsNumber({}, { message: 'Screen height must be a number' })
  screen_height: number;

  @IsNumber({}, { message: 'Screen width must be a number' })
  screen_width: number;

  @IsString({ message: 'User agent must be a string' })
  user_agent: string;

  @IsNumber({}, { message: 'UTC offset must be a number' })
  utc_offset: number;
}