import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from '@auth/auth-service.service';
import { PATTERNS } from '@app/common';

@Controller()
export class AuthServiceController {
  private readonly logger = new Logger(AuthServiceController.name);

  constructor(private readonly authService: AuthServiceService) {}

  @MessagePattern(PATTERNS.AUTH.REGISTER_TENANT)
  async handleRegisterTenant(@Payload() dto: any) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.REGISTER_TENANT}' for domain: ${dto?.domain}`);
    return this.authService.registerTenant(dto);
  }

  @MessagePattern(PATTERNS.AUTH.LOGIN)
  async handleLogin(@Payload() dto: { email: string; password: string; tenantDomain?: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.LOGIN}' for email: ${dto?.email}`);
    return this.authService.loginUser(dto);
  }

  @MessagePattern(PATTERNS.AUTH.REFRESH_TOKEN)
  async handleRefreshToken(@Payload() dto: { refreshToken: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.REFRESH_TOKEN}'`);
    return this.authService.refreshToken(dto);
  }

  @MessagePattern(PATTERNS.AUTH.ONBOARD_EMPLOYEE)
  async handleOnboardEmployee(@Payload() payload: { tenantId: string; dto: any }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.ONBOARD_EMPLOYEE}' for email: ${payload?.dto?.email}`);
    return this.authService.onboardEmployee(payload.tenantId, payload.dto);
  }

  @MessagePattern(PATTERNS.AUTH.GET_PROFILE)
  async handleGetProfile(@Payload() payload: { tenantId: string; employeeId: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.GET_PROFILE}' for employeeId: ${payload?.employeeId}`);
    return this.authService.getEmployeeProfile(payload.tenantId, payload.employeeId);
  }

  @MessagePattern(PATTERNS.AUTH.GET_EMPLOYEE_BY_ID)
  async handleGetEmployeeById(@Payload() payload: { tenantId: string; employeeId: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.GET_EMPLOYEE_BY_ID}' for employeeId: ${payload?.employeeId}`);
    return this.authService.getEmployeeById(payload.tenantId, payload.employeeId);
  }

  @MessagePattern(PATTERNS.AUTH.VALIDATE_TOKEN)
  async handleValidateToken(@Payload() data: { token: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.VALIDATE_TOKEN}'`);
    return this.authService.validateToken(data.token);
  }
}
