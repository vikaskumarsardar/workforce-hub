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
    LOGIN: 'auth.login',
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
