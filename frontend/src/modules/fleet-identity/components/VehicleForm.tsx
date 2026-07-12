'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const vehicleFormSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  max_load_capacity: z.coerce.number().positive('Max load capacity must be greater than 0'),
  odometer: z.coerce.number().nonnegative('Odometer cannot be negative'),
  acquisition_cost: z.coerce.number().nonnegative('Acquisition cost cannot be negative'),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().nullable().transform((val) => val === '' ? null : val),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  vehicle?: any; // If provided, we are in edit mode
  onSubmit: (values: VehicleFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function VehicleForm({ vehicle, onSubmit, onCancel, loading }: VehicleFormProps) {
  const isEditMode = !!vehicle;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema) as any,
    defaultValues: {
      registration_number: vehicle?.registration_number || '',
      name: vehicle?.name || '',
      type: vehicle?.type || '',
      max_load_capacity: vehicle?.max_load_capacity || 0,
      odometer: vehicle?.odometer || 0,
      acquisition_cost: vehicle?.acquisition_cost || 0,
      status: vehicle?.status || 'Available',
      region: vehicle?.region || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="registration_number" className="text-zinc-300">Registration Number</Label>
          <Input
            id="registration_number"
            type="text"
            placeholder="e.g. TRK-1002"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 uppercase"
            disabled={loading}
            {...register('registration_number')}
          />
          {errors.registration_number && (
            <p className="text-xs text-red-500 font-medium">{errors.registration_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">Vehicle Name / Label</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Kenworth T680"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type" className="text-zinc-300">Vehicle Type</Label>
          <Input
            id="type"
            type="text"
            placeholder="e.g. Heavy Duty Truck, Van"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('type')}
          />
          {errors.type && (
            <p className="text-xs text-red-500 font-medium">{errors.type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_load_capacity" className="text-zinc-300">Max Load Capacity (kg)</Label>
          <Input
            id="max_load_capacity"
            type="number"
            step="any"
            placeholder="e.g. 15000"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('max_load_capacity')}
          />
          {errors.max_load_capacity && (
            <p className="text-xs text-red-500 font-medium">{errors.max_load_capacity.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="odometer" className="text-zinc-300">Odometer (km)</Label>
          <Input
            id="odometer"
            type="number"
            step="any"
            placeholder="e.g. 45000"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('odometer')}
          />
          {errors.odometer && (
            <p className="text-xs text-red-500 font-medium">{errors.odometer.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="acquisition_cost" className="text-zinc-300">Acquisition Cost ($)</Label>
          <Input
            id="acquisition_cost"
            type="number"
            step="any"
            placeholder="e.g. 85000"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('acquisition_cost')}
          />
          {errors.acquisition_cost && (
            <p className="text-xs text-red-500 font-medium">{errors.acquisition_cost.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-zinc-300">Status</Label>
          <select
            id="status"
            className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50"
            disabled={loading}
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

        <div className="space-y-2">
          <Label htmlFor="region" className="text-zinc-300">Region (Optional)</Label>
          <Input
            id="region"
            type="text"
            placeholder="e.g. North-West"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
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
          onClick={onCancel}
          disabled={loading}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-white text-black hover:bg-zinc-200 hover:text-black font-medium"
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
        </Button>
      </div>
    </form>
  );
}
