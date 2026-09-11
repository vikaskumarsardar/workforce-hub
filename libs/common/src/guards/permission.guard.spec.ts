import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './permission.guard';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    const request = { user };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if route has no permission decorator', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has ADMIN role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['employees:create']);
    const context = createMockContext({ roles: ['ADMIN'] });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required permission enabled', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['employees:create']);
    const context = createMockContext({
      roles: ['EMPLOYEE'],
      permissions: { 'employees:create': true },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['employees:create']);
    const context = createMockContext({
      roles: ['EMPLOYEE'],
      permissions: { 'employees:read': true },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
