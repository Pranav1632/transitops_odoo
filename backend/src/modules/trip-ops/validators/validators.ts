import { z } from 'zod';

export const createTripSchema = z.object({
  source: z.string().trim().min(1, 'Source is required'),
  destination: z.string().trim().min(1, 'Destination is required'),
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  driver_id: z.string().uuid('Invalid driver ID'),
  cargo_weight: z.number().positive('Cargo weight must be greater than 0'),
  planned_distance: z.number().positive('Planned distance must be greater than 0')
});

export const completeTripSchema = z.object({
  actual_distance: z.number().positive('Actual distance must be greater than 0'),
  fuel_consumed: z.number().positive('Fuel consumed must be greater than 0'),
  revenue: z.number().nonnegative('Revenue must be greater than or equal to 0')
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type CompleteTripInput = z.infer<typeof completeTripSchema>;
