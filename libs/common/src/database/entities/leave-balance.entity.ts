import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { LeaveTypeEntity } from './leave-type.entity';

@Entity('leave_balances')
export class LeaveBalanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'uuid' })
  leaveTypeId: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer', default: 14 })
  allocatedDays: number;

  @Column({ type: 'integer', default: 0 })
  usedDays: number;

  @Column({ type: 'integer', default: 0 })
  pendingDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => EmployeeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;

  @ManyToOne(() => LeaveTypeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType: LeaveTypeEntity;
}
