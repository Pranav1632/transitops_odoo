'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const driverFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_category: z.string().min(1, 'License category is required'),
  license_expiry: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid license expiry date',
  }),
  contact_number: z.string().nullable().transform((val) => val === '' ? null : val),
  safety_score: z.coerce.number().min(0, 'Safety score cannot be negative').max(100, 'Safety score cannot exceed 100'),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
  driver?: any; // If provided, we are in edit mode
  onSubmit: (values: DriverFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function DriverForm({ driver, onSubmit, onCancel, loading }: DriverFormProps) {
  const isEditMode = !!driver;

  // Format date to YYYY-MM-DD for standard date input binding
  const formattedExpiry = driver?.license_expiry
    ? new Date(driver.license_expiry).toISOString().split('T')[0]
    : '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema) as any,
    defaultValues: {
      name: driver?.name || '',
      license_number: driver?.license_number || '',
      license_category: driver?.license_category || '',
      license_expiry: formattedExpiry,
      contact_number: driver?.contact_number || '',
      safety_score: driver?.safety_score !== undefined ? Number(driver.safety_score) : 100,
      status: driver?.status || 'Available',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300">Driver Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. John Doe"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_number" className="text-zinc-300">License Number</Label>
          <Input
            id="license_number"
            type="text"
            placeholder="e.g. DL-12345678"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 uppercase"
            disabled={loading}
            {...register('license_number')}
          />
          {errors.license_number && (
            <p className="text-xs text-red-500 font-medium">{errors.license_number.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="license_category" className="text-zinc-300">License Category</Label>
          <Input
            id="license_category"
            type="text"
            placeholder="e.g. Commercial Class A"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('license_category')}
          />
          {errors.license_category && (
            <p className="text-xs text-red-500 font-medium">{errors.license_category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_expiry" className="text-zinc-300">License Expiry Date</Label>
          <Input
            id="license_expiry"
            type="date"
            className="bg-zinc-950 border-zinc-800 text-white"
            disabled={loading}
            {...register('license_expiry')}
          />
          {errors.license_expiry && (
            <p className="text-xs text-red-500 font-medium">{errors.license_expiry.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_number" className="text-zinc-300">Contact Number (Optional)</Label>
          <Input
            id="contact_number"
            type="text"
            placeholder="e.g. +1 555-0199"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('contact_number')}
          />
          {errors.contact_number && (
            <p className="text-xs text-red-500 font-medium">{errors.contact_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="safety_score" className="text-zinc-300">Safety Score (0 - 100)</Label>
          <Input
            id="safety_score"
            type="number"
            placeholder="100"
            className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500"
            disabled={loading}
            {...register('safety_score')}
          />
          {errors.safety_score && (
            <p className="text-xs text-red-500 font-medium">{errors.safety_score.message}</p>
          )}
        </div>
      </div>

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
          <option value="Off Duty">Off Duty</option>
          <option value="Suspended">Suspended</option>
        </select>
        {errors.status && (
          <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>
        )}
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
          {loading ? 'Saving...' : isEditMode ? 'Update Driver' : 'Add Driver'}
        </Button>
      </div>
    </form>
  );
}
