import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permission metadata is defined on the route, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'No authenticated user context found for permission validation.',
      });
    }

    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];
    if (userRoles.includes('ADMIN')) {
      return true;
    }

    const userPermissions: Record<string, boolean> = user.permissions || {};

    // Fail-secure check: Ensure userPermissions is a valid object
    if (typeof userPermissions !== 'object' || Array.isArray(userPermissions)) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Invalid user permissions payload. Access denied.',
      });
    }

    // Grant access if the user has ANY of the required permissions set to explicitly true
    const hasPermission = requiredPermissions.some(
      (perm) => userPermissions[perm] === true,
    );

    if (!hasPermission) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]. Access denied.`,
      });
    }

    return true;
  }
}
