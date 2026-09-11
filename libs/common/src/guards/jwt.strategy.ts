import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigKeys, DEFAULT_CONFIG } from '../config/config.keys';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  permissions?: Record<string, boolean>;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        ConfigKeys.JWT_SECRET,
        DEFAULT_CONFIG[ConfigKeys.JWT_SECRET],
      ),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid JWT payload claims.');
    }
    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles || [],
      permissions: payload.permissions || {},
    };
  }
}
