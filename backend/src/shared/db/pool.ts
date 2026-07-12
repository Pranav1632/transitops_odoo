import { Pool, type PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const toPositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const shouldUseSsl = (databaseUrl: string) => {
  const explicitSsl = process.env.PGSSL || process.env.DB_SSL;
  if (explicitSsl) {
    return ['1', 'true', 'require', 'yes'].includes(explicitSsl.toLowerCase());
  }

  try {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get('sslmode');
    if (sslMode === 'disable') {
      return false;
    }
    if (sslMode) {
      return true;
    }

    return url.hostname.endsWith('.supabase.co') || url.hostname.endsWith('.pooler.supabase.com');
  } catch {
    return false;
  }
};

const poolConfig: PoolConfig = {
  connectionString,
  max: 20,
  idleTimeoutMillis: toPositiveInteger(process.env.PG_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: toPositiveInteger(process.env.PG_CONNECTION_TIMEOUT_MS, 10000),
};

if (shouldUseSsl(connectionString)) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

export const pool = new Pool(poolConfig);
