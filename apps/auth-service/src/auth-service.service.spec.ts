import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';

function getRepositoryToken(entity: any) {
  return `${typeof entity === 'string' ? entity : entity.name}Repository`;
}
import { AuthServiceService } from './auth-service.service';
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
} from '@app/common';

describe('AuthServiceService', () => {
  let service: AuthServiceService;
  let tenantRepo: any;
  let employeeRepo: any;
  let roleRepo: any;
  let userRoleRepo: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockRepo = () => ({
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((entity) => Promise.resolve({ id: 'uuid-1', ...entity })),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceService,
        { provide: getRepositoryToken(TenantEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(EmployeeEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(RoleEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(PermissionEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(RolePermissionEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(UserRoleEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(RefreshTokenEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(AuditLogEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(DepartmentEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(PositionEntity), useValue: mockRepo() },
        { provide: getRepositoryToken(CompensationEntity), useValue: mockRepo() },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
            verify: jest.fn().mockReturnValue({ sub: 'uuid-emp', tenantId: 'uuid-tenant' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key, defaultVal) => defaultVal || 'test-secret'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthServiceService>(AuthServiceService);
    tenantRepo = module.get(getRepositoryToken(TenantEntity));
    employeeRepo = module.get(getRepositoryToken(EmployeeEntity));
    roleRepo = module.get(getRepositoryToken(RoleEntity));
    userRoleRepo = module.get(getRepositoryToken(UserRoleEntity));
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerTenant', () => {
    it('should throw Conflict error if tenant domain already exists', async () => {
      tenantRepo.findOne.mockResolvedValue({ id: 'existing-tenant', domain: 'acme.com' });
      await expect(
        service.registerTenant({
          companyName: 'Acme Corp',
          domain: 'acme.com',
          adminEmail: 'admin@acme.com',
          adminPassword: 'Password123!',
          adminFirstName: 'John',
          adminLastName: 'Doe',
        }),
      ).rejects.toThrow(RpcException);
    });

    it('should register a new tenant and root admin successfully', async () => {
      tenantRepo.findOne.mockResolvedValue(null);
      roleRepo.findOne.mockResolvedValue({ id: 'role-admin', name: 'ADMIN' });

      const result = await service.registerTenant({
        companyName: 'Acme Corp',
        domain: 'acme.com',
        adminEmail: 'admin@acme.com',
        adminPassword: 'Password123!',
        adminFirstName: 'John',
        adminLastName: 'Doe',
      });

      expect(result).toHaveProperty('tenantId');
      expect(result).toHaveProperty('employeeId');
      expect(tenantRepo.save).toHaveBeenCalled();
      expect(employeeRepo.save).toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    it('should authenticate user and return access & refresh tokens', async () => {
      const hashedPassword = await PasswordUtil.hashPassword('Password123!');
      employeeRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        email: 'user@acme.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        tenantId: 'tenant-1',
      });
      userRoleRepo.find.mockResolvedValue([{ role: { name: 'EMPLOYEE' } }]);

      const result = await service.loginUser({
        email: 'user@acme.com',
        password: 'Password123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock.jwt.token');
      expect(result).toHaveProperty('refreshToken', 'mock.jwt.token');
      expect(result.user.email).toBe('user@acme.com');
    });

    it('should throw Unauthorized error for invalid password', async () => {
      const hashedPassword = await PasswordUtil.hashPassword('Password123!');
      employeeRepo.findOne.mockResolvedValue({
        id: 'emp-1',
        email: 'user@acme.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
      });

      await expect(
        service.loginUser({
          email: 'user@acme.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(RpcException);
    });
  });
});
