import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { tripApi, EligibleVehicle, EligibleDriver } from '../api/tripApi';

const formSchema = z.object({
  source: z.string().trim().min(1, 'Source location is required'),
  destination: z.string().trim().min(1, 'Destination location is required'),
  vehicle_id: z.string().min(1, 'Vehicle selection is required'),
  driver_id: z.string().min(1, 'Driver selection is required'),
  cargo_weight: z.coerce.number().positive('Cargo weight must be positive'),
  planned_distance: z.coerce.number().positive('Planned distance must be positive')
});

type FormValues = z.infer<typeof formSchema>;

interface TripFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onSubmitTrip: (data: FormValues) => Promise<any>;
  isSubmitting: boolean;
}

export const TripForm: React.FC<TripFormProps> = ({
  onSuccess,
  onCancel,
  onSubmitTrip,
  isSubmitting
}) => {
  const [vehicles, setVehicles] = useState<EligibleVehicle[]>([]);
  const [drivers, setDrivers] = useState<EligibleDriver[]>([]);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: '',
      destination: '',
      vehicle_id: '',
      driver_id: '',
      cargo_weight: 0,
      planned_distance: 0
    }
  });

  const selectedVehicleId = watch('vehicle_id');
  const cargoWeight = watch('cargo_weight');

  // Find currently selected vehicle to check capacity
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const isOverweight =
    selectedVehicle && cargoWeight > 0 && cargoWeight > selectedVehicle.max_load_capacity;

  useEffect(() => {
    const fetchEligibility = async () => {
      setEligibilityLoading(true);
      setEligibilityError(null);
      try {
        const data = await tripApi.getEligibility();
        setVehicles(data.vehicles);
        setDrivers(data.drivers);
      } catch (err: any) {
        setEligibilityError(err.message || 'Failed to load eligible vehicles and drivers');
      } finally {
        setEligibilityLoading(false);
      }
    };
    fetchEligibility();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      await onSubmitTrip(values);
      onSuccess();
    } catch (err) {
      // Error handled by hook toasts
    }
  };

  if (eligibilityLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
        <p className="text-sm text-neutral-400">Loading eligible vehicles and drivers...</p>
      </div>
    );
  }

  if (eligibilityError) {
    return (
      <div className="p-4 border border-red-800 bg-red-950/20 text-red-400 rounded-lg text-sm flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{eligibilityError}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Locations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Source</label>
          <input
            {...register('source')}
            placeholder="e.g. Warehouse A"
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white placeholder-neutral-500 transition-all"
          />
          {errors.source && <span className="text-xs text-red-500 mt-0.5">{errors.source.message}</span>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Destination</label>
          <input
            {...register('destination')}
            placeholder="e.g. Distribution Center B"
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white placeholder-neutral-500 transition-all"
          />
          {errors.destination && <span className="text-xs text-red-500 mt-0.5">{errors.destination.message}</span>}
        </div>
      </div>

      {/* Vehicle selection */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Vehicle</label>
        <select
          {...register('vehicle_id')}
          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white transition-all appearance-none cursor-pointer"
        >
          <option value="">-- Select Available Vehicle --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.registration_number}) - Cap: {v.max_load_capacity}kg
            </option>
          ))}
        </select>
        {errors.vehicle_id && <span className="text-xs text-red-500 mt-0.5">{errors.vehicle_id.message}</span>}
      </div>

      {/* Driver selection */}
      <div className="flex flex-col space-y-1.5">
        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Driver</label>
        <select
          {...register('driver_id')}
          className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white transition-all appearance-none cursor-pointer"
        >
          <option value="">-- Select Available Driver --</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.license_category})
            </option>
          ))}
        </select>
        {errors.driver_id && <span className="text-xs text-red-500 mt-0.5">{errors.driver_id.message}</span>}
      </div>

      {/* Cargo & Distance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Cargo Weight (kg)</label>
          <input
            type="number"
            {...register('cargo_weight')}
            placeholder="e.g. 500"
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white placeholder-neutral-500 transition-all"
          />
          {errors.cargo_weight && <span className="text-xs text-red-500 mt-0.5">{errors.cargo_weight.message}</span>}
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Planned Distance (km)</label>
          <input
            type="number"
            {...register('planned_distance')}
            placeholder="e.g. 120"
            className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white placeholder-neutral-500 transition-all"
          />
          {errors.planned_distance && <span className="text-xs text-red-500 mt-0.5">{errors.planned_distance.message}</span>}
        </div>
      </div>

      {/* Capacity Warning Banner */}
      {isOverweight && (
        <div className="p-3 bg-amber-950/20 border border-amber-900 text-amber-300 rounded-md flex items-start space-x-2 text-xs transition-all animate-pulse">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Capacity Warning!</span>
            The entered cargo weight ({cargoWeight}kg) exceeds the maximum capacity of the selected vehicle ({selectedVehicle.max_load_capacity}kg). Submission will be blocked on the server.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium border border-neutral-800 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isOverweight}
          className="px-4 py-2 text-sm font-medium bg-white text-black hover:bg-neutral-200 rounded-md disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed flex items-center space-x-2 transition-all cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Create Trip</span>
        </button>
      </div>
    </form>
  );
};
export default TripForm;
