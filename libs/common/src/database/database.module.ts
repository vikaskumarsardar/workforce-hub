import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { ConfigKeys, DEFAULT_CONFIG } from '../config/config.keys';

@Module({})
export class DatabaseModule {
  static forRoot(schemaName: string = 'public'): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>(
              ConfigKeys.DB_HOST,
              DEFAULT_CONFIG[ConfigKeys.DB_HOST],
            ),
            port: configService.get<number>(
              ConfigKeys.DB_PORT,
              DEFAULT_CONFIG[ConfigKeys.DB_PORT],
            ),
            username: configService.get<string>(
              ConfigKeys.DB_USERNAME,
              DEFAULT_CONFIG[ConfigKeys.DB_USERNAME],
            ),
            password: configService.get<string>(
              ConfigKeys.DB_PASSWORD,
              DEFAULT_CONFIG[ConfigKeys.DB_PASSWORD],
            ),
            database: configService.get<string>(
              ConfigKeys.DB_NAME,
              DEFAULT_CONFIG[ConfigKeys.DB_NAME],
            ),
            schema: schemaName,
            autoLoadEntities: true,
            synchronize: true,
            logging: ['error', 'warn'],
            extra: {
              max: configService.get<number>(
                ConfigKeys.DB_POOL_MAX,
                DEFAULT_CONFIG[ConfigKeys.DB_POOL_MAX],
              ),
              min: configService.get<number>(
                ConfigKeys.DB_POOL_MIN,
                DEFAULT_CONFIG[ConfigKeys.DB_POOL_MIN],
              ),
              idleTimeoutMillis: configService.get<number>(
                ConfigKeys.DB_POOL_IDLE_TIMEOUT,
                DEFAULT_CONFIG[ConfigKeys.DB_POOL_IDLE_TIMEOUT],
              ),
            },
          }),
          dataSourceFactory: async (options) => {
            if (!options) {
              throw new Error('TypeORM options are undefined');
            }

            const isCustomPostgresSchema =
              options.type === 'postgres' &&
              Boolean(schemaName) &&
              schemaName !== 'public';

            if (isCustomPostgresSchema) {
              try {
                const client = new Client({
                  host: options.host,
                  port: options.port,
                  user: options.username,
                  password: options.password,
                  database: options.database,
                });
                await client.connect();
                await client.query(
                  `CREATE SCHEMA IF NOT EXISTS "${schemaName}";`,
                );
                await client.end();
              } catch (err) {
                // Silence schema creation error if DB connection is mocked in unit tests
              }
            }
            return new DataSource(options).initialize();
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}

