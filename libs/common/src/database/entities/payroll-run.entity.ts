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
import { PaySlipEntity } from './pay-slip.entity';

@Entity('payroll_runs')
export class PayrollRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 7 }) // YYYY-MM
  period: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalGross: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalNet: number;

  @Column({ type: 'varchar', length: 20, default: 'PROCESSING' })
  status: string; // PROCESSING, COMPLETED, FAILED

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @OneToMany(() => PaySlipEntity, (slip) => slip.payrollRun)
  paySlips: PaySlipEntity[];
}
