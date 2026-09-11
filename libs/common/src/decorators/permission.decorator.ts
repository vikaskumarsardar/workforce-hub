import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permission action keys for a controller route
 * Example: @Permission('leave.approve', 'leave.verify')
 */
export const Permission = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
