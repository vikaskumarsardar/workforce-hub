export const ROUTES = {
  AUTH: {
    ROOT: 'auth',
    REGISTER: 'register',
    LOGIN: 'login',
  },
  ORDERS: {
    ROOT: 'orders',
    BY_ID: ':id',
  },
} as const;
