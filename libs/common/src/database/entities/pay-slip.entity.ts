import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PayrollRunEntity } from './payroll-run.entity';
import { EmployeeEntity } from './employee.entity';

@Entity('pay_slips')
export class PaySlipEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  payrollRunId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netSalary: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => PayrollRunEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payrollRunId' })
  payrollRun: PayrollRunEntity;

  @ManyToOne(() => EmployeeEntity)
  @JoinColumn({ name: 'employeeId' })
  employee: EmployeeEntity;
}
