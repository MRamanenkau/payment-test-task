import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class Data3Ds {
  @IsNotEmpty({ message: 'PaReq is required' })
  @IsString({ message: 'PaReq must be a string' })
  PaReq: string;

  @IsNotEmpty({ message: 'MD is required' })
  @IsString({ message: 'MD must be a string' })
  MD: string;

  @IsNotEmpty({ message: 'TermUrl is required' })
  @IsUrl({}, { message: 'TermUrl must be a valid URL' })
  TermUrl: string;

  @IsNotEmpty({ message: 'Method is required' })
  @IsString({ message: 'Method must be a string' })
  method: string;

  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url: string;
}

export interface ProcessPurchaseResponse {
  status: string;
  Method?: string;
  URL?: string;
  PaReq?: string;
  MD?: string;
  callback_url?: string;
}

export interface CreatePurchaseResponse {
  id: string;
  direct_post_url: string;
  checkout_url: string;
  status: string;
}