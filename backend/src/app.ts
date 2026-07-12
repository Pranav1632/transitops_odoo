import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { rateLimiter } from './shared/middleware/rateLimiter';
import { compressionMiddleware } from './shared/middleware/compression';
import { errorHandler } from './shared/middleware/errorHandler';
import fleetRouter from './modules/fleet-identity/routes';
import tripsRouter from './modules/trip-ops/routes';
import financeRouter from './modules/maintenance-finance/routes';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'backend_requests.log'), logMsg);
  } catch (e) {}
  next();
});

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
app.use((err: any, req: any, res: any, next: any) => {
  const errLog = `[${new Date().toISOString()}] ERROR: ${err.message}\nStack: ${err.stack}\n`;
  try {
    fs.appendFileSync(path.join(__dirname, 'backend_requests.log'), errLog);
  } catch (e) {}
  errorHandler(err, req, res, next);
});



export default app;

