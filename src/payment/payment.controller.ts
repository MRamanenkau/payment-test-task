import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './payment.dto';

@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const result = await this.paymentService.processPayment(createPaymentDto);
      return {
        status: 'success',
        ...result,
      };
    } catch (error) {
      throw error;
    }
  }
}