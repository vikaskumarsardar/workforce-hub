import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { OutboxEventEntity } from '../database/entities/outbox-event.entity';
import { OutboxRelayService } from './outbox-relay.service';
import { NOTIFICATION_SERVICE } from '../constants/services';
import { ConfigKeys, DEFAULT_CONFIG } from '../config/config.keys';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([OutboxEventEntity]),
    ConfigModule,
  ],
  providers: [
    OutboxRelayService,
    {
      provide: NOTIFICATION_SERVICE,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>(
              ConfigKeys.NOTIFICATION_SERVICE_HOST,
              DEFAULT_CONFIG[ConfigKeys.NOTIFICATION_SERVICE_HOST],
            ),
            port: Number(
              configService.get<number>(
                ConfigKeys.NOTIFICATION_SERVICE_PORT,
                DEFAULT_CONFIG[ConfigKeys.NOTIFICATION_SERVICE_PORT],
              ),
            ),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [OutboxRelayService],
})
export class OutboxRelayModule {}
