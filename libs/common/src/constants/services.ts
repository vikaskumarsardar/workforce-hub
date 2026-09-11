/**
 * Injection tokens for microservice clients
 */
export const AUTH_SERVICE = 'AUTH_SERVICE';
export const ORDERS_SERVICE = 'ORDERS_SERVICE';
export const LEAVE_SERVICE = 'LEAVE_SERVICE';
export const PAYROLL_SERVICE = 'PAYROLL_SERVICE';
export const NOTIFICATION_SERVICE = 'NOTIFICATION_SERVICE';

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
  LEAVE: {
    SUBMIT: 'leave.submit',
    APPROVE: 'leave.approve',
    REJECT: 'leave.reject',
    VERIFY: 'leave.verify',
    GET_MY_LEAVES: 'leave.get_my_leaves',
    GET_LEAVE_BY_ID: 'leave.get_by_id',
    GET_BALANCES: 'leave.get_balances',
  },
  PAYROLL: {
    EXECUTE_RUN: 'payroll.execute_run',
    GET_PAYROLL_RUN: 'payroll.get_run',
    GET_MY_SLIPS: 'payroll.get_my_slips',
    GET_SLIP_BY_ID: 'payroll.get_slip_by_id',
  },
  NOTIFICATION: {
    PROCESS_OUTBOX_EVENT: 'notification.process_outbox_event',
    SEND_EMAIL: 'notification.send_email',
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
