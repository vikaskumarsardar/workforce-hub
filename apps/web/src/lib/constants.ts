export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TENANT_ID: 'tenantId',
} as const;

export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER: 'Bearer ',
  TENANT_ID: 'x-tenant-id',
  CONTENT_TYPE: 'Content-Type',
} as const;

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REFRESH: '/api/v1/auth/refresh',
  REGISTER_TENANT: '/api/v1/auth/register-tenant',
} as const;

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER_TENANT: '/register-tenant',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  LEAVES: '/leaves',
  PAYROLL: '/payroll',
} as const;

export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  LINE_MANAGER: 'LINE_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
