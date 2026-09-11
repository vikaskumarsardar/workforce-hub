import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthServiceService } from '@auth/auth-service.service';
import { CreateUserDto, LoginUserDto, PATTERNS } from '@app/common';

@Controller()
export class AuthServiceController {
  private readonly logger = new Logger(AuthServiceController.name);

  constructor(private readonly authService: AuthServiceService) {}

  @MessagePattern(PATTERNS.AUTH.REGISTER)
  async handleRegister(@Payload() dto: CreateUserDto) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.REGISTER}' for email: ${dto.email}`);
    return this.authService.registerUser(dto);
  }

  @MessagePattern(PATTERNS.AUTH.LOGIN)
  async handleLogin(@Payload() dto: LoginUserDto) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.LOGIN}' for email: ${dto.email}`);
    return this.authService.loginUser(dto);
  }

  @MessagePattern(PATTERNS.AUTH.VALIDATE_TOKEN)
  async handleValidateToken(@Payload() data: { token: string }) {
    this.logger.log(`Received RPC pattern '${PATTERNS.AUTH.VALIDATE_TOKEN}'`);
    return this.authService.validateToken(data.token);
  }
}
