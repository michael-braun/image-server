import { Test, TestingModule } from '@nestjs/testing';
import { AdminImagesService } from './admin-images.service.js';

describe('UploadService', () => {
  let service: AdminImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminImagesService],
    }).compile();

    service = module.get<AdminImagesService>(AdminImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
