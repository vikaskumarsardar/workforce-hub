import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollServiceController } from '@payroll/payroll-service.controller';
import { PayrollServiceService } from '@payroll/payroll-service.service';
import {
  MetricsModule,
  DatabaseModule,
  RedisModule,
  PayrollRunEntity,
  PaySlipEntity,
  PaySlipItemEntity,
  EmployeeEntity,
  CompensationEntity,
  LeaveRequestEntity,
  OutboxEventEntity,
  AuditLogEntity,
} from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot('payroll'),
    RedisModule,
    TypeOrmModule.forFeature([
      PayrollRunEntity,
      PaySlipEntity,
      PaySlipItemEntity,
      EmployeeEntity,
      CompensationEntity,
      LeaveRequestEntity,
      OutboxEventEntity,
      AuditLogEntity,
    ]),
    MetricsModule,
  ],
  controllers: [PayrollServiceController],
  providers: [PayrollServiceService],
  exports: [PayrollServiceService],
})
export class PayrollServiceModule {}
