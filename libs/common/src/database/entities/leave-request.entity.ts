import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TenantEntity } from './tenant.entity';
import { EmployeeEntity } from './employee.entity';
import { LeaveTypeEntity } from './leave-type.entity';

@Entity('leave_requests')
export class LeaveRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'uuid' })
  leaveTypeId: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'integer' })
  totalDays: number;

  @Column({ type: 'varchar', length: 30, default: 'SUBMITTED' })
  status: string; // SUBMITTED, MANAGER_APPROVED, HR_VERIFIED, REJECTED, PAYROLL_LOCKED

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @ManyToOne(() => LeaveTypeEntity)
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType: LeaveTypeEntity;
}
