export const ROUTES = {
  AUTH: {
    ROOT: 'api/v1/auth',
    REGISTER: 'register',
    REGISTER_TENANT: 'register-tenant',
    LOGIN: 'login',
    REFRESH: 'refresh',
  },
  EMPLOYEES: {
    ROOT: 'api/v1/employees',
    ME: 'me',
    BY_ID: ':id',
  },
  ORDERS: {
    ROOT: 'api/v1/orders',
    BY_ID: ':id',
  },
} as const;
