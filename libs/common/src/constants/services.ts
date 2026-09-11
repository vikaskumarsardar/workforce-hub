/**
 * Injection tokens for microservice clients
 */
export const AUTH_SERVICE = 'AUTH_SERVICE';
export const ORDERS_SERVICE = 'ORDERS_SERVICE';

/**
 * Request-Response Message Patterns (Command Pattern)
 */
export const PATTERNS = {
  AUTH: {
    REGISTER: 'auth.register',
    REGISTER_TENANT: 'auth.register_tenant',
    LOGIN: 'auth.login',
    REFRESH_TOKEN: 'auth.refresh_token',
    ONBOARD_EMPLOYEE: 'auth.onboard_employee',
    GET_PROFILE: 'auth.get_profile',
    GET_EMPLOYEE_BY_ID: 'auth.get_employee_by_id',
    VALIDATE_TOKEN: 'auth.validate_token',
  },
  ORDERS: {
    CREATE: 'orders.create',
    FIND_ALL: 'orders.find_all',
    FIND_ONE: 'orders.find_one',
  },
};


/**
 * Event-Driven Message Patterns (Publish-Subscribe Pattern)
 */
export const EVENTS = {
  ORDER_CREATED: 'events.order_created',
  USER_REGISTERED: 'events.user_registered',
};
