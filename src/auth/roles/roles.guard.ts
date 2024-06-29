import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from "./roles.decorator.js";
import { Role } from "./role.enum.js";
import { AuthService } from "../auth.service.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    for (const role of requiredRoles) {
      if (await this.authService.hasGrant(user.id, role)) {
        return true;
      }
    }

    return false;
  }
}
