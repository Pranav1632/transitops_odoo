import { Router } from 'express';
import { tripController } from './controllers/trip.controller.js';

const router = Router();

// Eligibility routes for fetching available vehicles and drivers
router.get('/eligibility', tripController.getEligibilityData.bind(tripController));

// KPI widgets for Dashboard
router.get('/kpis', tripController.getTripKPIs.bind(tripController));

// Core CRUD and status transition routes
router.get('/', tripController.listTrips.bind(tripController));
router.post('/', tripController.createTrip.bind(tripController));
router.patch('/:id/dispatch', tripController.dispatchTrip.bind(tripController));
router.patch('/:id/complete', tripController.completeTrip.bind(tripController));
router.patch('/:id/cancel', tripController.cancelTrip.bind(tripController));

export default router;
