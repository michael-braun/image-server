import { Module } from '@nestjs/common';
import { StaticAuthService } from './static-auth.service.js';
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secret'),
        signOptions: {
          expiresIn: '2h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [StaticAuthService],
  exports: [StaticAuthService],
})
export class StaticAuthModule {
}
