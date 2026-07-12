'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEffect } from 'react';

const vehicleSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  max_load_capacity: z.coerce.number().positive('Capacity must be positive'),
  odometer: z.coerce.number().nonnegative('Odometer cannot be negative'),
  acquisition_cost: z.coerce.number().nonnegative('Acquisition cost cannot be negative'),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().min(1, 'Region is required').nullable().or(z.string().length(0)),
});

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: z.infer<typeof vehicleSchema>) => Promise<void>;
  initialValues?: z.infer<typeof vehicleSchema>;
}

export default function VehicleForm({ isOpen, onClose, onSubmit, initialValues }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registration_number: '',
      name: '',
      type: '',
      max_load_capacity: 1000,
      odometer: 0,
      acquisition_cost: 0,
      status: 'Available' as const,
      region: '',
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        registration_number: initialValues.registration_number || '',
        name: initialValues.name || '',
        type: initialValues.type || '',
        max_load_capacity: initialValues.max_load_capacity || 0,
        odometer: initialValues.odometer || 0,
        acquisition_cost: initialValues.acquisition_cost || 0,
        status: initialValues.status || 'Available',
        region: initialValues.region || '',
      });
    } else {
      reset({
        registration_number: '',
        name: '',
        type: '',
        max_load_capacity: 1000,
        odometer: 0,
        acquisition_cost: 0,
        status: 'Available',
        region: '',
      });
    }
  }, [initialValues, reset, isOpen]);

  const handleFormSubmit = async (values: z.infer<typeof vehicleSchema>) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (e) {
      // toast shown in hook actions
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            {initialValues ? 'Edit Vehicle' : 'Add Vehicle'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {initialValues
              ? 'Update the details for this vehicle registry record.'
              : 'Add a new vehicle to the enterprise fleet.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="registration_number" className="text-zinc-300">Registration Number</Label>
              <Input
                id="registration_number"
                placeholder="e.g. MH-12-PQ-1234"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('registration_number')}
              />
              {errors.registration_number && (
                <p className="text-xs text-red-500 font-medium">{errors.registration_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-zinc-300">Vehicle Name / Model</Label>
              <Input
                id="name"
                placeholder="e.g. Tata Ultra"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-zinc-300">Vehicle Type</Label>
              <Input
                id="type"
                placeholder="e.g. HGV, LCV, Van"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('type')}
              />
              {errors.type && (
                <p className="text-xs text-red-500 font-medium">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max_load_capacity" className="text-zinc-300">Max Load Capacity (kg)</Label>
              <Input
                id="max_load_capacity"
                type="number"
                placeholder="e.g. 5000"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('max_load_capacity')}
              />
              {errors.max_load_capacity && (
                <p className="text-xs text-red-500 font-medium">{errors.max_load_capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="odometer" className="text-zinc-300">Odometer (km)</Label>
              <Input
                id="odometer"
                type="number"
                placeholder="e.g. 12000"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('odometer')}
              />
              {errors.odometer && (
                <p className="text-xs text-red-500 font-medium">{errors.odometer.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="acquisition_cost" className="text-zinc-300">Acquisition Cost (INR)</Label>
              <Input
                id="acquisition_cost"
                type="number"
                placeholder="e.g. 1500000"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('acquisition_cost')}
              />
              {errors.acquisition_cost && (
                <p className="text-xs text-red-500 font-medium">{errors.acquisition_cost.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-zinc-300">Vehicle Status</Label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50"
                disabled={isSubmitting}
                {...register('status')}
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
              {errors.status && (
                <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="region" className="text-zinc-300">Region</Label>
              <Input
                id="region"
                placeholder="e.g. North, South-East"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('region')}
              />
              {errors.region && (
                <p className="text-xs text-red-500 font-medium">{errors.region.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isSubmitting ? 'Saving...' : 'Save Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
