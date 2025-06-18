import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Eye, RefreshCw, Trash, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useGetDeals } from "@/hooks/useGetDeals";
import { useGetDealTypes } from "@/hooks/useGetDealTypes";
import { Deal } from "@/services/api/deals";
import { format } from "date-fns";
import { CategoryPagination } from "@/components/categories/list/CategoryPagination";
import { AddEditDealDialog } from "@/components/deals/AddEditDealDialog";
import { dealsApi } from "@/services/api/deals";

const Deals = () => {
  // State
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [selectedDealTypeId, setSelectedDealTypeId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeOnly, setActiveOnly] = useState(false);
  const [currentOnly, setCurrentOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);
  const [viewOnly, setViewOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hooks
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const { dealTypes, isLoading: isLoadingDealTypes } = useGetDealTypes();
  const { toast } = useToast();
  console.log({ restaurants, isLoadingRestaurants })
  // Set the first restaurant as default when restaurants are loaded
  // useEffect(() => {
  //   console.log({ length: restaurants?.length > 0, selectedRestaurantId, isLoadingRestaurants })
  //   if (restaurants?.length > 0 && !selectedRestaurantId && !isLoadingRestaurants) {
  //     setSelectedRestaurantId(Number(restaurants[0].id));
  //   }
  // }, [restaurants?.length, selectedRestaurantId, isLoadingRestaurants]);

  useEffect(() => {
    // Only auto-select if we have restaurants and no restaurant is currently selected
    if (restaurants.length > 0 && selectedRestaurantId === null) {
      setSelectedRestaurantId(Number(restaurants[0].id));
    }
  }, [restaurants.length, selectedRestaurantId]); // Watch length and selection state

  console.log({  restaurants })
  // Fetch deals
  const { deals, totalItems, isLoading, refreshDeals } = useGetDeals({
    restaurantId: selectedRestaurantId || 0,
    activeOnly,
    currentOnly,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
    dealTypeId: selectedDealTypeId || undefined
  });

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    const newPageSize = size === 0 ? -1 : size;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle add new deal
  const handleAddNew = () => {
    setEditingDeal(undefined);
    setViewOnly(false);
    setIsDialogOpen(true);
  };

  // Handle edit deal
  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setViewOnly(false);
    setIsDialogOpen(true);
  };

  // Handle view deal
  const handleView = (deal: Deal) => {
    setEditingDeal(deal);
    setViewOnly(true);
    setIsDialogOpen(true);
  };

  // Handle delete deal
  const handleDelete = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  // Confirm delete deal
  const confirmDelete = async () => {
    if (!dealToDelete) return;
    
    setIsDeleting(true);
    try {
      await dealsApi.deleteDeal(dealToDelete.id);
      toast({
        title: "Deal deleted",
        description: "The deal has been deleted successfully.",
      });
      refreshDeals();
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the deal.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };

  // Handle form submit
  const handleFormSubmit = () => {
    // Dialog component will handle the API call and form submit
    setIsDialogOpen(false);
    refreshDeals();
  };

  // Handle refresh
  const handleRefresh = () => {
    toast({
      title: "Refreshing data",
      description: "Fetching the latest deals data."
    });
    refreshDeals();
  };

  // Filter deals by search query
  const filteredDeals = searchQuery
    ? deals.filter(deal =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.deal_type?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : deals;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Filter inputs */}
        <div className="grid gap-3 flex-1 sm:grid-cols-2 md:flex md:flex-wrap md:gap-4">
          {/* Restaurant selection */}
          <div className="w-full sm:w-auto">
            <Select 
              value={selectedRestaurantId?.toString() || ""} 
              onValueChange={(value) => setSelectedRestaurantId(Number(value))}
              disabled={isLoadingRestaurants}
            >
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[180px]">
                <SelectValue placeholder="Select Restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deal Type selection */}
          <div className="w-full sm:w-auto">
            <Select 
              value={selectedDealTypeId?.toString() || "all"} 
              onValueChange={(value) => setSelectedDealTypeId(value === "all" ? null : Number(value))}
              disabled={isLoadingDealTypes}
            >
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[180px]">
                <SelectValue placeholder="All Deal Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deal Types</SelectItem>
                {dealTypes.map((dealType) => (
                  <SelectItem key={dealType.id} value={dealType.id.toString()}>
                    {dealType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 bg-white border border-gray-300 w-full"
            />
          </div>

          {/* Active deals only switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="active-deals"
              checked={activeOnly}
              onCheckedChange={setActiveOnly}
            />
            <label htmlFor="active-deals" className="text-sm">Active Only</label>
          </div>

          {/* Current deals only switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="current-deals"
              checked={currentOnly}
              onCheckedChange={setCurrentOnly}
            />
            <label htmlFor="current-deals" className="text-sm">Current Only</label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button 
            variant="outline"
            size="icon"
            className="h-9 w-9 border border-gray-300"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button 
            variant="default"
            size="icon" 
            className="bg-primary hover:bg-primary/90 text-white h-9 w-9 rounded-full"
            onClick={handleAddNew}
            disabled={!selectedRestaurantId}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Deals table */}
      <div className="bg-white rounded-lg shadow relative overflow-x-auto">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow>
              <TableHead className="text-primary-foreground">ID</TableHead>
              <TableHead className="text-primary-foreground">Name</TableHead>
              <TableHead className="text-primary-foreground">Deal Type</TableHead>
              <TableHead className="text-primary-foreground">Date Range</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredDeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No deals found</TableCell>
              </TableRow>
            ) : (
              filteredDeals.map((deal) => (
                <TableRow key={deal.id}>
                  <TableCell>{deal.id}</TableCell>
                  <TableCell className="font-medium">{deal.name}</TableCell>
                  <TableCell>{deal.deal_types?.name || "-"}</TableCell>
                  <TableCell>
                    {deal.start_date && deal.end_date
                      ? `${format(new Date(deal.start_date), "MMM dd, yyyy")} - ${format(
                          new Date(deal.end_date),
                          "MMM dd, yyyy"
                        )}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={deal.status === 1 ? 'text-green-600' : 'text-gray-600'}>
                      {deal.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(deal)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(deal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(deal)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <CategoryPagination 
          totalItems={totalItems} 
          pageSize={pageSize} 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Add/Edit Dialog */}
      <AddEditDealDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        deal={editingDeal}
        viewOnly={viewOnly}
        restaurantId={selectedRestaurantId || 0}
        onSuccess={handleFormSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the deal "{dealToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deals; 