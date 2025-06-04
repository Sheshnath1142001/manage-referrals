import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Eye, RefreshCw, Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

  // Hooks
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const { dealTypes, isLoading: isLoadingDealTypes } = useGetDealTypes();
  const { toast } = useToast();
  console.log({ restaurants, isLoadingRestaurants })
  // Set the first restaurant as default when restaurants are loaded
  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(Number(restaurants[0].id));
    }
  }, [restaurants, selectedRestaurantId]);
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
  const handleDelete = async (dealId: number) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      try {
        await dealsApi.deleteDeal(dealId);
        toast({
          title: "Deal deleted",
          description: "The deal has been deleted successfully.",
        });
        refreshDeals();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete the deal.",
          variant: "destructive",
        });
      }
    }
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
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row gap-4 mb-6">
        {/* Restaurant selection */}
        <div className="flex-1 max-w-xs">
          <Select 
            value={selectedRestaurantId?.toString() || ""} 
            onValueChange={(value) => setSelectedRestaurantId(Number(value))}
            disabled={isLoadingRestaurants}
          >
            <SelectTrigger>
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
        <div className="flex-1 max-w-xs">
          <Select 
            value={selectedDealTypeId?.toString() || "all"} 
            onValueChange={(value) => setSelectedDealTypeId(value === "all" ? null : Number(value))}
            disabled={isLoadingDealTypes}
          >
            <SelectTrigger>
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
        <div className="flex-1">
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Active deals only switch */}
        <div className="flex items-center space-x-2">
          <Switch
            id="active-deals"
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
          />
          <label htmlFor="active-deals">Active Deals Only</label>
        </div>

        {/* Current deals only switch */}
        <div className="flex items-center space-x-2">
          <Switch
            id="current-deals"
            checked={currentOnly}
            onCheckedChange={setCurrentOnly}
          />
          <label htmlFor="current-deals">Current Deals Only</label>
        </div>

        {/* Refresh button */}
        <Button 
          variant="refresh"
          className="flex items-center gap-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>

        {/* Add new deal button */}
        <Button 
          variant="default"
          size="icon" 
          className="bg-primary hover:bg-primary/90 text-white rounded-full"
          onClick={handleAddNew}
          disabled={!selectedRestaurantId}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Deals table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleView(deal)}
                    >
                      <Eye className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(deal)}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(deal.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
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
    </div>
  );
};

export default Deals; 