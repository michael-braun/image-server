import { Injectable } from '@nestjs/common';
import { IAuthService } from "../types/auth-service.type.js";
import { ConfigService } from "@nestjs/config";
import { StaticAuthService } from "../static-auth/static-auth.service.js";
import { ConfigType } from "../types/config.type.js";
import { Role } from "./roles/role.enum.js";

@Injectable()
export class AuthService implements IAuthService {
  private readonly authService: IAuthService;

  constructor(
    private readonly configService: ConfigService,
    private readonly staticAuthService: StaticAuthService,
  ) {
    const authType = configService.get<ConfigType['auth']['type']>('auth.type');

    this.authService = staticAuthService;
  }

  signIn(username: string, password: string): Promise<{ accessToken: string; }> {
    return this.authService.signIn(username, password);
  }

  hasGrant(subjectId: string, grant: Role): Promise<boolean> {
    return this.authService.hasGrant(subjectId, grant);
  }
}
