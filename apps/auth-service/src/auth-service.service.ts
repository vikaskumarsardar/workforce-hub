import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  CreateUserDto,
  LoginUserDto,
  MESSAGES,
  IUser,
  IUserWithHash,
  AUTH_CONSTANTS,
} from '@app/common';

@Injectable()
export class AuthServiceService {
  private readonly logger = new Logger(AuthServiceService.name);
  private users: Map<string, IUserWithHash> = new Map();

  async registerUser(dto: CreateUserDto) {
    this.logger.log(`Registering new user: ${dto.email}`);

    const existing = Array.from(this.users.values()).find(
      (u) => u.email === dto.email,
    );
    if (existing) {
      this.logger.warn(`User registration failed - email already exists: ${dto.email}`);
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: MESSAGES.AUTH.USER_EXISTS(dto.email),
      });
    }

    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newUser: IUserWithHash = {
      id: userId,
      email: dto.email,
      name: dto.name,
      passwordHash: `${AUTH_CONSTANTS.PASSWORD_HASH_PREFIX}${dto.password}`,
      createdAt: new Date(),
    };

    this.users.set(userId, newUser);
    this.logger.log(`User registered successfully with ID: ${userId}`);

    const { passwordHash, ...userWithoutPassword } = newUser;
    return {
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      user: userWithoutPassword as IUser,
    };
  }

  async loginUser(dto: LoginUserDto) {
    this.logger.log(`Authenticating user: ${dto.email}`);

    const user = Array.from(this.users.values()).find(
      (u) => u.email === dto.email,
    );

    const expectedHash = `${AUTH_CONSTANTS.PASSWORD_HASH_PREFIX}${dto.password}`;
    if (!user || user.passwordHash !== expectedHash) {
      this.logger.warn(`Invalid credentials attempt for email: ${dto.email}`);
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_CREDENTIALS,
      });
    }

    const mockAccessToken = `${AUTH_CONSTANTS.TOKEN_PREFIX}${Buffer.from(
      JSON.stringify({ sub: user.id, email: user.email }),
    ).toString('base64')}.signature`;

    this.logger.log(`User login successful: ${user.id}`);

    const { passwordHash, ...userWithoutPassword } = user;
    return {
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken: mockAccessToken,
      user: userWithoutPassword as IUser,
    };
  }

  async validateToken(token: string) {
    this.logger.log(`Validating token...`);
    if (!token || !token.startsWith(AUTH_CONSTANTS.TOKEN_PREFIX)) {
      this.logger.warn(`Token validation failed: Invalid token format`);
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: MESSAGES.AUTH.INVALID_TOKEN,
      });
    }
    this.logger.log(`Token validation successful`);
    return { valid: true };
  }
}
