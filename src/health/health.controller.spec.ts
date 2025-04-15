import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthResult: HealthCheckResult = {
    status: 'ok',
    info: {
      api: {
        status: 'up',
      },
    },
    error: {},
    details: {
      api: {
        status: 'up',
      },
    },
  };

  const mockHealthCheckService = {
    check: jest.fn().mockResolvedValue(mockHealthResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: mockHealthCheckService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should return health status', async () => {
    const result = await controller.check();
    expect(result).toEqual(mockHealthResult);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(healthCheckService.check).toHaveBeenCalled();
  });
});
