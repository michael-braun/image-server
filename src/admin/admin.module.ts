import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module.js';

@Module({
  imports: [UploadModule]
})
export class AdminModule {}
