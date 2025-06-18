import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  TablePagination
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { deliveryZonesApi, DeliveryZone } from '@/services/api/deliveryZones';
import { DeliveryZoneFormDialog } from "@/components/delivery-zones/AddDeliveryZoneDialog";
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { useAuth } from '@/hooks/use-auth';

const DeliveryZones = () => {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const { restaurants: availableRestaurants, isLoading: isLoadingRestaurants, refreshRestaurants } = useGetRestaurants();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  const [filterZoneType, setFilterZoneType] = useState<string>("");
  const [zoneName, setZoneName] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editZoneData, setEditZoneData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewZoneData, setViewZoneData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<number | null>(null);

  const queryClient = useQueryClient();
  
  // Create tenant-specific key for React Query cache
  const tenantKey = user?.id ? `tenant_${user.id}_${(user as any)?.restaurant_id || 'default'}` : 'anonymous';

  // Clear delivery zones cache when tenant changes
  useEffect(() => {
    
    queryClient.removeQueries({ queryKey: ['deliveryZones'] });
    
    // Reset filters to default when tenant changes
    setCurrentPage(1);
    setFilterLocation('');
    setFilterStatus('Active');
    setFilterZoneType('');
    setZoneName('');
  }, [tenantKey, queryClient]);

  // Force refresh restaurants when component mounts
  useEffect(() => {
    
    
    
    refreshRestaurants();
  }, []); // Empty dependency array to run only on mount

  // Debug log for restaurants data
  useEffect(() => {
    console.log('📊 Restaurants data updated:', {
      count: availableRestaurants.length,
      restaurants: availableRestaurants,
      isLoading: isLoadingRestaurants
    });
  }, [availableRestaurants, isLoadingRestaurants]);

  // Set default location to first restaurant if not set and restaurants are loaded
  useEffect(() => {
    if (!filterLocation && availableRestaurants.length > 0) {
      
      setFilterLocation(String(availableRestaurants[0].id));
    }
  }, [filterLocation, availableRestaurants, tenantKey]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['deliveryZones', tenantKey, currentPage, pageSize, filterLocation, filterStatus, filterZoneType, zoneName],
    queryFn: () => {
      // Ensure we have a valid restaurant_id and auth token
      if (!token) {
        throw new Error('Authentication required');
      }
      
      if (!filterLocation || (filterLocation === 'all' && availableRestaurants.length === 0)) {
        throw new Error('Please select a location');
      }

      
      
      return deliveryZonesApi.getDeliveryZones({
        page: currentPage,
        per_page: pageSize,
        restaurant_id: filterLocation === 'all' 
          ? Number(availableRestaurants[0]?.id) || 0 
          : Number(filterLocation),
        status: filterStatus === 'Active' ? 1 : filterStatus === 'Inactive' ? 0 : undefined,
        zone_type: filterZoneType === 'distance' ? 1 : filterZoneType === 'area' ? 2 : undefined,
        name: zoneName || undefined
      });
    },
    enabled: Boolean(token && availableRestaurants.length > 0 && filterLocation), // Only enable when we have auth and restaurants loaded
    staleTime: 0, // Always consider data stale to ensure fresh fetch after tenant switch
    gcTime: 0, // Don't cache data to prevent cross-tenant contamination
  });

  const zones = data?.data || [];
  const totalZones = data?.total || 0;

  const handleRefresh = async () => {
    try {
      
      // Refresh both delivery zones and restaurants
      refreshRestaurants(); // Force refresh restaurants
      await refetch(); // Refresh delivery zones
      toast({
        title: "Success",
        description: "Delivery zones and restaurants have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    }
  };

  const handleAddZone = () => {
    setAddDialogOpen(true);
  };

  const handleViewZone = (id: number) => {
    const zone = zones.find(z => z.id === id);
    setViewZoneData(zone);
    setViewDialogOpen(true);
  };

  const handleEditZone = (id: number) => {
    const zone = zones.find(z => z.id === id);
    setEditZoneData(zone);
    setEditDialogOpen(true);
  };

  const handleDeleteZone = (id: number) => {
    setZoneToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (zoneToDelete) {
      setDeleteLoading(true);
      deleteMutation.mutate(zoneToDelete);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const editMutation = useMutation({
    mutationFn: (data: any) => deliveryZonesApi.updateDeliveryZone(editZoneData.id, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Delivery zone updated' });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['deliveryZones', tenantKey] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update', 
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deliveryZonesApi.deleteDeliveryZone(id),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Delivery zone deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['deliveryZones', tenantKey] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete delivery zone', 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
    }
  });

  // Show loading if not authenticated
  if (!token) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Please log in to view delivery zones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        {/* Filter inputs */}
        <div className="grid gap-3 flex-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
          <div className="min-w-0">
            <Select 
              value={filterLocation} 
              onValueChange={setFilterLocation}
              disabled={isLoadingRestaurants}
            >
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableRestaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={String(restaurant.id)}>{restaurant.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0">
            <Input 
              placeholder="Search by zone name..." 
              value={zoneName} 
              onChange={(e) => setZoneName(e.target.value)}
              className="h-9 bg-white border border-gray-300 w-full"/>
          </div>
          <div className="min-w-0">
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-0">
            <Select 
              value={filterZoneType} 
              onValueChange={setFilterZoneType}
            >
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full">
                <SelectValue placeholder="Select Zone Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="distance">Distance Based</SelectItem>
                <SelectItem value="area">Area Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 xl:justify-end shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-9 w-9 border border-gray-300"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handleAddZone}
            className="bg-primary hover:bg-primary/90 text-white h-9 w-9 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border relative overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#0f172a] text-white rounded-t-lg overflow-hidden">
            <TableRow>
              <TableHead className="bg-[#0f172a] text-white rounded-tl-lg">Name</TableHead>
              <TableHead className="bg-[#0f172a] text-white">Description</TableHead>
              <TableHead className="bg-[#0f172a] text-white">Type</TableHead>
              <TableHead className="bg-[#0f172a] text-white">Status</TableHead>
              <TableHead className="bg-[#0f172a] text-white text-right rounded-tr-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading delivery zones...
                </TableCell>
              </TableRow>
            ) : zones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No delivery zones found
                </TableCell>
              </TableRow>
            ) : (
              zones.map((zone: DeliveryZone) => (
                <TableRow key={zone.id} className="bg-white p-0 m-0">
                  <TableCell className="align-middle font-semibold text-base text-gray-900 p-2">{zone.name}</TableCell>
                  <TableCell className="align-middle p-2">
                    <div className="text-sm text-gray-600">{zone.description}</div>
                    <div className="mt-1">
                      {zone.zone_type === 1 ? (
                        <span className="inline-block bg-gray-500 text-white text-xs rounded px-2 py-0.5">
                          Distance: {zone.from_distance} - {zone.to_distance} km
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-500 text-white text-xs rounded px-2 py-0.5">
                          Area: {zone.suburb}, {zone.postcode}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-middle p-2">
                    {zone.zone_type === 1 ? 'Distance Based' : 'Area Based'}
                  </TableCell>
                  <TableCell className="align-middle p-2">
                    <span className={zone.status === 1 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {zone.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right align-middle p-2">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewZone(zone.id)} title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditZone(zone.id)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteZone(zone.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalZones}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
      <DeliveryZoneFormDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        mode="add"
        onSubmit={() => {
          // Just invalidate queries, let React Query handle the refetch automatically
          queryClient.invalidateQueries({ 
            queryKey: ['deliveryZones', tenantKey],
            exact: false 
          });
        }}
        onClose={() => setAddDialogOpen(false)}
      />
      {editZoneData && (
        <DeliveryZoneFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          mode="edit"
          initialData={editZoneData}
          onSubmit={editMutation.mutate}
          onClose={() => setEditDialogOpen(false)}
        />
      )}
      {viewZoneData && (
        <DeliveryZoneFormDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          mode="view"
          initialData={viewZoneData}
          onSubmit={() => {}}
          onClose={() => setViewDialogOpen(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Delete Delivery Zone
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Are you sure, you want to delete delivery zone?</p>
              {zoneToDelete && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-gray-900">
                    Zone: {zones.find(z => z.id === zoneToDelete)?.name || 'Unknown Zone'}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryZones;
