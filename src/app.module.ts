import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { StaticAuthModule } from './static-auth/static-auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import configuration from "./configuration.js";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./auth/roles/roles.guard.js";
import { AuthGuard } from "./auth/auth.guard.js";

@Module({
  imports: [
    AuthModule,
    StaticAuthModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    AdminModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {
}
