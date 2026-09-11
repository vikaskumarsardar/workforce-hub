import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

export interface RequestWithTenant extends Record<string, any> {
  tenantId?: string;
  user?: {
    tenantId?: string;
    [key: string]: any;
  };
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithTenant>();

    // 1. Extract tenantId from x-tenant-id header or authenticated JWT user claim
    const tenantIdHeader = request.headers?.['x-tenant-id'] as string;
    const jwtTenantId = request.user?.tenantId;

    const tenantId = tenantIdHeader || jwtTenantId;

    if (!tenantId) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Tenant context missing. Please provide a valid x-tenant-id header or authenticated JWT payload.',
        error: 'Forbidden',
      });
    }

    // 2. Attach tenantId to request context
    request.tenantId = tenantId;
    return true;
  }
}
