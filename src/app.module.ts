import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { readFile } from "node:fs/promises";

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { StaticAuthModule } from './static-auth/static-auth.module.js';
import { AdminModule } from './admin/admin.module.js';
import configuration from "./configuration.js";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./auth/roles/roles.guard.js";
import { AuthGuard } from "./auth/auth.guard.js";
import { ConfigDatabaseType, ConfigImagePresetType } from "./types/config.type.js";

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BaseTablesMigration } from "./database/migrations/1719665254677-base-tables.migration.js";
import { TypeOrmModuleOptions } from "@nestjs/typeorm/dist/interfaces/typeorm-options.interface.js";
import { ImageModule } from './image/image.module.js';
import { ImagePreset } from "./database/entities/image-preset.entity.js";
import { Repository } from "typeorm";
import { CacheModule } from './cache/cache.module.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    AuthModule,
    StaticAuthModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
        const databaseConfig = configService.get<ConfigDatabaseType>('database');
        const baseConfig: TypeOrmModuleOptions = {
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          migrations: [BaseTablesMigration],
          migrationsRun: true,
          synchronize: false,
          logging: ['query', 'error']
        };

        if (databaseConfig.type === 'sqlite') {
          return {
            type: databaseConfig.type,
            database: databaseConfig.database,
            ...baseConfig,
          } as TypeOrmModuleOptions;
        }

        if (databaseConfig.type === 'cockroachdb') {
          let sslOptions: Partial<{
            rejectUnauthorized: boolean;
            ca: string | Buffer;
            cert: string | Buffer;
            key: string | Buffer;
          }> = {};

          if (databaseConfig.ssl.rejectUnauthorized === false) {
            sslOptions.rejectUnauthorized = databaseConfig.ssl.rejectUnauthorized;
          }

          if (databaseConfig.ssl.ca) {
            if (typeof databaseConfig.ssl.ca === 'string') {
              sslOptions.ca = databaseConfig.ssl.ca;
            } else {
              sslOptions.ca = await readFile(databaseConfig.ssl.ca.path);
            }
          }

          if (databaseConfig.ssl.cert) {
            if (typeof databaseConfig.ssl.cert === 'string') {
              sslOptions.cert = databaseConfig.ssl.cert;
            } else {
              sslOptions.cert = await readFile(databaseConfig.ssl.cert.path);
            }
          }

          if (databaseConfig.ssl.key) {
            if (typeof databaseConfig.ssl.key === 'string') {
              sslOptions.key = databaseConfig.ssl.key;
            } else {
              sslOptions.key = await readFile(databaseConfig.ssl.key.path);
            }
          }

          return {
            type: databaseConfig.type,
            database: databaseConfig.database,
            host: databaseConfig.host,
            username: databaseConfig.username,
            password: databaseConfig.password,
            port: databaseConfig.port ?? 26257,
            ssl: databaseConfig.ssl ? sslOptions : undefined,
            ...baseConfig,
          } as TypeOrmModuleOptions;
        }
      },
    }),
    AdminModule,
    ImageModule,
    TypeOrmModule.forFeature([ImagePreset]),
    CacheModule,
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
  constructor(
    @InjectRepository(ImagePreset)
    private imagePresetsRepository: Repository<ImagePreset>,
    private readonly configService: ConfigService,
  ) {
    const imagePresets = configService.get<Array<ConfigImagePresetType>>('images.presets');

    imagePresets.forEach((imagePreset) => {
      this.imagePresetsRepository.save({
        id: imagePreset.alias,
      });
    });
  }
}
