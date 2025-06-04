import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Eye, Pencil, Trash2, RefreshCw, X } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader
} from '@/components/ui/card';
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

const DeliveryZones = () => {
  const { toast } = useToast();
  const { restaurants: availableRestaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
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

  // Set default location to first restaurant if not set and restaurants are loaded
  useEffect(() => {
    if (!filterLocation && availableRestaurants.length > 0) {
      setFilterLocation(String(availableRestaurants[0].id));
    }
  }, [filterLocation, availableRestaurants]);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['deliveryZones', currentPage, pageSize, filterLocation, filterStatus, filterZoneType, zoneName],
    queryFn: () => {
      // Ensure we have a valid restaurant_id
      if (!filterLocation || (filterLocation === 'all' && availableRestaurants.length === 0)) {
        throw new Error('Please select a location');
      }

      return deliveryZonesApi.getDeliveryZones({
        page: currentPage,
        per_page: pageSize,
        restaurant_id: filterLocation === 'all' 
          ? availableRestaurants[0]?.id || 0 
          : Number(filterLocation),
        status: filterStatus === 'Active' ? 1 : filterStatus === 'Inactive' ? 0 : undefined,
        zone_type: filterZoneType === 'distance' ? 1 : filterZoneType === 'area' ? 2 : undefined,
        name: zoneName || undefined
      });
    },
    enabled: Boolean(availableRestaurants.length > 0), // Only enable when we have restaurants loaded
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });

  const zones = data?.data || [];
  const totalZones = data?.total || 0;

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Delivery zones have been refreshed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh delivery zones",
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
    if (window.confirm('Are you sure you want to delete this delivery zone?')) {
      setDeleteLoading(true);
      deleteMutation.mutate(id);
    }
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
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
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
      toast({ title: 'Success', description: 'Delivery zone deleted' });
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete', 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setDeleteLoading(false);
    }
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-64">
            <div className="relative">
              <Input 
                placeholder="Search by zone name..." 
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full"
              />
              {zoneName && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  onClick={() => setZoneName("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="w-64">
            <Select 
              value={filterLocation} 
              onValueChange={setFilterLocation}
            >
              <SelectTrigger>
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
          <div className="w-48">
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select 
              value={filterZoneType} 
              onValueChange={setFilterZoneType}
            >
              <SelectTrigger>
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

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddZone}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
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
        onSubmit={() => {}}
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
    </div>
  );
};

export default DeliveryZones;
