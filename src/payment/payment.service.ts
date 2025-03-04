import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { CreatePaymentDto } from './payment.dto';

interface ExternalApiError {
  message: string;
  [key: string]: any;
}

@Injectable()
export class PaymentService {
  private readonly apiUrl = 'https://gate.liberanetix.com/api/v1/payments';
  private readonly brandId = process.env.BRAND_ID || '77ede2ab-d039-4894-8913-6acf29551825';
  private readonly apiKey = process.env.API_KEY || 'SdBpGfsOdz6rcPkIyaWXFICoN1RYnWGeLIUq8HOypu3Ne70RUx75TRFHzi0YTdN5mwJkORUkXMVyPmp0CQ==';
  private readonly s2sToken = process.env.S2S_TOKEN || 'bBZUqRrAADwW8gN8jXwCQNL3Awr3SNRkLDbT9YC3HqhcwAvHEy6FxLMNx56LQHBEtYf53hbJ';

  async processPayment(createPaymentDto: CreatePaymentDto): Promise<{ transactionId: string }> {
    try {
      const payload = {
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        cardholderName: createPaymentDto.cardholderName,
        cardNumber: createPaymentDto.cardNumber,
        expirationDate: createPaymentDto.expirationDate,
        securityCode: createPaymentDto.securityCode,
        brandId: this.brandId,
      };

      const response: AxiosResponse = await axios.post(this.apiUrl, payload, {
        headers: {
          'Authorization': `Bearer ${this.s2sToken}`,
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200 || response.status === 201) {
        return {
          transactionId: response.data.transactionId || 'txn_' + Math.random().toString(36).substr(2, 9), // Fallback if API doesn’t return a transaction ID
        };
      }

      throw new HttpException('Payment processing failed', HttpStatus.BAD_GATEWAY);
    } catch (error) {
      // Handle specific errors from the external API or network issues
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ExternalApiError>;
        if (axiosError.response) {
          // The request was made and the server responded with a status code outside 2xx
          throw new HttpException(
            `External API error: ${axiosError.response.data?.message || 'Payment processing failed'}`,
            axiosError.response.status || HttpStatus.BAD_GATEWAY,
          );
        } else if (axiosError.request) {
          // The request was made but no response was received
          throw new HttpException('Network error: Unable to connect to payment gateway', HttpStatus.BAD_GATEWAY);
        } else {
          // Something happened in setting up the request that triggered an error
          throw new HttpException('Internal error processing payment', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        // Non-Axios error (e.g., unexpected JavaScript error)
        throw new HttpException('Internal error processing payment', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}