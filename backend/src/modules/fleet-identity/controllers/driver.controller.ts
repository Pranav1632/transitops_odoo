import { Request, Response } from 'express';
import { z } from 'zod';
import * as driverService from '../services/driver.service';
import { redisClient } from '../../../shared/redis/client';

const driverCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_category: z.string().min(1, 'License category is required'),
  license_expiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid license expiry date',
  }),
  contact_number: z.string().nullable().optional(),
  safety_score: z.coerce.number().min(0, 'Safety score cannot be negative').max(100, 'Safety score cannot exceed 100').optional(),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']).optional(),
});

const driverUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_category: z.string().min(1, 'License category is required'),
  license_expiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid license expiry date',
  }),
  contact_number: z.string().nullable(),
  safety_score: z.coerce.number().min(0, 'Safety score cannot be negative').max(100, 'Safety score cannot exceed 100'),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
});

// Cache key helper
async function invalidateKpisCache() {
  try {
    await redisClient.del('fleet:kpis');
  } catch (error) {
    console.error('Failed to invalidate Redis KPIs cache:', error);
  }
}

// RBAC validation helper: Allowed for fleet_manager or safety_officer
function checkWriteAuthorization(req: Request, res: Response): boolean {
  const allowedRoles = ['fleet_manager', 'safety_officer'];
  if (!req.context?.role || !allowedRoles.includes(req.context.role)) {
    res.status(403).json({ error: 'Forbidden: Only fleet managers and safety officers are authorized to perform this operation' });
    return false;
  }
  return true;
}

export async function listDrivers(req: Request, res: Response) {
  try {
    const filters = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      status: req.query.status as string,
      search: req.query.search as string,
    };

    const result = await driverService.getDrivers(filters);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error listing drivers:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getDriver(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const driver = await driverService.getDriverById(id);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    return res.status(200).json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function createDriver(req: Request, res: Response) {
  try {
    if (!checkWriteAuthorization(req, res)) return;

    const validatedData = driverCreateSchema.parse(req.body);
    const driver = await driverService.createDriver(validatedData);

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(201).json(driver);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    if (error.message.startsWith('UNIQUE_VIOLATION:')) {
      return res.status(409).json({ error: error.message.replace('UNIQUE_VIOLATION: ', '') });
    }
    console.error('Error creating driver:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    if (!checkWriteAuthorization(req, res)) return;

    const id = req.params.id as string;
    const validatedData = driverUpdateSchema.parse(req.body);

    const driver = await driverService.updateDriver(id, validatedData);
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(200).json(driver);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    if (error.message && error.message.startsWith('UNIQUE_VIOLATION:')) {
      return res.status(409).json({ error: error.message.replace('UNIQUE_VIOLATION: ', '') });
    }
    console.error('Error updating driver:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function deleteDriver(req: Request, res: Response) {
  try {
    if (!checkWriteAuthorization(req, res)) return;

    const id = req.params.id as string;
    const deleted = await driverService.deleteDriver(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Invalidate dashboard KPIs cache on write
    await invalidateKpisCache();

    return res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error: any) {
    if (error.message && error.message.startsWith('FOREIGN_KEY_VIOLATION:')) {
      return res.status(400).json({ error: error.message.replace('FOREIGN_KEY_VIOLATION: ', '') });
    }
    console.error('Error deleting driver:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
