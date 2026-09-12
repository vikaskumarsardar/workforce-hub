import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthServiceController } from '@auth/auth-service.controller';
import { AuthServiceService } from '@auth/auth-service.service';
import {
  MetricsModule,
  DatabaseModule,
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
  ConfigKeys,
  DEFAULT_CONFIG,
  JwtStrategy,
} from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule.forRoot('auth'),
    TypeOrmModule.forFeature([
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
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(ConfigKeys.JWT_SECRET, DEFAULT_CONFIG[ConfigKeys.JWT_SECRET]),
        signOptions: {
          expiresIn: configService.get<string>(ConfigKeys.JWT_EXPIRATION, DEFAULT_CONFIG[ConfigKeys.JWT_EXPIRATION]),
        },
      }),
    }),
    MetricsModule,
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService, JwtStrategy],
  exports: [AuthServiceService, PassportModule, JwtModule],
})
export class AuthServiceModule {}
