import { Test, TestingModule } from '@nestjs/testing';
import { CheckpointsService } from './checkpoints.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CheckpointsService', () => {
  let service: CheckpointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckpointsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CheckpointsService>(CheckpointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
