import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service';
import { eligibilityService } from '../services/eligibility.service';
import { createTripSchema, completeTripSchema } from '../validators/validators';

export class TripController {
  /**
   * Get list of currently eligible vehicles and drivers for dispatch
   */
  async getEligibilityData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await eligibilityService.getEligibilityData();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new trip in Draft status
   */
  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedBody = createTripSchema.parse(req.body);
      const trip = await tripService.createTrip(parsedBody);
      res.status(201).json({
        success: true,
        message: 'Trip created successfully as Draft',
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dispatch an existing draft trip
   */
  async dispatchTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }
      const trip = await tripService.dispatchTrip(id);
      res.status(200).json({
        success: true,
        message: 'Trip dispatched successfully. Vehicle and driver status updated to On Trip.',
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete an active dispatched trip
   */
  async completeTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }
      const parsedBody = completeTripSchema.parse(req.body);
      const trip = await tripService.completeTrip(id, parsedBody);
      res.status(200).json({
        success: true,
        message: 'Trip completed successfully. Vehicle and driver status restored to Available.',
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an active or draft trip
   */
  async cancelTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Trip ID is required' });
        return;
      }
      const trip = await tripService.cancelTrip(id);
      res.status(200).json({
        success: true,
        message: 'Trip cancelled successfully.',
        data: trip
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all trips with pagination and filtering
   */
  async listTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await tripService.listTrips({ page, limit, status, search });
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Trip module KPIs for dashboard display
   */
  async getTripKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const kpis = await tripService.getTripKPIs();
      res.status(200).json({
        success: true,
        data: kpis
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tripController = new TripController();
