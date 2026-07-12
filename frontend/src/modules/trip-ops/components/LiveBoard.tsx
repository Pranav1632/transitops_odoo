import React, { useEffect, useState } from 'react';
import { Loader2, Navigation, MapPin, Truck, User } from 'lucide-react';
import { tripApi, Trip } from '../api/tripApi';
import { socket } from '../../../shared/lib/socket';

export const LiveBoard: React.FC = () => {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await tripApi.getTrips({ status: 'Dispatched', limit: 50 });
        setActiveTrips(response.trips);
      } catch (err: any) {
        setError(err.message || 'Failed to load active dispatch board');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTrips();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Connect to server since autoConnect is false
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('subscribe_trips');

    const handleTripStatusUpdate = (trip: Trip) => {
      setActiveTrips((prevTrips) => {
        const exists = prevTrips.some((t) => t.id === trip.id);

        if (trip.status === 'Dispatched') {
          if (exists) {
            // Update details
            return prevTrips.map((t) => (t.id === trip.id ? { ...t, ...trip } : t));
          } else {
            // Prepend new active trip
            return [trip, ...prevTrips];
          }
        } else {
          // Remove from active board if status is no longer 'Dispatched'
          return prevTrips.filter((t) => t.id !== trip.id);
        }
      });
    };

    socket.on('trip_status_updated', handleTripStatusUpdate);

    return () => {
      socket.emit('unsubscribe_trips');
      socket.off('trip_status_updated', handleTripStatusUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col space-y-4 p-5 bg-neutral-950 border border-neutral-900 rounded-lg shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-blue-500" />
          <span>Live Dispatch Board</span>
        </h2>
        <div className="flex items-center space-x-1.5 bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Live Feed</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <Loader2 className="w-6 h-6 text-neutral-600 animate-spin" />
          <span className="text-xs text-neutral-500">Connecting to feed...</span>
        </div>
      ) : error ? (
        <div className="text-xs text-red-500 p-3 bg-red-950/10 border border-red-900/50 rounded-md">
          {error}
        </div>
      ) : activeTrips.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-neutral-900 rounded-md">
          <p className="text-xs text-neutral-500 font-medium">No vehicles currently in transit.</p>
          <p className="text-[10px] text-neutral-600 mt-1">Dispatched trips will appear here in real-time.</p>
        </div>
      ) : (
        <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
          {activeTrips.map((trip) => (
            <div
              key={trip.id}
              className="p-3 bg-neutral-900/60 border border-neutral-900 hover:border-neutral-800 rounded-md flex flex-col space-y-2.5 transition-all"
            >
              {/* Route */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-neutral-200">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{trip.source}</span>
                  <span className="text-neutral-600">→</span>
                  <span>{trip.destination}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {trip.planned_distance} km
                </span>
              </div>

              {/* Assignment details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                <div className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate">
                    {trip.vehicle_name || 'Vehicle'} ({trip.vehicle_registration || 'Unknown'})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="truncate">{trip.driver_name || 'Driver'}</span>
                </div>
              </div>

              {/* Status Bar */}
              <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-pulse" style={{ width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default LiveBoard;
