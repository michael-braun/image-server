import { Controller, Get, Post, UseGuards, Headers, Req, Body } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from "../../auth/roles/roles.decorator.js";
import { Role } from "../../auth/roles/role.enum.js";
import { AuthGuard } from "../../auth/auth.guard.js";
import { AdminImagesService } from "./admin-images.service.js";
import { Image } from "../../database/entities/image.entity.js";

@Controller('admin/images')
export class AdminImagesController {
  constructor(private readonly adminImagesService: AdminImagesService) {
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.manage_images)
  public async getHello(): Promise<Array<Image>> {
    const images = await this.adminImagesService.list();

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
