import React, { useState } from 'react';
import { Check, Loader2, Navigation, Flag, Ban, X } from 'lucide-react';
import { Trip, CompleteTripInput } from '../api/tripApi';

interface TripLifecycleStepperProps {
  trip: Trip;
  onDispatch: (id: string) => Promise<any>;
  onComplete: (id: string, data: CompleteTripInput) => Promise<any>;
  onCancel: (id: string) => Promise<any>;
  isMutating: boolean;
}

export const TripLifecycleStepper: React.FC<TripLifecycleStepperProps> = ({
  trip,
  onDispatch,
  onComplete,
  onCancel,
  isMutating
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');
  const [revenue, setRevenue] = useState('');
  const [validationError, setValidationError] = useState('');

  const statuses: Trip['status'][] = ['Draft', 'Dispatched', 'Completed'];
  const isCancelled = trip.status === 'Cancelled';

  const getStepIndex = (status: Trip['status']) => {
    if (status === 'Cancelled') return -1;
    return statuses.indexOf(status);
  };

  const currentStep = getStepIndex(trip.status);

  const handleDispatch = async () => {
    try {
      await onDispatch(trip.id);
    } catch (error) {
      // toast shown in hook
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await onCancel(trip.id);
      } catch (error) {
        // toast shown in hook
      }
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const dist = parseFloat(actualDistance);
    const fuel = parseFloat(fuelConsumed);
    const rev = parseFloat(revenue);

    if (isNaN(dist) || dist <= 0) {
      setValidationError('Actual distance must be a positive number');
      return;
    }
    if (isNaN(fuel) || fuel <= 0) {
      setValidationError('Fuel consumed must be a positive number');
      return;
    }
    if (isNaN(rev) || rev < 0) {
      setValidationError('Revenue must be greater than or equal to 0');
      return;
    }

    try {
      await onComplete(trip.id, {
        actual_distance: dist,
        fuel_consumed: fuel,
        revenue: rev
      });
      setShowCompleteModal(false);
      setActualDistance('');
      setFuelConsumed('');
      setRevenue('');
    } catch (error) {
      // toast shown in hook
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 bg-neutral-950/40 border border-neutral-900 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Trip Status Lifecycle
        </span>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            trip.status === 'Draft'
              ? 'bg-neutral-800 text-neutral-300'
              : trip.status === 'Dispatched'
              ? 'bg-blue-950/50 text-blue-400 border border-blue-900/50'
              : trip.status === 'Completed'
              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'
              : 'bg-red-950/50 text-red-400 border border-red-900/50'
          }`}
        >
          {trip.status}
        </span>
      </div>

      {/* Stepper Steps */}
      {!isCancelled ? (
        <div className="relative flex items-center justify-between w-full py-4">
          {/* Progress Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-800 -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-neutral-200 transition-all duration-300 -z-10"
            style={{
              width: `${(currentStep / (statuses.length - 1)) * 100}%`
            }}
          />

          {statuses.map((status, index) => {
            const isCompletedStep = currentStep >= index;
            const isActiveStep = currentStep === index;

            return (
              <div key={status} className="flex flex-col items-center space-y-1.5 bg-transparent">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all border ${
                    isCompletedStep
                      ? 'bg-white text-black border-white'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                  } ${isActiveStep ? 'ring-2 ring-neutral-400 ring-offset-2 ring-offset-black' : ''}`}
                >
                  {isCompletedStep && currentStep > index ? (
                    <Check className="w-4 h-4" />
                  ) : index === 0 ? (
                    <span>1</span>
                  ) : index === 1 ? (
                    <Navigation className="w-3.5 h-3.5" />
                  ) : (
                    <Flag className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium tracking-wide uppercase ${
                    isActiveStep
                      ? 'text-white'
                      : isCompletedStep
                      ? 'text-neutral-300'
                      : 'text-neutral-500'
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2 flex items-center space-x-2 text-red-400 text-xs">
          <Ban className="w-4 h-4" />
          <span>This trip has been cancelled. Vehicle and Driver statuses are available.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-900/60">
        {trip.status === 'Draft' && (
          <>
            <button
              onClick={handleCancel}
              disabled={isMutating}
              className="px-3 py-1.5 text-xs font-medium border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/50 rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              <Ban className="w-3 h-3" />
              <span>Cancel Trip</span>
            </button>
            <button
              onClick={handleDispatch}
              disabled={isMutating}
              className="px-3 py-1.5 text-xs font-medium bg-white text-black hover:bg-neutral-200 rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              {isMutating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Navigation className="w-3 h-3" />
              )}
              <span>Dispatch Trip</span>
            </button>
          </>
        )}

        {trip.status === 'Dispatched' && (
          <>
            <button
              onClick={handleCancel}
              disabled={isMutating}
              className="px-3 py-1.5 text-xs font-medium border border-neutral-800 text-neutral-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/50 rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              <Ban className="w-3 h-3" />
              <span>Cancel Trip</span>
            </button>
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={isMutating}
              className="px-3 py-1.5 text-xs font-medium bg-white text-black hover:bg-neutral-200 rounded transition-all cursor-pointer flex items-center space-x-1"
            >
              <Flag className="w-3 h-3" />
              <span>Complete Trip</span>
            </button>
          </>
        )}
      </div>

      {/* Complete Trip Modal Overlay */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
                <Flag className="w-4 h-4 text-emerald-400" />
                <span>Complete Trip Metrics</span>
              </h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-neutral-500 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Actual Distance Traveled (km)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 124.5"
                  value={actualDistance}
                  onChange={(e) => setActualDistance(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white transition-all"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Fuel Consumed (Liters)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 45.2"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white transition-all"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Revenue Generated ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1500"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-900 border border-neutral-800 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-400 text-white transition-all"
                />
              </div>

              {validationError && (
                <div className="text-xs text-red-500 font-medium">
                  {validationError}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-xs font-medium border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-4 py-2 text-xs font-medium bg-white text-black hover:bg-neutral-200 rounded disabled:bg-neutral-800 disabled:text-neutral-500 flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {isMutating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Completion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default TripLifecycleStepper;
