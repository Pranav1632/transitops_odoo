import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { tripApi, Trip, CreateTripInput, CompleteTripInput, TripKPIs } from '../api/tripApi';
import { socket } from '../../../shared/lib/socket';

export const useTrips = (initialStatus?: string) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [kpis, setKpis] = useState<TripKPIs>({ activeTrips: 0, pendingTrips: 0 });
  const [loading, setLoading] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string>(initialStatus || 'All');
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Mutation states
  const [isMutating, setIsMutating] = useState(false);

  // Fetch KPI data
  const fetchKPIs = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await tripApi.getKPIs();
      setKpis(data);
    } catch (err: any) {
      console.error('Failed to fetch trip KPIs:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // Fetch Trips list
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = status === 'All' ? undefined : status;
      const searchParam = search.trim() ? search : undefined;

      const data = await tripApi.getTrips({
        page,
        limit,
        status: statusParam,
        search: searchParam
      });

      setTrips(data.trips);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to fetch trips';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  // Initial and reactive fetch
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Socket.io subscription for real-time live updates
  useEffect(() => {
    if (!socket) return;

    // Connect to server since autoConnect is false
    if (!socket.connected) {
      socket.connect();
    }

    // Join room or listen to events
    socket.emit('subscribe_trips');

    const handleTripUpdated = (updatedTrip: Trip) => {
      // 1. Refetch KPIs since they likely changed
      fetchKPIs();

      // 2. Proactively update trips state if it is on the current list page
      setTrips((prevTrips) => {
        const index = prevTrips.findIndex((t) => t.id === updatedTrip.id);
        if (index === -1) {
          // If not in the list but fits the current filter, refetch is best
          fetchTrips();
          return prevTrips;
        }

        const newTrips = [...prevTrips];
        newTrips[index] = {
          ...newTrips[index],
          ...updatedTrip
        };
        return newTrips;
      });

      toast.info(`Trip status updated: ${updatedTrip.status}`);
    };

    socket.on('trip_status_updated', handleTripUpdated);

    return () => {
      socket.emit('unsubscribe_trips');
      socket.off('trip_status_updated', handleTripUpdated);
      socket.disconnect();
    };
  }, [fetchTrips, fetchKPIs]);

  // Reset page when filters change
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  // Actions
  const createTrip = async (data: CreateTripInput) => {
    setIsMutating(true);
    try {
      const newTrip = await tripApi.createTrip(data);
      toast.success('Trip created successfully as Draft');
      fetchTrips();
      fetchKPIs();
      return newTrip;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create trip';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const dispatchTrip = async (id: string) => {
    setIsMutating(true);
    try {
      const updated = await tripApi.dispatchTrip(id);
      toast.success('Trip dispatched! Driver and Vehicle statuses are now On Trip.');
      fetchTrips();
      fetchKPIs();
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to dispatch trip';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const completeTrip = async (id: string, data: CompleteTripInput) => {
    setIsMutating(true);
    try {
      const updated = await tripApi.completeTrip(id, data);
      toast.success('Trip completed! Driver and Vehicle are now Available.');
      fetchTrips();
      fetchKPIs();
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to complete trip';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const cancelTrip = async (id: string) => {
    setIsMutating(true);
    try {
      const updated = await tripApi.cancelTrip(id);
      toast.success('Trip cancelled.');
      fetchTrips();
      fetchKPIs();
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to cancel trip';
      toast.error(errMsg);
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    trips,
    kpis,
    loading,
    kpiLoading,
    error,
    page,
    totalPages,
    totalItems,
    status,
    search,
    isMutating,
    setPage,
    handleStatusChange,
    handleSearchChange,
    createTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    refetch: fetchTrips
  };
};
export default useTrips;
