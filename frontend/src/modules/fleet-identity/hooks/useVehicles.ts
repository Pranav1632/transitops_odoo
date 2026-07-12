import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '@/shared/types/database.types';
import {
  getVehiclesApi,
  createVehicleApi,
  updateVehicleApi,
  deleteVehicleApi,
} from '../api/fleetApi';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [region, setRegion] = useState<string>('');

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getVehiclesApi({
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
        region: region || undefined,
      });
      setVehicles(result.data);
      setTotalPages(result.pagination.pages);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, region]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      fetchVehicles();
    }
    return () => { mounted = false; };
  }, [fetchVehicles]);

  const addVehicle = async (data: CreateVehicleInput) => {
    try {
      const newVehicle = await createVehicleApi(data);
      toast.success('Vehicle added successfully');
      fetchVehicles();
      return newVehicle;
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to add vehicle';
      toast.error(errMsg);
      throw err;
    }
  };

  const editVehicle = async (id: string, data: UpdateVehicleInput) => {
    try {
      const updatedVehicle = await updateVehicleApi(id, data);
      toast.success('Vehicle updated successfully');
      fetchVehicles();
      return updatedVehicle;
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to update vehicle';
      toast.error(errMsg);
      throw err;
    }
  };

  const removeVehicle = async (id: string) => {
    try {
      await deleteVehicleApi(id);
      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Failed to delete vehicle';
      toast.error(errMsg);
      throw err;
    }
  };

  return {
    vehicles,
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
      region,
      setRegion,
    },
    actions: {
      addVehicle,
      editVehicle,
      removeVehicle,
      refetch: fetchVehicles,
    },
  };
}
