import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from "../../auth/roles/roles.decorator.js";
import { Role } from "../../auth/roles/role.enum.js";
import { AuthGuard } from "../../auth/auth.guard.js";

@Controller('admin/upload')
export class UploadController {
  @Get()
  @UseGuards(AuthGuard)
  @Roles(Role.manage_images)
  getHello(): string {
    return 'hello Upload';
  }
}
