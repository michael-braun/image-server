import { Injectable } from '@nestjs/common';
import { IAuthService } from "../types/auth-service.type.js";
import { ConfigService } from "@nestjs/config";
import { ConfigStaticAuthType, ConfigStaticUacType } from "../types/config.type.js";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../auth/roles/role.enum.js";

@Injectable()
export class StaticAuthService implements IAuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {
  }

  async signIn(username: string, password: string): Promise<{ accessToken: string; }> {
    const user = this.authConfig.users.find(user => user.username === username);
    if (!user || user.password !== password) {
      throw new Error('user not found');
    }

    const token = await this.jwtService.signAsync({

    }, {
      subject: user.id,
    });

    return {
      accessToken: token,
    };
  }

  async hasGrant(subjectId: string, grant: Role): Promise<boolean> {
    const user = this.uacConfig.users.find(user => user.user_id === subjectId);
    if (!user) {
      return false;
    }

    return user.permissions.includes(grant);
  }

  private get authConfig(): ConfigStaticAuthType {
    return this.configService.get<ConfigStaticAuthType>('auth');
  }

  private get uacConfig(): ConfigStaticUacType {
    return this.configService.get<ConfigStaticUacType>('uac');
  }
}
