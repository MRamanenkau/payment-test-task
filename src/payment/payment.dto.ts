import { IsNotEmpty, IsNumber, IsString, Min, MaxLength, Matches } from 'class-validator';

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
  cardholderName: string;

  @IsNotEmpty({ message: 'Card number is required' })
  @IsString({ message: 'Card number must be a string' })
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits' })
  cardNumber: string;

  @IsNotEmpty({ message: 'Expiration date is required' })
  @IsString({ message: 'Expiration date must be a string' })
  @Matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, {
    message: 'Expiration date must be in MM/YY format (e.g., 12/25)',
  })
  expirationDate: string;

  @IsNotEmpty({ message: 'Security code is required' })
  @IsString({ message: 'Security code must be a string' })
  @Matches(/^\d{3,4}$/, { message: 'Security code must be 3 or 4 digits' })
  securityCode: string;
}