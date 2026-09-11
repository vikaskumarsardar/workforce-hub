import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  const createMockContext = (headers: Record<string, string> = {}, user?: any): ExecutionContext => {
    const request = { headers, user };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow request when x-tenant-id header is present', () => {
    const context = createMockContext({ 'x-tenant-id': 'tenant-uuid-1' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow request when tenantId is present in JWT user object', () => {
    const context = createMockContext({}, { tenantId: 'tenant-uuid-jwt' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when no tenant context is provided', () => {
    const context = createMockContext({}, {});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
