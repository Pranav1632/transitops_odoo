import { Request, Response } from 'express';
import { z } from 'zod';
import * as vehicleService from '../services/vehicle.service';
import { redisClient } from '../../../shared/redis/client';

const vehicleCreateSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  max_load_capacity: z.coerce.number().positive('Max load capacity must be greater than 0'),
  odometer: z.coerce.number().nonnegative('Odometer cannot be negative').optional(),
  acquisition_cost: z.coerce.number().nonnegative('Acquisition cost cannot be negative').optional(),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']).optional(),
  region: z.string().nullable().optional(),
});

const vehicleUpdateSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  max_load_capacity: z.coerce.number().positive('Max load capacity must be greater than 0'),
  odometer: z.coerce.number().nonnegative('Odometer cannot be negative'),
  acquisition_cost: z.coerce.number().nonnegative('Acquisition cost cannot be negative'),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().nullable(),
});

// Cache key helper
async function invalidateKpisCache() {
  try {
    await redisClient.del('fleet:kpis');
  } catch (error) {
    console.error('Failed to invalidate Redis KPIs cache:', error);
  }
}

// RBAC validation helper
function checkFleetManagerRole(req: Request, res: Response): boolean {
  if (req.context?.role !== 'fleet_manager') {
    res.status(403).json({ error: 'Forbidden: Only fleet managers are authorized to perform this operation' });
    return false;
  }
  return true;
}

export async function listVehicles(req: Request, res: Response) {
  try {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      type: req.query.type as string,
      status: req.query.status as string,
      region: req.query.region as string,
      search: req.query.search as string,
    };

    const result = await vehicleService.getVehicles(filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error listing vehicles:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getVehicle(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const vehicle = await vehicleService.getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    return res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createVehicle(req: Request, res: Response) {
  try {
    if (!checkFleetManagerRole(req, res)) return;

    const validatedData = vehicleCreateSchema.parse(req.body);
    const vehicle = await vehicleService.createVehicle(validatedData);

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(201).json(vehicle);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    if (error.message.startsWith('UNIQUE_VIOLATION:')) {
      return res.status(409).json({ error: error.message.replace('UNIQUE_VIOLATION: ', '') });
    }
    console.error('Error creating vehicle:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateVehicle(req: Request, res: Response) {
  try {
    if (!checkFleetManagerRole(req, res)) return;

    const id = req.params.id as string;
    const validatedData = vehicleUpdateSchema.parse(req.body);
    
    const vehicle = await vehicleService.updateVehicle(id, validatedData);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(200).json(vehicle);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    if (error.message && error.message.startsWith('UNIQUE_VIOLATION:')) {
      return res.status(409).json({ error: error.message.replace('UNIQUE_VIOLATION: ', '') });
    }
    console.error('Error updating vehicle:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteVehicle(req: Request, res: Response) {
  try {
    if (!checkFleetManagerRole(req, res)) return;

    const id = req.params.id as string;
    const deleted = await vehicleService.deleteVehicle(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    if (error.message && error.message.startsWith('FOREIGN_KEY_VIOLATION:')) {
      return res.status(400).json({ error: error.message.replace('FOREIGN_KEY_VIOLATION: ', '') });
    }
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
