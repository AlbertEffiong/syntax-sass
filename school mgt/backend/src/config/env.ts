import dotenv from 'dotenv';

dotenv.config();

/**
 * Reads an environment variable, falling back to a default value.
 */
function read(name: string, fallback: string): string {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

function readNumber(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

const nodeEnv = read('NODE_ENV', 'development');
const isProduction = nodeEnv === 'production';
const jwtSecret = read('JWT_SECRET', 'dev-insecure-secret-change-me');

if (isProduction && jwtSecret === 'dev-insecure-secret-change-me') {
  // Fail fast rather than booting production with a well-known secret.
  throw new Error('JWT_SECRET must be set to a strong unique value in production.');
}

export const env = {
  nodeEnv,
  isProduction,
  isTest: nodeEnv === 'test',
  port: readNumber('PORT', 4000),

  mongoUri: read('MONGO_URI', 'mongodb://127.0.0.1:27017/syntax_saas'),

  jwt: {
    secret: jwtSecret,
    expiresIn: read('JWT_EXPIRES_IN', '1d'),
  },

  /** Strict allowlist of frontend origins permitted by CORS. */
  corsOrigins: read('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  cookies: {
    secure: readBoolean('COOKIE_SECURE', isProduction),
    domain: process.env.COOKIE_DOMAIN || undefined,
    /** Cookie name that stores the httpOnly auth JWT. */
    authName: 'token',
    /** Non-httpOnly cookie used for the double-submit CSRF token. */
    csrfName: 'csrfToken',
  },

  rateLimit: {
    windowMs: readNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: readNumber('RATE_LIMIT_MAX', 10),
  },

  bcryptRounds: readNumber('BCRYPT_ROUNDS', 12),

  opay: {
    accountNumber: read('OPAY_ACCOUNT_NUMBER', '8168998060'),
    accountName: read('OPAY_ACCOUNT_NAME', 'Albert Effiong'),
  },
} as const;

export type Env = typeof env;
