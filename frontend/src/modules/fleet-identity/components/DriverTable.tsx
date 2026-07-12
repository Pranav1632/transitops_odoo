'use client';

import { useState } from 'react';
import { useDrivers } from '../hooks/useDrivers';
import { useSession } from '../../../shared/hooks/useSession';
import DriverForm from './DriverForm';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export default function DriverTable() {
  const { profile } = useSession();
  
  // Auth write permissions: allowed for fleet_manager or safety_officer
  const isAuthorized = profile?.role === 'fleet_manager' || profile?.role === 'safety_officer';

  const {
    drivers,
    loading,
    page,
    setPage,
    totalPages,
    totalItems,
    filters,
    actions,
  } = useDrivers();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Status Badge color mapper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Available</Badge>;
      case 'On Trip':
        return <Badge className="bg-sky-500/10 text-sky-500 border-sky-500/20">On Trip</Badge>;
      case 'Off Duty':
        return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Off Duty</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Expiry styling mapper
  const getExpiryElement = (driver: any) => {
    const dateStr = new Date(driver.license_expiry).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    if (driver.is_expired) {
      return (
        <span className="flex items-center gap-1 text-red-500 font-semibold">
          <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
          {dateStr} (Expired)
        </span>
      );
    }

    if (driver.days_until_expiry <= 30) {
      return (
        <span className="flex items-center gap-1 text-amber-500 font-medium">
          <AlertTriangle className="h-3.5 w-3.5" />
          {dateStr} ({driver.days_until_expiry}d left)
        </span>
      );
    }

    return <span className="text-zinc-300">{dateStr}</span>;
  };

  // Safety score styling mapper
  const getSafetyScoreElement = (score: number) => {
    const numScore = Number(score);
    let colorClass = 'text-zinc-300';
    if (numScore >= 90) colorClass = 'text-emerald-400 font-semibold';
    else if (numScore >= 70) colorClass = 'text-amber-400 font-medium';
    else colorClass = 'text-red-400 font-bold';

    return <span className={colorClass}>{numScore}/100</span>;
  };

  const handleAddSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      await actions.addDriver(values);
      setIsAddOpen(false);
    } catch (err) {
      // Error handled by hook toasts
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!selectedDriver) return;
    setFormLoading(true);
    try {
      await actions.editDriver(selectedDriver.id, values);
      setIsEditOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      // Error handled by hook toasts
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this driver?')) {
      try {
        await actions.removeDriver(id);
      } catch (err) {
        // Error handled by hook toasts
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Driver Management</h1>
          <p className="text-sm text-zinc-400">Manage work assignments, license alerts, and safety logs.</p>
        </div>
        {isAuthorized && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-white text-black hover:bg-zinc-200 font-medium"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Driver
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-md">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name or license number..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 text-sm focus-visible:ring-zinc-700"
            value={filters.search}
            onChange={(e) => {
              filters.setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-700"
            value={filters.status}
            onChange={(e) => {
              filters.setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Off Duty">Off Duty</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl overflow-hidden backdrop-blur-md">
        <Table>
          <TableHeader className="bg-zinc-900/60 border-b border-zinc-850">
            <TableRow className="hover:bg-transparent border-zinc-850">
              <TableHead className="text-zinc-400 font-medium px-4">Name</TableHead>
              <TableHead className="text-zinc-400 font-medium">License Number</TableHead>
              <TableHead className="text-zinc-400 font-medium">Category</TableHead>
              <TableHead className="text-zinc-400 font-medium">License Expiry</TableHead>
              <TableHead className="text-zinc-400 font-medium">Contact Number</TableHead>
              <TableHead className="text-zinc-400 font-medium">Safety Score</TableHead>
              <TableHead className="text-zinc-400 font-medium">Status</TableHead>
              {isAuthorized && <TableHead className="text-zinc-400 font-medium text-right px-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="border-zinc-850">
                  <TableCell className="px-4"><Skeleton className="h-4 w-28 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-zinc-800" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 bg-zinc-800 rounded-full" /></TableCell>
                  {isAuthorized && <TableCell className="text-right px-4"><Skeleton className="h-8 w-16 ml-auto bg-zinc-800" /></TableCell>}
                </TableRow>
              ))
            ) : drivers.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={isAuthorized ? 8 : 7} className="h-32 text-center text-zinc-500">
                  No drivers found.
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((driver) => (
                <TableRow key={driver.id} className="border-zinc-850 hover:bg-zinc-900/30">
                  <TableCell className="font-semibold text-white px-4">{driver.name}</TableCell>
                  <TableCell className="text-zinc-300 uppercase">{driver.license_number}</TableCell>
                  <TableCell className="text-zinc-300">{driver.license_category}</TableCell>
                  <TableCell>{getExpiryElement(driver)}</TableCell>
                  <TableCell className="text-zinc-300">{driver.contact_number || '—'}</TableCell>
                  <TableCell>{getSafetyScoreElement(driver.safety_score)}</TableCell>
                  <TableCell>{getStatusBadge(driver.status)}</TableCell>
                  {isAuthorized && (
                    <TableCell className="text-right px-4 space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        onClick={() => {
                          setSelectedDriver(driver);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(driver.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-sm text-zinc-500">
            Showing <span className="font-medium text-zinc-400">{drivers.length}</span> of{' '}
            <span className="font-medium text-zinc-400">{totalItems}</span> drivers
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-850 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-850 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Driver Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Add New Driver</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <DriverForm
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddOpen(false)}
              loading={formLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-lg text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Edit Driver Details</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {selectedDriver && (
              <DriverForm
                driver={selectedDriver}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setIsEditOpen(false);
                  setSelectedDriver(null);
                }}
                loading={formLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
