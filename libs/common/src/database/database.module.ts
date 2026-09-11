import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKeys, DEFAULT_CONFIG } from '../config/config.keys';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ConfigKeys.DB_HOST, DEFAULT_CONFIG[ConfigKeys.DB_HOST]),
        port: configService.get<number>(ConfigKeys.DB_PORT, DEFAULT_CONFIG[ConfigKeys.DB_PORT]),
        username: configService.get<string>(ConfigKeys.DB_USERNAME, DEFAULT_CONFIG[ConfigKeys.DB_USERNAME]),
        password: configService.get<string>(ConfigKeys.DB_PASSWORD, DEFAULT_CONFIG[ConfigKeys.DB_PASSWORD]),
        database: configService.get<string>(ConfigKeys.DB_NAME, DEFAULT_CONFIG[ConfigKeys.DB_NAME]),
        schema: configService.get<string>(ConfigKeys.DB_SCHEMA, DEFAULT_CONFIG[ConfigKeys.DB_SCHEMA]),
        autoLoadEntities: true,
        synchronize: true, // Enables dev schema sync; set false in production migrations
        logging: ['error', 'warn'],
        extra: {
          max: configService.get<number>(ConfigKeys.DB_POOL_MAX, DEFAULT_CONFIG[ConfigKeys.DB_POOL_MAX]),
          min: configService.get<number>(ConfigKeys.DB_POOL_MIN, DEFAULT_CONFIG[ConfigKeys.DB_POOL_MIN]),
          idleTimeoutMillis: configService.get<number>(ConfigKeys.DB_POOL_IDLE_TIMEOUT, DEFAULT_CONFIG[ConfigKeys.DB_POOL_IDLE_TIMEOUT]),
        },
      }),
    }),
  ],


  exports: [TypeOrmModule],
})
export class DatabaseModule {}
