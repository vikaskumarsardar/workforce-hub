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
        autoLoadEntities: true,
        synchronize: true, // Enables dev schema sync; set false in production migrations
        logging: ['error', 'warn'],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
