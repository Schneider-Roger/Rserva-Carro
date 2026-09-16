import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { healthRouter } from './routes/health.routes.js';
import { devIdentityMiddleware } from './middlewares/devIdentity.middleware.js';
import { requireIdentity } from './middlewares/authz.middleware.js';
import { tenantMiddleware } from './middlewares/tenant.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const allowedOrigins = env.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origem não permitida pelo CORS.'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

app.use('/api/health', healthRouter);
app.use('/api', devIdentityMiddleware, requireIdentity, tenantMiddleware, apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
