import { Module } from '@nestjs/common';
import { AdminImagesController } from './admin-images.controller.js';
import { AdminImagesService } from './admin-images.service.js';
import { Image } from "../../database/entities/image.entity.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Slug } from "../../database/entities/slug.entity.js";
import { ImageModule } from "../../image/image.module.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    TypeOrmModule.forFeature([Slug]),
    ImageModule,
  ],
  controllers: [AdminImagesController],
  providers: [AdminImagesService]
})
export class AdminImagesModule {}
