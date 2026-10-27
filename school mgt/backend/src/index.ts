import http from 'http';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { ensureIndexes } from './config/indexes';
import { createApp } from './app';

/**
 * Boots the API: connect to MongoDB, ensure indexes, start listening, and wire
 * graceful shutdown for SIGINT/SIGTERM.
 */
async function bootstrap(): Promise<void> {
  await connectDatabase();
  await ensureIndexes();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] Syntax SaaS backend listening on http://localhost:${env.port} (${env.nodeEnv})`);
    // eslint-disable-next-line no-console
    console.log(`[api] CORS allowlist: ${env.corsOrigins.join(', ')}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    // eslint-disable-next-line no-console
    console.log(`\n[api] ${signal} received, shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] Fatal startup error:', err);
  process.exit(1);
});
