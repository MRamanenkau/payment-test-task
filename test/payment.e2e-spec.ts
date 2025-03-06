import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, HttpException, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PaymentService } from '../src/payment/payment.service';
import { CreatePaymentDto } from '../src/payment/payment.dto';
import { Data3Ds } from '../src/payment/purchaise.dto';

// Mock the Logger globally for tests
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

describe('PaymentController (e2e)', () => {
  let app: INestApplication;
  let paymentService: PaymentService;

  const mockPaymentService = {
    createPurchase: jest.fn(),
    processPurchase: jest.fn(),
    handle3ds: jest.fn(),
  };

  const validPaymentRequest: Partial<CreatePaymentDto> = {
    amount: 100,
    currency: 'USD',
    cardholder_name: 'John Doe',
    card_number: '5555555555554444',
    expires: '12/25',
    cvc: '123',
    email: 'user@test.com',
    description: 'Test payment',
    products: [{ name: 'Test Product', price: 100 }],
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124',
    language: 'en-US',
    javascript_enabled: true,
    color_depth: 24,
    utc_offset: -240,
    screen_width: 1920,
    screen_height: 1080,
    remember_card: 'off',
  };

  const valid3dsData: Data3Ds = {
    PaReq: 'test-pareq',
    MD: 'test-md',
    TermUrl: 'https://test.com/return',
    method: 'POST',
    url: 'https://acs.test.com',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PaymentService)
      .useValue(mockPaymentService)
      .compile();

    app = moduleFixture.createNestApplication();
    paymentService = moduleFixture.get<PaymentService>(PaymentService);
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    }));
    await app.listen(3001);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments', () => {
    it('should successfully create and process a payment', async () => {
      mockPaymentService.createPurchase.mockResolvedValue({
        id: 'purchase-123',
        checkout_url: 'https://checkout.example.com',
        direct_post_url: 'https://direct.post.url',
        status: 'created',
      });
      mockPaymentService.processPurchase.mockResolvedValue({
        status: '3DS_required',
        Method: 'POST',
        URL: 'https://acs.example.com',
        PaReq: 'test-pareq',
        MD: 'test-md',
        callback_url: 'https://callback.example.com',
      });

      const response = await request(app.getHttpServer())
        .post('/api/payments')
        .send(validPaymentRequest)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        status: '3DS_required',
        Method: 'POST',
        URL: 'https://acs.example.com',
        PaReq: 'test-pareq',
        MD: 'test-md',
        callback_url: 'https://callback.example.com',
      });
    });

    it('should handle validation errors', async () => {
      const invalidRequest = { ...validPaymentRequest, amount: -1 };

      const response = await request(app.getHttpServer())
        .post('/api/payments')
        .send(invalidRequest)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.arrayContaining(['Amount must be greater than 0']),
      });
    });

    it('should handle generic service errors', async () => {
      mockPaymentService.createPurchase.mockRejectedValue(
        new Error('Payment gateway unavailable')
      );

      const response = await request(app.getHttpServer())
        .post('/api/payments')
        .send(validPaymentRequest)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });

    it('should handle specific HTTP exceptions from service', async () => {
      mockPaymentService.createPurchase.mockRejectedValue(
        new HttpException('Payment gateway timeout', HttpStatus.GATEWAY_TIMEOUT)
      );

      const response = await request(app.getHttpServer())
        .post('/api/payments')
        .send(validPaymentRequest)
        .expect(HttpStatus.GATEWAY_TIMEOUT);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.GATEWAY_TIMEOUT,
        message: 'Payment gateway timeout',
      });
    });
  });

  describe('POST /api/payments/proxy-3ds', () => {
    it('should successfully process 3DS request', async () => {
      mockPaymentService.handle3ds.mockResolvedValue(
        '<html>3DS response</html>'
      );

      const response = await request(app.getHttpServer())
        .post('/api/payments/proxy-3ds')
        .send(valid3dsData)
        .expect(HttpStatus.OK);

      expect(response.text).toBe('<html>3DS response</html>');
    });

    it('should handle invalid 3DS data', async () => {
      const invalid3dsData = {
        PaReq: '',
        MD: 'test-md',
        TermUrl: 'not-a-url',
        method: '',
        url: 'not-a-url'
      };

      const response = await request(app.getHttpServer())
        .post('/api/payments/proxy-3ds')
        .send(invalid3dsData)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.BAD_REQUEST,
        message: expect.arrayContaining([
          'PaReq is required',
          'Method is required',
          'TermUrl must be a valid URL',
          'URL must be a valid URL'
        ]),
      });
    });

    it('should handle generic 3DS processing errors', async () => {
      mockPaymentService.handle3ds.mockRejectedValue(
        new Error('3DS processing failed')
      );

      const response = await request(app.getHttpServer())
        .post('/api/payments/proxy-3ds')
        .send(valid3dsData)
        .expect(HttpStatus.INTERNAL_SERVER_ERROR);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    });

    it('should handle specific 3DS authentication failures', async () => {
      mockPaymentService.handle3ds.mockRejectedValue(
        new HttpException('3DS authentication failed', HttpStatus.FORBIDDEN)
      );

      const response = await request(app.getHttpServer())
        .post('/api/payments/proxy-3ds')
        .send(valid3dsData)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body).toMatchObject({
        statusCode: HttpStatus.FORBIDDEN,
        message: '3DS authentication failed',
      });
    });
  });
});