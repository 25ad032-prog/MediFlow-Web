const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
let isConnected = false;
let connectionAttempted = false;

function hasDbConfig() {
  return Boolean(
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.PGHOST ||
    process.env.PGDATABASE
  );
}

function createPool() {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  const config = {
    max: parseInt(process.env.PG_MAX_CONNECTIONS || '20', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };

  if (connectionString) {
    config.connectionString = connectionString;
    
    // SSL detection for cloud-hosted databases (Render, Supabase, Neon, Railway, AWS, etc.)
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    const isHosted = connectionString.includes('render.com') ||
                     connectionString.includes('supabase.co') ||
                     connectionString.includes('neon.tech') ||
                     connectionString.includes('railway.app') ||
                     connectionString.includes('amazonaws.com') ||
                     connectionString.includes('sslmode=require') ||
                     process.env.PGSSL === 'true' ||
                     (process.env.NODE_ENV === 'production' && !isLocal);

    if (isHosted && !isLocal) {
      config.ssl = { rejectUnauthorized: false };
    }
  } else if (process.env.PGHOST || process.env.PGUSER || process.env.PGDATABASE) {
    config.host = process.env.PGHOST || 'localhost';
    config.port = parseInt(process.env.PGPORT || '5432', 10);
    config.user = process.env.PGUSER || 'postgres';
    config.password = process.env.PGPASSWORD || '';
    config.database = process.env.PGDATABASE || 'mediflow';

    if (process.env.PGSSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }
  } else {
    // No database credentials provided
    return null;
  }

  try {
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[PostgreSQL] ❌ Pool client error:', err.message);
      isConnected = false;
    });

    return pool;
  } catch (err) {
    console.error('[PostgreSQL] ❌ Pool initialization error:', err.message);
    return null;
  }
}

async function checkConnection() {
  connectionAttempted = true;
  const configured = hasDbConfig();

  if (!configured) {
    isConnected = false;
    return {
      connected: false,
      configured: false,
      reason: 'No PostgreSQL configuration found in environment variables.'
    };
  }

  const p = createPool();
  if (!p) {
    isConnected = false;
    return {
      connected: false,
      configured: true,
      error: 'Failed to create PostgreSQL connection pool.'
    };
  }

  try {
    const client = await p.connect();
    try {
      const res = await client.query('SELECT NOW() AS now, current_database() AS db;');
      isConnected = true;
      return {
        connected: true,
        configured: true,
        serverTime: res.rows[0].now,
        database: res.rows[0].db
      };
    } finally {
      client.release();
    }
  } catch (err) {
    isConnected = false;
    return {
      connected: false,
      configured: true,
      error: err.message
    };
  }
}

async function query(text, params) {
  const p = createPool();
  if (!p) {
    throw new Error('Database pool not available');
  }
  const start = Date.now();
  const res = await p.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DEBUG_SQL === 'true') {
    console.log('[PostgreSQL Query]', { text, duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
}

async function getClient() {
  const p = createPool();
  if (!p) throw new Error('Database pool not available');
  return await p.connect();
}

module.exports = {
  createPool,
  getPool: () => pool,
  query,
  getClient,
  checkConnection,
  hasDbConfig,
  isDbConnected: () => isConnected,
  hasAttemptedConnection: () => connectionAttempted
};
