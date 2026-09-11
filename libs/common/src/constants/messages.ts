export const MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Authentication successful',
    USER_EXISTS: (email: string) => `User with email ${email} already exists`,
    INVALID_CREDENTIALS: 'Invalid credentials provided',
    INVALID_TOKEN: 'Invalid or missing authentication token',
  },
  ORDERS: {
    CREATE_SUCCESS: 'Order placed successfully',
    NOT_FOUND: (id: string) => `Order with ID '${id}' not found`,
  },
} as const;
