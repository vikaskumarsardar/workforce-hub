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
import { DepartmentEntity } from './department.entity';
import { PositionEntity } from './position.entity';

@Entity('employees')
export class EmployeeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid', nullable: true })
  managerId: string;

  @Column({ type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ type: 'uuid', nullable: true })
  positionId: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TenantEntity, (tenant) => tenant.employees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @ManyToOne(() => DepartmentEntity, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department: DepartmentEntity;

  @ManyToOne(() => PositionEntity, { nullable: true })
  @JoinColumn({ name: 'positionId' })
  position: PositionEntity;

  @ManyToOne(() => EmployeeEntity, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager: EmployeeEntity;
}
