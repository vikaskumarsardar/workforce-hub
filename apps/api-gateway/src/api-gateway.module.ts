import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import {
  AUTH_SERVICE,
  ORDERS_SERVICE,
  LEAVE_SERVICE,
  ConfigKeys,
  DEFAULT_CONFIG,
  CorrelationMiddleware,
  wrapClientWithCorrelation,
  MetricsModule,
  JwtStrategy,
} from '@app/common';
import { AuthController } from '@gateway/auth/auth.controller';
import { EmployeesController } from '@gateway/employees/employees.controller';
import { LeavesController } from '@gateway/leaves/leaves.controller';
import { OrdersController } from '@gateway/orders/orders.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          ConfigKeys.JWT_SECRET,
          DEFAULT_CONFIG[ConfigKeys.JWT_SECRET],
        ),
        signOptions: {
          expiresIn: configService.get<string>(
            ConfigKeys.JWT_EXPIRATION,
            DEFAULT_CONFIG[ConfigKeys.JWT_EXPIRATION],
          ),
        },
      }),
    }),
    MetricsModule,
  ],
  providers: [
    JwtStrategy,
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
      provide: LEAVE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const client = ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>(
              ConfigKeys.LEAVE_SERVICE_HOST,
              DEFAULT_CONFIG[ConfigKeys.LEAVE_SERVICE_HOST],
            ),
            port: Number(
              configService.get<number>(
                ConfigKeys.LEAVE_SERVICE_PORT,
                DEFAULT_CONFIG[ConfigKeys.LEAVE_SERVICE_PORT],
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
  controllers: [AuthController, EmployeesController, LeavesController, OrdersController],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
