import { Controller, Post, Body, HttpStatus, HttpCode, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './payment.dto';
import { Data3Ds } from "./purchaise.dto";

@Controller('api/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log('Starting payment creation process');

    try {
      this.logger.debug('Creating purchase with data:', createPaymentDto);
      const purchase = await this.paymentService.createPurchase(createPaymentDto);

      this.logger.debug('Processing purchase:', purchase);
      const result = await this.paymentService.processPurchase(purchase, createPaymentDto);

      this.logger.log('Payment processed successfully');
      return result;
    } catch (error) {
      this.logger.error('Payment processing failed', error.stack);
      throw error;
    }
  }

  @Post('proxy-3ds')
  @HttpCode(HttpStatus.OK)
  async proxy3ds(@Body() data3Ds: Data3Ds) {
    this.logger.log('Starting 3DS proxy process');

    try {
      this.logger.debug('Processing 3DS data:', data3Ds);
      const result = await this.paymentService.handle3ds(data3Ds);

      this.logger.log('3DS processing completed successfully');
      return result;
    } catch (error) {
      this.logger.error('3DS processing failed', error.stack);
      throw error;
    }
  }
}