import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  TenantEntity,
  EmployeeEntity,
  RoleEntity,
  PermissionEntity,
  RolePermissionEntity,
  UserRoleEntity,
  RefreshTokenEntity,
  AuditLogEntity,
  DepartmentEntity,
  PositionEntity,
  CompensationEntity,
  PasswordUtil,
  ConfigKeys,
  DEFAULT_CONFIG,
  MESSAGES,
} from '@app/common';

@Injectable()
export class AuthServiceService {
  private readonly logger = new Logger(AuthServiceService.name);

  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepo: Repository<EmployeeEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepo: Repository<RolePermissionEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepo: Repository<DepartmentEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepo: Repository<PositionEntity>,
    @InjectRepository(CompensationEntity)
    private readonly compensationRepo: Repository<CompensationEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Bootstraps a new tenant and root admin employee
   */
  async registerTenant(dto: { companyName: string; domain: string; adminEmail: string; adminPassword: string; adminFirstName: string; adminLastName: string }) {
    this.logger.log(`Registering new tenant domain: ${dto.domain}`);

    const existingTenant = await this.tenantRepo.findOne({ where: { domain: dto.domain } });
    if (existingTenant) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: `Tenant with domain '${dto.domain}' already exists.`,
      });
    }

    const tenant = this.tenantRepo.create({
      companyName: dto.companyName,
      domain: dto.domain,
      status: 'ACTIVE',
    });
    await this.tenantRepo.save(tenant);

    // Ensure default ADMIN role exists
    let adminRole = await this.roleRepo.findOne({ where: { name: 'ADMIN' } });
    if (!adminRole) {
      adminRole = this.roleRepo.create({ name: 'ADMIN', description: 'Root Administrator' });
      await this.roleRepo.save(adminRole);
    }

    const hashedPassword = await PasswordUtil.hashPassword(dto.adminPassword);
    const adminEmployee = this.employeeRepo.create({
      tenantId: tenant.id,
      email: dto.adminEmail,
      passwordHash: hashedPassword,
      firstName: dto.adminFirstName,
      lastName: dto.adminLastName,
      status: 'ACTIVE',
    });
    await this.employeeRepo.save(adminEmployee);

    // Assign ADMIN role
    const userRole = this.userRoleRepo.create({
      employeeId: adminEmployee.id,
      roleId: adminRole.id,
    });
    await this.userRoleRepo.save(userRole);

    // Audit Log
    await this.auditLogRepo.save(
      this.auditLogRepo.create({
        tenantId: tenant.id,
        actorId: adminEmployee.id,
        action: 'TENANT_REGISTERED',
        entityType: 'Tenant',
        entityId: tenant.id,
        newValue: { companyName: tenant.companyName, domain: tenant.domain },
      }),
    );

    return {
      message: 'Tenant and Admin registered successfully.',
      tenantId: tenant.id,
      employeeId: adminEmployee.id,
    };
  }

  /**
   * Authenticates employee credentials and returns signed JWT access & refresh tokens
   */
  async loginUser(dto: { email: string; password: string; tenantDomain?: string }) {
    this.logger.log(`Authenticating user email: ${dto.email}`);

    const employee = await this.employeeRepo.findOne({
      where: { email: dto.email },
      relations: { tenant: true },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await PasswordUtil.comparePasswords(dto.password, employee.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${dto.email}`);
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    // Resolve user roles
    const userRoles = await this.userRoleRepo.find({
      where: { employeeId: employee.id },
      relations: { role: true },
    });
    const roleNames = userRoles.map((ur) => ur.role?.name).filter(Boolean);

    // Generate JWT Access Token
    const jwtPayload = {
      sub: employee.id,
      email: employee.email,
      tenantId: employee.tenantId,
      roles: roleNames,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    // Generate Refresh Token
    const refreshSecret = this.configService.get<string>(
      ConfigKeys.JWT_REFRESH_SECRET,
      DEFAULT_CONFIG[ConfigKeys.JWT_REFRESH_SECRET],
    );
    const refreshToken = this.jwtService.sign(
      { sub: employee.id, tenantId: employee.tenantId },
      { secret: refreshSecret, expiresIn: '7d' },
    );

    const hashedRefreshToken = await PasswordUtil.hashPassword(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        employeeId: employee.id,
        hashedToken: hashedRefreshToken,
        expiresAt,
        isRevoked: false,
      }),
    );

    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      refreshToken,
      user: {
        id: employee.id,
        tenantId: employee.tenantId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        roles: roleNames,
      },
    };
  }

  /**
   * Onboards a new employee under a tenant
   */
  async onboardEmployee(tenantId: string, dto: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    departmentId?: string;
    positionId?: string;
    managerId?: string;
    baseSalary?: number;
    currency?: string;
  }) {
    this.logger.log(`Onboarding employee ${dto.email} for tenant ${tenantId}`);

    const existing = await this.employeeRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: MESSAGES.AUTH.USER_EXISTS(dto.email),
      });
    }

    const defaultPassword = dto.password || 'WelcomePulse2026!';
    const passwordHash = await PasswordUtil.hashPassword(defaultPassword);

    const employee = this.employeeRepo.create({
      tenantId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      departmentId: dto.departmentId,
      positionId: dto.positionId,
      managerId: dto.managerId,
      status: 'ACTIVE',
    });
    await this.employeeRepo.save(employee);

    if (dto.baseSalary) {
      await this.compensationRepo.save(
        this.compensationRepo.create({
          employeeId: employee.id,
          baseSalary: dto.baseSalary,
          currency: dto.currency || 'USD',
          payFrequency: 'MONTHLY',
          effectiveDate: new Date().toISOString().split('T')[0],
        }),
      );
    }

    // Assign default EMPLOYEE role
    let empRole = await this.roleRepo.findOne({ where: { name: 'EMPLOYEE' } });
    if (!empRole) {
      empRole = await this.roleRepo.save(this.roleRepo.create({ name: 'EMPLOYEE', description: 'Standard Employee' }));
    }
    await this.userRoleRepo.save(
      this.userRoleRepo.create({
        employeeId: employee.id,
        roleId: empRole.id,
      }),
    );

    // Audit log
    await this.auditLogRepo.save(
      this.auditLogRepo.create({
        tenantId,
        actorId: employee.id,
        action: 'EMPLOYEE_ONBOARDED',
        entityType: 'Employee',
        entityId: employee.id,
        newValue: { email: employee.email, departmentId: dto.departmentId },
      }),
    );

    return {
      message: 'Employee onboarded successfully.',
      employeeId: employee.id,
      email: employee.email,
    };
  }

  /**
   * Rotates refresh tokens and issues fresh access & refresh tokens
   */
  async refreshToken(dto: { refreshToken: string }) {
    this.logger.log('Executing refresh token rotation');
    const refreshSecret = this.configService.get<string>(
      ConfigKeys.JWT_REFRESH_SECRET,
      DEFAULT_CONFIG[ConfigKeys.JWT_REFRESH_SECRET],
    );

    let decoded: any;
    try {
      decoded = this.jwtService.verify(dto.refreshToken, { secret: refreshSecret });
    } catch (err) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired refresh token.',
      });
    }

    const employee = await this.employeeRepo.findOne({
      where: { id: decoded.sub, tenantId: decoded.tenantId },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User account inactive or missing.',
      });
    }

    const activeTokens = await this.refreshTokenRepo.find({
      where: { employeeId: employee.id, isRevoked: false },
    });

    let matchedToken: RefreshTokenEntity | null = null;
    for (const tokenRecord of activeTokens) {
      if (await PasswordUtil.comparePasswords(dto.refreshToken, tokenRecord.hashedToken)) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken || matchedToken.expiresAt < new Date()) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Refresh token has been revoked or expired.',
      });
    }

    // Revoke old token
    matchedToken.isRevoked = true;
    await this.refreshTokenRepo.save(matchedToken);

    // Resolve roles
    const userRoles = await this.userRoleRepo.find({
      where: { employeeId: employee.id },
      relations: { role: true },
    });
    const roleNames = userRoles.map((ur) => ur.role?.name).filter(Boolean);

    // Issue new pair
    const accessToken = this.jwtService.sign({
      sub: employee.id,
      email: employee.email,
      tenantId: employee.tenantId,
      roles: roleNames,
    });

    const newRefreshToken = this.jwtService.sign(
      { sub: employee.id, tenantId: employee.tenantId },
      { secret: refreshSecret, expiresIn: '7d' },
    );

    const hashedNewRefresh = await PasswordUtil.hashPassword(newRefreshToken);
    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        employeeId: employee.id,
        hashedToken: hashedNewRefresh,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      }),
    );

    return {
      message: 'Tokens refreshed successfully.',
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Retrieves employee profile by ID ensuring tenant isolation
   */
  async getEmployeeById(tenantId: string, employeeId: string) {
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId, tenantId },
      relations: { department: true, position: true, manager: true },
    });

    if (!employee) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Employee with ID ${employeeId} not found under tenant.`,
      });
    }

    const { passwordHash, ...profile } = employee;
    return profile;
  }

  /**
   * Retrieves employee profile ensuring tenant isolation
   */
  async getEmployeeProfile(tenantId: string, employeeId: string) {
    return this.getEmployeeById(tenantId, employeeId);
  }

  /**
   * Validates JWT Token claims
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { valid: true, user: payload };
    } catch (err) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Token validation failed or expired.',
      });
    }
  }
}
