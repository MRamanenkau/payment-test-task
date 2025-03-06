import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { CreatePaymentDto } from './payment.dto';
import { CreatePurchaseResponse, ProcessPurchaseResponse } from './purchaise.dto';
import { maskSensitiveData } from '../utils';

interface ExternalApiError {
  message: string;
  [key: string]: any;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly apiUrl = 'https://gate.libernetix.com/api/v1/purchases/';
  private readonly brandId: string;
  private readonly apiKey: string;
  private readonly s2sToken: string;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.brandId = this.getRequiredConfig('BRAND_ID');
    this.apiKey = this.getRequiredConfig('API_KEY');
    this.s2sToken = this.getRequiredConfig('S2S_TOKEN');

    this.logger.log('PaymentService initialized with configuration');
    this.logger.debug('Loaded config:', {
      brandId: this.brandId,
      apiKey: this.apiKey.slice(0, 10) + '...',
      s2sToken: this.s2sToken.slice(0, 10) + '...'
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      this.logger.error(`Missing required configuration: ${key}`);
      throw new Error(`Configuration error: ${key} is required but not provided`);
    }
    return value;
  }

  async createPurchase(createPaymentDto: CreatePaymentDto): Promise<CreatePurchaseResponse> {
    this.logger.log('Starting purchase creation');

    try {
      const payload = {
        client: {
          email: createPaymentDto.email,
          client_type: null,
          delivery_methods: [{
            method: 'email',
            options: {}
          }]
        },
        payment: {
          amount: createPaymentDto.amount,
          currency: createPaymentDto.currency,
          description: createPaymentDto.description,
        },
        purchase: {
          currency: createPaymentDto.currency,
          products: createPaymentDto.products,
          language: 'en',
          timezone: 'UTC'
        },
        brand_id: this.brandId,
        success_redirect: "https://webhook.site/#!/view/5edfde1e-2d62-45eb-a5a6-82926b8452e5/dce38df5-ab9e-4f54-b80b-8fb6925cc553/1",
        failure_redirect: "https://webhook.site/#!/view/5edfde1e-2d62-45eb-a5a6-82926b8452e5/dce38df5-ab9e-4f54-b80b-8fb6925cc553/1",
      };

      this.logger.debug('Sending purchase request with payload:', maskSensitiveData(payload));
      const response: AxiosResponse = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.debug('Received purchase response:', maskSensitiveData(response.data));
      if (response.status === 200 || response.status === 201) {
        const result: CreatePurchaseResponse = {
          id: response.data.id,
          checkout_url: response.data.checkout_url,
          direct_post_url: response.data.direct_post_url,
          status: response.data.status,
        };
        this.logger.log('Purchase created successfully');
        return result;
      }

      throw new HttpException('Purchase processing failed', HttpStatus.BAD_GATEWAY);
    } catch (error) {
      this.logger.error('Purchase creation failed', error);
      this.handleError(error, 'purchase creation');
    }
  }

  async processPurchase(purchase: CreatePurchaseResponse, createPaymentDto: CreatePaymentDto): Promise<ProcessPurchaseResponse> {
    this.logger.log('Starting purchase processing');

    try {
      const paymentUrl = `${purchase.direct_post_url}?s2s=true`;
      const paymentPayload = {
        cardholder_name: createPaymentDto.cardholder_name,
        card_number: createPaymentDto.card_number,
        expires: createPaymentDto.expires,
        cvc: createPaymentDto.cvc,
        remember_card: createPaymentDto.remember_card,
        remote_ip: "8.8.8.8",
        user_agent: createPaymentDto.user_agent,
        accept_header: "text/html",
        language: createPaymentDto.language,
        java_enabled: false,
        javascript_enabled: createPaymentDto.javascript_enabled,
        color_depth: createPaymentDto.color_depth,
        utc_offset: createPaymentDto.utc_offset,
        screen_width: createPaymentDto.screen_width,
        screen_height: createPaymentDto.screen_height
      };

      this.logger.debug('Processing payment with payload:', maskSensitiveData(paymentPayload));
      const paymentResponse: AxiosResponse = await axios.post(paymentUrl, paymentPayload, {
        headers: {
          'Authorization': `Bearer ${this.s2sToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.debug('Received payment response:', maskSensitiveData(paymentResponse.data));
      if (paymentResponse.status === 200 || paymentResponse.status === 201) {
        this.logger.log('Purchase processed successfully');
        return paymentResponse.data;
      }

      throw new HttpException('Payment processing failed', HttpStatus.BAD_GATEWAY);
    } catch (error) {
      this.logger.error('Purchase processing failed', error);
      this.handleError(error, 'purchase processing');
    }
  }

  async handle3ds(data3Ds): Promise<string> {
    this.logger.log('Starting 3DS handling');

    try {
      const { PaReq, MD, TermUrl, method, url } = data3Ds;
      this.logger.debug('Processing 3DS request with data:', maskSensitiveData(data3Ds));

      const response = await axios[method](
        url,
        `PaReq=${encodeURIComponent(PaReq)}&MD=${encodeURIComponent(MD)}&TermUrl=${encodeURIComponent(TermUrl)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'text',
        },
      );

      this.logger.debug('Received 3DS response');
      this.logger.log('3DS handling completed successfully');
      return response.data;
    } catch (error) {
      this.logger.error('3DS handling failed', error);
      throw new Error('Failed to process 3D Secure request');
    }
  }

  private handleError(error: any, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ExternalApiError>;
      if (axiosError.response) {
        this.logger.warn(`External API error in ${context}: ${axiosError.response.data?.message}`);
        throw new HttpException(
          `External API error: ${axiosError.response.data?.message || `${context} failed`}`,
          axiosError.response.status || HttpStatus.BAD_GATEWAY,
        );
      } else if (axiosError.request) {
        this.logger.warn(`Network error in ${context}: Unable to connect to gateway`);
        throw new HttpException(`Network error: Unable to connect to ${context} gateway`, HttpStatus.BAD_GATEWAY);
      } else {
        this.logger.error(`Internal error during ${context}`, error);
        throw new HttpException(`Internal error during ${context}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    this.logger.error(`Unexpected error during ${context}`, error);
    throw new HttpException(`Internal error during ${context}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}