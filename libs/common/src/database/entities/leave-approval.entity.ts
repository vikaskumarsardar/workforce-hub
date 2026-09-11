import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeaveRequestEntity } from './leave-request.entity';
import { EmployeeEntity } from './employee.entity';

@Entity('leave_approvals')
export class LeaveApprovalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  leaveRequestId: string;

  @Column({ type: 'uuid' })
  approverId: string;

  @Column({ type: 'varchar', length: 20 })
  step: string; // MANAGER, HR

  @Column({ type: 'varchar', length: 20 })
  status: string; // APPROVED, REJECTED

  @Column({ type: 'varchar', length: 255, nullable: true })
  comments: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => LeaveRequestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaveRequestId' })
  leaveRequest: LeaveRequestEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'approverId' })
  approver: EmployeeEntity;
}
