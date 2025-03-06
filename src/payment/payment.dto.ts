import { IsNotEmpty, IsNumber, IsString, Min, MaxLength, Matches, ValidateNested, IsBoolean, IsInt, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class Product {
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString({ message: 'Product name must be a string' })
  @MaxLength(255, { message: 'Product name must not exceed 255 characters' })
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
  @MaxLength(45, { message: 'Cardholder name must not exceed 45 characters' })
  @Matches(/^[A-Za-z\s'.-]+$/, { message: 'Cardholder name must contain only Latin letters, spaces, apostrophes, dots, or dashes' })
  cardholder_name: string;

  @IsNotEmpty({ message: 'Card number is required' })
  @IsString({ message: 'Card number must be a string' })
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits with no whitespace' })
  card_number: string;

  @IsNotEmpty({ message: 'Expiration date is required' })
  @IsString({ message: 'Expiration date must be a string' })
  @Matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
    message: 'Expiration date must be in MM/YY format (e.g., 12/25)',
  })
  @MaxLength(5, { message: 'Expiration date must not exceed 5 characters' })
  expires: string;

  @IsNotEmpty({ message: 'Security code is required' })
  @IsString({ message: 'Security code must be a string' })
  @Matches(/^\d{3,4}$/, { message: 'Security code must be 3 or 4 digits' })
  cvc: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be a string' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description: string;

  @IsNotEmpty({ message: 'Products are required' })
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Product[];

  @IsNotEmpty({ message: 'Color depth is required' })
  @IsInt({ message: 'Color depth must be an integer' })
  @Min(0, { message: 'Color depth must be at least 0' })
  @Max(255, { message: 'Color depth must not exceed 255' })
  color_depth: number;

  @IsNotEmpty({ message: 'Javascript enabled status is required' })
  @IsBoolean({ message: 'Javascript enabled must be a boolean' })
  javascript_enabled: boolean;

  @IsNotEmpty({ message: 'Language is required' })
  @IsString({ message: 'Language must be a string' })
  @MaxLength(8, { message: 'Language must not exceed 8 characters' })
  language: string;

  @IsNotEmpty({ message: 'Remember card is required' })
  @IsString({ message: 'Remember card must be a string' })
  remember_card: string;

  @IsNotEmpty({ message: 'Screen height is required' })
  @IsInt({ message: 'Screen height must be an integer' })
  @Min(0, { message: 'Screen height must be at least 0' })
  screen_height: number;

  @IsNotEmpty({ message: 'Screen width is required' })
  @IsInt({ message: 'Screen width must be an integer' })
  @Min(0, { message: 'Screen width must be at least 0' })
  screen_width: number;

  @IsNotEmpty({ message: 'User agent is required' })
  @IsString({ message: 'User agent must be a string' })
  @MaxLength(2048, { message: 'User agent must not exceed 2048 characters' })
  user_agent: string;

  @IsNotEmpty({ message: 'UTC offset is required' })
  @IsInt({ message: 'UTC offset must be an integer' })
  @Min(-32768, { message: 'UTC offset must be at least -32,768' })
  @Max(32767, { message: 'UTC offset must not exceed 32,767' })
  utc_offset: number;
}