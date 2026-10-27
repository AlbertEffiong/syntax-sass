import express, { Application } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { csrfProtection } from './middleware/csrf';
import { apiRateLimiter } from './middleware/rateLimit';
import { requestContext, requestLogger } from './middleware/requestContext';
import { sanitizeInput } from './middleware/sanitize';
import { errorHandler, notFoundHandler } from './middleware/error';
import routes from './routes';

/**
 * Builds and configures the Express application. Kept separate from the server
 * bootstrap so it can be imported directly by integration tests.
 */
export function createApp(): Application {
  const app = express();

  // Trust the first proxy so rate limiting and secure cookies behave correctly
  // behind a load balancer / reverse proxy.
  app.set('trust proxy', 1);
  // Use the simple query parser to avoid deep-object query-string attacks.
  app.set('query parser', 'simple');
  app.disable('x-powered-by');

  // --- Request correlation + logging ---
  app.use(requestContext);
  app.use(requestLogger);

  // --- Security headers (XSS, clickjacking, sniffing, etc.) ---
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          // A JSON API never needs to be framed.
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  // --- Strict CORS allowlist ---
  const corsOptions: CorsOptions = {
    origin(origin, callback) {
      // Allow same-origin / server-to-server requests (no Origin header).
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Reject silently; the browser enforces the missing CORS headers.
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  };
  app.use(cors(corsOptions));

  // --- Body + cookie parsing ---
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // --- NoSQL operator-injection guard (runs before validation/routes) ---
  app.use(sanitizeInput);

  // --- Global rate limiter + CSRF for cookie-authenticated mutations ---
  app.use(apiRateLimiter);
  app.use(csrfProtection);

  // --- Health / readiness checks ---
  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
  });

  app.get('/ready', (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res
      .status(dbReady ? 200 : 503)
      .json({ success: dbReady, data: { db: dbReady ? 'connected' : 'disconnected' } });
  });

  // --- API routes ---
  app.use('/api', routes);

  // --- 404 + central error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
