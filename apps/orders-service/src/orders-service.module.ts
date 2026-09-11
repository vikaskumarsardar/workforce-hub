import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrdersServiceController } from '@orders/orders-service.controller';
import { OrdersServiceService } from '@orders/orders-service.service';
import { MetricsModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MetricsModule,
  ],
  controllers: [OrdersServiceController],
  providers: [OrdersServiceService],
})
export class OrdersServiceModule {}
