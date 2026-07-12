import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout } from './controllers/auth.controller';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from './controllers/vehicle.controller';
import {
  listDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} from './controllers/driver.controller';
import { getFleetKpis } from './controllers/dashboard.controller';
import { authMiddleware } from '../../shared/middleware/auth';

const router = Router();

// Rate limiter for login endpoint: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

// Auth Routes
router.post('/auth/signup', signup);
router.post('/auth/login', loginLimiter, login);
router.post('/auth/logout', authMiddleware, logout);

// Vehicle Registry Routes
router.get('/vehicles', authMiddleware, listVehicles);
router.get('/vehicles/:id', authMiddleware, getVehicle);
router.post('/vehicles', authMiddleware, createVehicle);
router.put('/vehicles/:id', authMiddleware, updateVehicle);
router.delete('/vehicles/:id', authMiddleware, deleteVehicle);

// Driver Registry Routes
router.get('/drivers', authMiddleware, listDrivers);
router.get('/drivers/:id', authMiddleware, getDriver);
router.post('/drivers', authMiddleware, createDriver);
router.put('/drivers/:id', authMiddleware, updateDriver);
router.delete('/drivers/:id', authMiddleware, deleteDriver);

// Dashboard KPI Route
router.get('/kpis', authMiddleware, getFleetKpis);

// Placeholder health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'fleet-identity' });
});

export default router;


