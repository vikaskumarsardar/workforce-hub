import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveServiceController } from '@leave/leave-service.controller';
import { LeaveServiceService } from '@leave/leave-service.service';
import {
  MetricsModule,
  DatabaseModule,
  LeaveRequestEntity,
  LeaveBalanceEntity,
  LeaveTypeEntity,
  LeaveApprovalEntity,
  OutboxEventEntity,
  AuditLogEntity,
  EmployeeEntity,
} from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot('leave'),
    TypeOrmModule.forFeature([
      LeaveRequestEntity,
      LeaveBalanceEntity,
      LeaveTypeEntity,
      LeaveApprovalEntity,
      OutboxEventEntity,
      AuditLogEntity,
      EmployeeEntity,
    ]),
    MetricsModule,
  ],
  controllers: [LeaveServiceController],
  providers: [LeaveServiceService],
  exports: [LeaveServiceService],
})
export class LeaveServiceModule {}
