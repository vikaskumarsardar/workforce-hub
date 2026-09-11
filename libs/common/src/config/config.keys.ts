export enum ConfigKeys {
  HTTP_PORT = 'HTTP_PORT',
  AUTH_SERVICE_HOST = 'AUTH_SERVICE_HOST',
  AUTH_SERVICE_PORT = 'AUTH_SERVICE_PORT',
  ORDERS_SERVICE_HOST = 'ORDERS_SERVICE_HOST',
  ORDERS_SERVICE_PORT = 'ORDERS_SERVICE_PORT',
  LEAVE_SERVICE_HOST = 'LEAVE_SERVICE_HOST',
  LEAVE_SERVICE_PORT = 'LEAVE_SERVICE_PORT',
  PAYROLL_SERVICE_HOST = 'PAYROLL_SERVICE_HOST',
  PAYROLL_SERVICE_PORT = 'PAYROLL_SERVICE_PORT',
  OTEL_EXPORTER_OTLP_ENDPOINT = 'OTEL_EXPORTER_OTLP_ENDPOINT',

  // Database Configuration
  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USERNAME = 'DB_USERNAME',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_NAME = 'DB_NAME',
  DB_SCHEMA = 'DB_SCHEMA',
  DB_POOL_MAX = 'DB_POOL_MAX',
  DB_POOL_MIN = 'DB_POOL_MIN',
  DB_POOL_IDLE_TIMEOUT = 'DB_POOL_IDLE_TIMEOUT',

  // JWT & Security Configuration
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRATION = 'JWT_EXPIRATION',
  JWT_REFRESH_SECRET = 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRATION = 'JWT_REFRESH_EXPIRATION',

  // Redis Configuration
  REDIS_HOST = 'REDIS_HOST',
  REDIS_PORT = 'REDIS_PORT',
}

export const DEFAULT_CONFIG = {
  [ConfigKeys.HTTP_PORT]: 3000,
  [ConfigKeys.AUTH_SERVICE_HOST]: '127.0.0.1',
  [ConfigKeys.AUTH_SERVICE_PORT]: 3001,
  [ConfigKeys.ORDERS_SERVICE_HOST]: '127.0.0.1',
  [ConfigKeys.ORDERS_SERVICE_PORT]: 3002,
  [ConfigKeys.LEAVE_SERVICE_HOST]: '127.0.0.1',
  [ConfigKeys.LEAVE_SERVICE_PORT]: 3003,
  [ConfigKeys.PAYROLL_SERVICE_HOST]: '127.0.0.1',
  [ConfigKeys.PAYROLL_SERVICE_PORT]: 3004,
  [ConfigKeys.OTEL_EXPORTER_OTLP_ENDPOINT]: 'http://localhost:4317',

  // Database Defaults
  [ConfigKeys.DB_HOST]: 'localhost',
  [ConfigKeys.DB_PORT]: 5432,
  [ConfigKeys.DB_USERNAME]: 'postgres',
  [ConfigKeys.DB_PASSWORD]: 'postgres_password',
  [ConfigKeys.DB_NAME]: 'workforce_pulse',
  [ConfigKeys.DB_SCHEMA]: 'public',
  [ConfigKeys.DB_POOL_MAX]: 10,
  [ConfigKeys.DB_POOL_MIN]: 2,
  [ConfigKeys.DB_POOL_IDLE_TIMEOUT]: 30000,

  // JWT Defaults
  [ConfigKeys.JWT_SECRET]: 'workforce_pulse_super_secret_jwt_key_2026',
  [ConfigKeys.JWT_EXPIRATION]: '15m',
  [ConfigKeys.JWT_REFRESH_SECRET]: 'workforce_pulse_refresh_secret_key_2026',
  [ConfigKeys.JWT_REFRESH_EXPIRATION]: '7d',

  // Redis Defaults
  [ConfigKeys.REDIS_HOST]: 'localhost',
  [ConfigKeys.REDIS_PORT]: 6379,
} as const;




