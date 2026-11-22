export type NodeEnv = 'development' | 'test' | 'production';

export interface EnvironmentVariables {
  NODE_ENV: NodeEnv;
  PORT: number;
  DATABASE_URL: string;
  /** Comma-separated list in the environment; parsed to an array of allowed origins. */
  CORS_ORIGINS: string[];
}

const NODE_ENVS: readonly NodeEnv[] = ['development', 'test', 'production'];

/**
 * Validates and normalises process environment at startup so the API fails fast with a clear
 * message instead of misbehaving later. Used by ConfigModule's `validate` option.
 */
export function validateEnv(
  raw: Record<string, unknown>,
): EnvironmentVariables & Record<string, unknown> {
  const errors: string[] = [];

  const nodeEnv = (raw['NODE_ENV'] ?? 'development') as string;
  if (!NODE_ENVS.includes(nodeEnv as NodeEnv)) {
    errors.push(`NODE_ENV must be one of: ${NODE_ENVS.join(', ')}`);
  }

  const portRaw = raw['PORT'] ?? '3001';
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push('PORT must be an integer between 1 and 65535');
  }

  const databaseUrl = raw['DATABASE_URL'];
  if (typeof databaseUrl !== 'string' || !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    errors.push('DATABASE_URL is required and must start with postgresql:// or postgres://');
  }

  const corsOrigins = String(raw['CORS_ORIGINS'] ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n - ${errors.join('\n - ')}`);
  }

  return {
    ...raw,
    NODE_ENV: nodeEnv as NodeEnv,
    PORT: port,
    DATABASE_URL: databaseUrl as string,
    CORS_ORIGINS: corsOrigins,
  };
}
