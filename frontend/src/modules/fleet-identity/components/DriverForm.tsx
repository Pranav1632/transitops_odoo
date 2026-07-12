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

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_category: z.string().min(1, 'License category is required'),
  license_expiry: z.string().min(1, 'License expiry is required'),
  contact_number: z.string().optional(),
  safety_score: z.coerce.number().min(0, 'Safety score must be at least 0').max(100, 'Safety score cannot exceed 100'),
  status: z.enum(['Available', 'On Trip', 'Off Duty', 'Suspended']),
});

interface DriverFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  initialValues?: any;
}

export default function DriverForm({ isOpen, onClose, onSubmit, initialValues }: DriverFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: '',
      license_number: '',
      license_category: '',
      license_expiry: '',
      contact_number: '',
      safety_score: 100,
      status: 'Available' as const,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name || '',
        license_number: initialValues.license_number || '',
        license_category: initialValues.license_category || '',
        license_expiry: initialValues.license_expiry ? initialValues.license_expiry.split('T')[0] : '',
        contact_number: initialValues.contact_number || '',
        safety_score: initialValues.safety_score ?? 100,
        status: initialValues.status || 'Available',
      });
    } else {
      reset({
        name: '',
        license_number: '',
        license_category: '',
        license_expiry: '',
        contact_number: '',
        safety_score: 100,
        status: 'Available',
      });
    }
  }, [initialValues, reset, isOpen]);

  const handleFormSubmit = async (values: z.infer<typeof driverSchema>) => {
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
            {initialValues ? 'Edit Driver' : 'Add Driver'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            {initialValues
              ? 'Update the license details and status for this driver.'
              : 'Add a new driver to the registry list.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name" className="text-zinc-300">Driver Name</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
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
              <Label htmlFor="license_number" className="text-zinc-300">License Number</Label>
              <Input
                id="license_number"
                placeholder="e.g. DL-123456789"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('license_number')}
              />
              {errors.license_number && (
                <p className="text-xs text-red-500 font-medium">{errors.license_number.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="license_category" className="text-zinc-300">License Category</Label>
              <Input
                id="license_category"
                placeholder="e.g. Class A, Class B"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('license_category')}
              />
              {errors.license_category && (
                <p className="text-xs text-red-500 font-medium">{errors.license_category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="license_expiry" className="text-zinc-300">License Expiry Date</Label>
              <Input
                id="license_expiry"
                type="date"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('license_expiry')}
              />
              {errors.license_expiry && (
                <p className="text-xs text-red-500 font-medium">{errors.license_expiry.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_number" className="text-zinc-300">Contact Number</Label>
              <Input
                id="contact_number"
                placeholder="e.g. +91 98765 43210"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('contact_number')}
              />
              {errors.contact_number && (
                <p className="text-xs text-red-500 font-medium">{errors.contact_number.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="safety_score" className="text-zinc-300">Safety Score (0 - 100)</Label>
              <Input
                id="safety_score"
                type="number"
                placeholder="e.g. 95"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={isSubmitting}
                {...register('safety_score')}
              />
              {errors.safety_score && (
                <p className="text-xs text-red-500 font-medium">{errors.safety_score.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-zinc-300">Driver Status</Label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50"
                disabled={isSubmitting}
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
              {isSubmitting ? 'Saving...' : 'Save Driver'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
