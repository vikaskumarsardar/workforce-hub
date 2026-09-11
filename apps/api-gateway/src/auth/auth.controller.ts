import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  LoginUserDto,
  RegisterTenantDto,
  RefreshTokenDto,
  PATTERNS,
  ROUTES,
} from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller(ROUTES.AUTH.ROOT)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post(ROUTES.AUTH.REGISTER_TENANT)
  async registerTenant(@Body() registerTenantDto: RegisterTenantDto) {
    this.logger.log(`Forwarding tenant registration request for domain: ${registerTenantDto.domain}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.REGISTER_TENANT, registerTenantDto),
    );
  }

  @Post(ROUTES.AUTH.LOGIN)
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.log(`Forwarding user login request for email: ${loginUserDto.email}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.LOGIN, loginUserDto),
    );
  }

  @Post(ROUTES.AUTH.REFRESH)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log(`Forwarding refresh token request`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.REFRESH_TOKEN, refreshTokenDto),
    );
  }
}
