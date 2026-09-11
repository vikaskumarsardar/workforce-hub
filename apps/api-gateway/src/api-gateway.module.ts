import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  ORDERS_SERVICE,
  ConfigKeys,
  DEFAULT_CONFIG,
  CorrelationMiddleware,
  wrapClientWithCorrelation,
  MetricsModule,
} from '@app/common';
import { AuthController } from '@gateway/auth/auth.controller';
import { OrdersController } from '@gateway/orders/orders.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MetricsModule,
  ],
  providers: [
    {
      provide: AUTH_SERVICE,
      useFactory: (configService: ConfigService) => {
        const client = ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>(
              ConfigKeys.AUTH_SERVICE_HOST,
              DEFAULT_CONFIG[ConfigKeys.AUTH_SERVICE_HOST],
            ),
            port: Number(
              configService.get<number>(
                ConfigKeys.AUTH_SERVICE_PORT,
                DEFAULT_CONFIG[ConfigKeys.AUTH_SERVICE_PORT],
              ),
            ),
          },
        });
        return wrapClientWithCorrelation(client);
      },
      inject: [ConfigService],
    },
    {
      provide: ORDERS_SERVICE,
      useFactory: (configService: ConfigService) => {
        const client = ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>(
              ConfigKeys.ORDERS_SERVICE_HOST,
              DEFAULT_CONFIG[ConfigKeys.ORDERS_SERVICE_HOST],
            ),
            port: Number(
              configService.get<number>(
                ConfigKeys.ORDERS_SERVICE_PORT,
                DEFAULT_CONFIG[ConfigKeys.ORDERS_SERVICE_PORT],
              ),
            ),
          },
        });
        return wrapClientWithCorrelation(client);
      },
      inject: [ConfigService],
    },
  ],
  controllers: [AuthController, OrdersController],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
