import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getDriversApi,
  createDriverApi,
  updateDriverApi,
  deleteDriverApi,
} from '../api/fleetApi';

export function useDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getDriversApi({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
      });
      setDrivers(result.data);
      setTotalPages(result.pagination.pages);
      setTotalItems(result.pagination.total);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const addDriver = async (data: any) => {
    try {
      const newDriver = await createDriverApi(data);
      toast.success('Driver added successfully');
      fetchDrivers();
      return newDriver;
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to add driver';
      toast.error(errMsg);
      throw err;
    }
  };

  const editDriver = async (id: string, data: any) => {
    try {
      const updatedDriver = await updateDriverApi(id, data);
      toast.success('Driver updated successfully');
      fetchDrivers();
      return updatedDriver;
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to update driver';
      toast.error(errMsg);
      throw err;
    }
  };

  const removeDriver = async (id: string) => {
    try {
      await deleteDriverApi(id);
      toast.success('Driver deleted successfully');
      fetchDrivers();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to delete driver';
      toast.error(errMsg);
      throw err;
    }
  };

  return {
    drivers,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    filters: {
      status,
      setStatus,
      search,
      setSearch,
    },
    actions: {
      addDriver,
      editDriver,
      removeDriver,
      refetch: fetchDrivers,
    },
  };
}
