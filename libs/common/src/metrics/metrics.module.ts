import { Module, Global } from '@nestjs/common';
import { MetricsService } from '@app/common/metrics/metrics.service';
import { MetricsController } from '@app/common/metrics/metrics.controller';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
