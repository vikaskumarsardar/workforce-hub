import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaySlipEntity } from './pay-slip.entity';

@Entity('pay_slip_items')
export class PaySlipItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  paySlipId: string;

  @Column({ type: 'varchar', length: 20 }) // ALLOWANCE, DEDUCTION, TAX
  type: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ManyToOne(() => PaySlipEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paySlipId' })
  paySlip: PaySlipEntity;
}
