import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'BRAND_ID') return 'test-brand-id';
              if (key === 'API_KEY') return 'test-brand-id';
              if (key === 'S2S_TOKEN') return 'test-brand-id';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});