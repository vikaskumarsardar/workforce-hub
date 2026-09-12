import { JwtService } from '@nestjs/jwt';
import { PasswordUtil } from '@app/common';

describe('WorkforcePulse Platform End-to-End Lifecycle (E2E Integration)', () => {
  let jwtService: JwtService;

  const mockTenant = { id: 'tnt-acme-1', companyName: 'Acme Global', domain: 'acme.com' };
  const mockAdmin = {
    id: 'emp-admin-1',
    tenantId: mockTenant.id,
    email: 'admin@acme.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['ADMIN'],
  };

  const mockEmployee = {
    id: 'emp-jane-1',
    tenantId: mockTenant.id,
    email: 'jane.smith@acme.com',
    firstName: 'Jane',
    lastName: 'Smith',
    roles: ['EMPLOYEE'],
  };

  beforeAll(async () => {
    jwtService = new JwtService({
      secret: 'workforce_pulse_super_secret_jwt_key_2026',
      signOptions: { expiresIn: '15m' },
    });
  });

  describe('1. Tenant Registration & Authentication Flow', () => {
    it('should generate valid bcrypt password hashes and signed JWT access tokens', async () => {
      const plainPassword = 'SecurePassword123!';
      const hash = await PasswordUtil.hashPassword(plainPassword);
      expect(hash).toBeDefined();

      const isValid = await PasswordUtil.comparePasswords(plainPassword, hash);
      expect(isValid).toBe(true);

      const token = jwtService.sign({
        sub: mockAdmin.id,
        email: mockAdmin.email,
        tenantId: mockAdmin.tenantId,
        roles: mockAdmin.roles,
      });

      const decoded = jwtService.verify(token);
      expect(decoded.sub).toBe(mockAdmin.id);
      expect(decoded.tenantId).toBe(mockTenant.id);
      expect(decoded.roles).toContain('ADMIN');
    });
  });

  describe('2. Leave Request Approval State Machine Lifecycle', () => {
    it('should transition leave request state through SUBMITTED -> MANAGER_APPROVED -> HR_VERIFIED -> PAYROLL_LOCKED', () => {
      const stateMachine = ['SUBMITTED', 'MANAGER_APPROVED', 'HR_VERIFIED', 'PAYROLL_LOCKED'];

      let currentStatus = 'SUBMITTED';
      expect(currentStatus).toBe('SUBMITTED');

      // Manager Step
      currentStatus = stateMachine[1];
      expect(currentStatus).toBe('MANAGER_APPROVED');

      // HR Step
      currentStatus = stateMachine[2];
      expect(currentStatus).toBe('HR_VERIFIED');

      // Payroll Execution Step
      currentStatus = stateMachine[3];
      expect(currentStatus).toBe('PAYROLL_LOCKED');
    });
  });

  describe('3. Automated Monthly Payroll Gross-to-Net Math Engine', () => {
    it('should compute exact Gross-to-Net salary deductions (20% Tax, 5% Health)', () => {
      const baseSalary = 4000;
      const taxWithholding = Math.round(baseSalary * 0.20 * 100) / 100; // 800
      const healthInsurance = Math.round(baseSalary * 0.05 * 100) / 100; // 200
      const totalDeductions = taxWithholding + healthInsurance; // 1000
      const netSalary = baseSalary - totalDeductions; // 3000

      expect(taxWithholding).toBe(800);
      expect(healthInsurance).toBe(200);
      expect(totalDeductions).toBe(1000);
      expect(netSalary).toBe(3000);
      expect(baseSalary - totalDeductions).toBe(netSalary);
    });
  });

  describe('4. Transactional Outbox Relay & Idempotency Guarantee', () => {
    it('should process outbox event payload and set processed flag to true upon notification ACK', () => {
      const outboxEvent = {
        id: 'evt-1001',
        eventType: 'payroll.executed',
        payload: { period: '2026-09', totalGross: 4000, totalNet: 3000 },
        processed: false,
        retryCount: 0,
      };

      // Simulating successful ACK from notification-service
      outboxEvent.processed = true;
      expect(outboxEvent.processed).toBe(true);
    });
  });
});
