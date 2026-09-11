import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EmployeeEntity } from './employee.entity';
import { DepartmentEntity } from './department.entity';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  companyName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  domain: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EmployeeEntity, (employee) => employee.tenant)
  employees: EmployeeEntity[];

  @OneToMany(() => DepartmentEntity, (dept) => dept.tenant)
  departments: DepartmentEntity[];
}
