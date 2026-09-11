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
  LEAVES: {
    ROOT: 'api/v1/leaves',
    SUBMIT: '',
    APPROVE: ':id/approve',
    REJECT: ':id/reject',
    VERIFY: ':id/verify',
    MY_LEAVES: 'me',
    BALANCES: 'balances',
    BY_ID: ':id',
  },
  PAYROLL: {
    ROOT: 'api/v1/payroll',
    EXECUTE: 'execute',
    MY_SLIPS: 'slips/me',
    SLIP_BY_ID: 'slips/:id',
    RUN_BY_ID: 'runs/:id',
  },
  ORDERS: {
    ROOT: 'api/v1/orders',
    BY_ID: ':id',
  },
} as const;
