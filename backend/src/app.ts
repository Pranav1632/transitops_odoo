import express from 'express';
import cors from 'cors';
import { rateLimiter } from './shared/middleware/rateLimiter';
import { compressionMiddleware } from './shared/middleware/compression';
import { errorHandler } from './shared/middleware/errorHandler';
import fleetRouter from './modules/fleet-identity/routes';
import tripsRouter from './modules/trip-ops/routes';
import financeRouter from './modules/maintenance-finance/routes';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(compressionMiddleware);
app.use(rateLimiter);

// Mount routers
app.use('/api/v1/fleet', fleetRouter);
app.use('/api/v1/trips', tripsRouter);
app.use('/api/v1/finance', financeRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
