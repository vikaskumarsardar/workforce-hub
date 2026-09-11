export enum ConfigKeys {
  HTTP_PORT = 'HTTP_PORT',
  AUTH_SERVICE_HOST = 'AUTH_SERVICE_HOST',
  AUTH_SERVICE_PORT = 'AUTH_SERVICE_PORT',
  ORDERS_SERVICE_HOST = 'ORDERS_SERVICE_HOST',
  ORDERS_SERVICE_PORT = 'ORDERS_SERVICE_PORT',
  OTEL_EXPORTER_OTLP_ENDPOINT = 'OTEL_EXPORTER_OTLP_ENDPOINT',

  // Database Configuration
  DB_HOST = 'DB_HOST',
  DB_PORT = 'DB_PORT',
  DB_USERNAME = 'DB_USERNAME',
  DB_PASSWORD = 'DB_PASSWORD',
  DB_NAME = 'DB_NAME',

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
  [ConfigKeys.OTEL_EXPORTER_OTLP_ENDPOINT]: 'http://localhost:4317',

  // Database Defaults
  [ConfigKeys.DB_HOST]: 'localhost',
  [ConfigKeys.DB_PORT]: 5432,
  [ConfigKeys.DB_USERNAME]: 'postgres',
  [ConfigKeys.DB_PASSWORD]: 'postgres_password',
  [ConfigKeys.DB_NAME]: 'workforce_pulse',

  // Redis Defaults
  [ConfigKeys.REDIS_HOST]: 'localhost',
  [ConfigKeys.REDIS_PORT]: 6379,
} as const;

