import { Controller, Get, Post, UseGuards, Headers, Req, Body, Param, Query } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from "../../auth/roles/roles.decorator.js";
import { Role } from "../../auth/roles/role.enum.js";
import { AuthGuard } from "../../auth/auth.guard.js";
import { AdminImagesService } from "./admin-images.service.js";
import { Image } from "../../database/entities/image.entity.js";
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Slug } from "../../database/entities/slug.entity.js";
import { Repository } from "typeorm";
import { ImageDto } from "../../models/image.model.js";

@ApiTags('admin')
@Controller({
  path: 'admin/images',
  version: '1',
})
@ApiBearerAuth()
export class AdminImagesController {
  constructor(
    private readonly adminImagesService: AdminImagesService,
    @InjectRepository(Slug)
    private slugsRepository: Repository<Slug>,
  ) {
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.manage_images)
  @ApiQuery({ name: 'embed', type: [String], isArray: true, required: false })
  public async getImages(
    @Query('embed') embed: Array<string>,
  ): Promise<Array<Image>> {
    const images = await this.adminImagesService.list() as Array<ImageDto>;

    if (embed?.includes('slugs')) {
      await Promise.all(images.map(async (image) => {
        const slugs = await this.slugsRepository.find({
          where: {
            image: image.id as unknown,
          },
        });

        image.slugs = slugs.map((slug) => ({
          slug: slug.slug,
        }));
      }));
    }

    return images;
  }

  @Post('/_actions/upload')
  @UseGuards(AuthGuard)
  @Roles(Role.manage_images)
  async createImage(@Headers() headers: Record<string, string | undefined>, @Req() request: Request) {
    const path = headers['x-path'] || headers['x-filename'];

    return await this.adminImagesService.upload(request, {
      path,
    });
  }
}
