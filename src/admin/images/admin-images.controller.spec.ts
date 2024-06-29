import { Test, TestingModule } from '@nestjs/testing';
import { AdminImagesController } from './admin-images.controller.js';

describe('UploadController', () => {
  let controller: AdminImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminImagesController],
    }).compile();

    controller = module.get<AdminImagesController>(AdminImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
