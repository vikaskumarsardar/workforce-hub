import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CreateUserDto,
  LoginUserDto,
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

  @Post(ROUTES.AUTH.REGISTER)
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Forwarding user registration request for email: ${createUserDto.email}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.REGISTER, createUserDto),
    );
  }

  @Post(ROUTES.AUTH.LOGIN)
  async login(@Body() loginUserDto: LoginUserDto) {
    this.logger.log(`Forwarding user login request for email: ${loginUserDto.email}`);
    return firstValueFrom(
      this.authClient.send(PATTERNS.AUTH.LOGIN, loginUserDto),
    );
  }
}
