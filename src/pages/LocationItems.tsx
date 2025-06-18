import { BulkEditLocationItemDialog } from "@/components/BulkEditLocationItemDialog";
import { BulkEditModifiersDialog } from "@/components/BulkEditModifiersDialog";
import EditLocationItemDialog from "@/components/EditLocationItemDialog";
import { ItemAttributesSettingsDialog } from "@/components/items/ItemAttributesSettingsDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow
} from "@/components/ui/table";
import ViewLocationItemDialog from "@/components/ViewLocationItemDialog";
import { ViewPriceRulesDialog } from "@/components/ViewPriceRulesDialog";
import { useToast } from "@/hooks/use-toast";
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { categoriesApi, locationItemsApi } from "@/services/api";
import { tagsService } from "@/services/api/items/tags";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Copy, DollarSign, Edit, Eye, PlusSquare, RefreshCw, Search, Settings, Square, X } from "lucide-react";
import { useMemo, useState } from "react";

interface LocationItem {
  id: string;
  product_id: number;
  products: {
    id: number;
    name: string;
    description: string | null;
    quantity: string;
    quantity_unit: number;
    quantity_units: {
      id: number;
      unit: string;
      status: number;
    };
    price: string;
    online_price: string;
    categories: {
      id: number;
      category: string;
      status: number;
      seq_no: number;
    };
    status: number;
  };
  price: string;
  is_online: number;
  online_price: string;
  restaurants: {
    id: number;
    name: string;
    owner_id: string;
    status: number;
  };
  discount: string;
  online_discount: string;
  discount_type: number;
  discount_types?: {
    id: number;
    type: string;
  };
  restrict_attribute_combinations: number | boolean;
  is_offer_half_n_half: number | boolean;
  status: number;
  restaurant_product_tags: Array<{
    id: string;
    tag: string;
  }>;
  images: Array<{
    upload_path: string;
  }>;
}

const initialLocationItems: LocationItem[] = [];

const onlineProducts = [
  "All Products",
  "Online",
  "In Store only"
];

// Utility function to format price
const formatPrice = (price: string | number): string => {
  if (typeof price === 'string') {
    // Remove any existing currency symbols and spaces
    price = price.replace(/[^0-9.-]+/g, '');
  }
  return `$${Number(price).toFixed(2)}`;
};

const LocationItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { restaurants: availableRestaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State for filters
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchItem, setSearchItem] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [onlineFilter, setOnlineFilter] = useState("All Products");
  const [statusFilter, setStatusFilter] = useState("Active");
  
  // State for dialogs
  const [selectedItems, setSelectedItems] = useState<LocationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [bulkEditModifiersDialogOpen, setBulkEditModifiersDialogOpen] = useState(false);
  const [selectedViewItem, setSelectedViewItem] = useState<any>(null);
  const [selectedEditItem, setSelectedEditItem] = useState<any>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState<LocationItem | null>(null);
  const [priceRulesDialogOpen, setPriceRulesDialogOpen] = useState(false);
  const [selectedPriceRulesItem, setSelectedPriceRulesItem] = useState<LocationItem | null>(null);

  // Add state for clone dialog
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [sourceLocation, setSourceLocation] = useState("");
  const [targetLocation, setTargetLocation] = useState("");

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.getCategories({ page: 1, per_page: 99999, status: 1 }),
    select: (res: any) => res.categories || res.data || [],
  });

  // Fetch tags with the specified parameters
  const { data: tagsResponse } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsService.getTags({ per_page: 999999, page: 1 }),
    select: (res: any) => res.tags || res.data || [],
  });

  // Prepare category options
  const categoryOptions = useMemo(() => [
    { id: "All Categories", category: "All Categories" },
    ...(categoriesResponse || [])
  ], [categoriesResponse]);

  // Find selected category id
  const selectedCategoryId = useMemo(() => {
    if (categoryFilter === "All Categories") return undefined;
    const selectedCategory = (categoriesResponse || []).find(
      (cat: any) => cat.category === categoryFilter
    );
    return selectedCategory?.id;
  }, [categoryFilter, categoriesResponse]);

  // Fetch location items, filter by category_id if selected
  const { data: locationItemsResponse, isLoading, error, refetch } = useQuery({
    queryKey: [
      'locationItems',
      currentPage,
      pageSize,
      locationFilter,
      searchItem,
      categoryFilter,
      onlineFilter,
      statusFilter
    ],
    queryFn: async () => {
      const response = await locationItemsApi.getLocationItems({
        page: currentPage,
        per_page: pageSize,
        status: statusFilter === "All" ? undefined : statusFilter === "Active" ? 1 : 0,
        category_id: selectedCategoryId,
        restaurant_id: locationFilter !== "all" ? locationFilter : undefined,
        product_name: searchItem || undefined,
      });
       // Debug log
      return response;
    },
  });

  // Extract location items from response
  const locationItems = useMemo(() => {
    const response = locationItemsResponse as any;
    if (!response?.restaurant_products) return [];
    return response.restaurant_products;
  }, [locationItemsResponse]);

  const totalItems = (locationItemsResponse as any)?.total || 0;

  // Filter items
  const filteredItems = useMemo(() => {
    return locationItems.filter(item => {
      const matchesName = item.products?.name?.toLowerCase().includes(searchItem.toLowerCase()) ?? false;
      const matchesLocation = locationFilter === "all" || String(item.restaurants?.id) === String(locationFilter);
      const matchesCategory = categoryFilter === "All Categories" || item.products?.categories?.category === categoryFilter;
      const matchesOnline = onlineFilter === "All Products" || 
        (item.is_online === 1 && onlineFilter === "Online") || 
        (item.is_online === 0 && onlineFilter === "In Store only");
      const matchesStatus = statusFilter === "All" || 
        (item.status === 1 && statusFilter === "Active") || 
        (item.status === 0 && statusFilter === "Inactive");
      
      return matchesName && matchesLocation && matchesCategory && matchesOnline && matchesStatus;
    });
  }, [locationItems, searchItem, locationFilter, categoryFilter, onlineFilter, statusFilter]);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Success",
        description: "Data refreshed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add clone handler
  const handleClone = async () => {
    if (!sourceLocation || !targetLocation) {
      toast({
        title: "Error",
        description: "Please select both source and target locations",
        variant: "destructive"
      });
      return;
    }

    try {
      await locationItemsApi.cloneItems(sourceLocation, targetLocation);
      toast({
        title: "Success",
        description: "Items cloned successfully"
      });
      setCloneDialogOpen(false);
      refetch(); // Refresh the list after cloning
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clone items",
        variant: "destructive"
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSelectItem = (item: LocationItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...filteredItems]);
    }
  };

  const handleView = (item: LocationItem) => {
    // Transform to match ViewLocationItemDialog's expected props
    const transformedItem = {
      id: item.id,
      name: item.products?.name || "",
      price: formatPrice(item.price || "0"),
      onlinePrice: formatPrice(item.online_price || "0"),
      discountType: item.discount_types?.type || "Flat",
      discount: item.discount || "0",
      onlineDiscount: item.online_discount || "0",
      tags: item.restaurant_product_tags?.filter(tag => tag && tag.tag).map(tag => tag.tag) || [],
      active: item.status === 1,
      online: item.is_online === 1,
      restrictAttributeCombinations: typeof item.restrict_attribute_combinations === 'boolean' 
        ? item.restrict_attribute_combinations 
        : item.restrict_attribute_combinations === 1,
      isOfferHalfNHalf: typeof item.is_offer_half_n_half === 'boolean' 
        ? item.is_offer_half_n_half 
        : item.is_offer_half_n_half === 1,
      // Add modifiers if needed
      modifiers: {
        sauceOptions: [],
        extras: item.restaurant_product_tags?.filter(tag => tag && tag.tag).map(tag => ({
          name: tag.tag,
          price: "0"
        })) || []
      }
    };
    
    setSelectedViewItem(transformedItem);
    setViewDialogOpen(true);
  };

  const handleEdit = (item: LocationItem) => {
    // Transform to match EditLocationItemDialog's expected props
    const transformedItem = {
      id: item.id,
      product_id: item.product_id,
      name: item.products?.name || "",
      price: formatPrice(item.price || "0"),
      onlinePrice: formatPrice(item.online_price || "0"),
      discountType: item.discount_types?.type || "Flat",
      discount: item.discount || "0",
      onlineDiscount: item.online_discount || "0",
      // Use tag.tag values for the EditLocationItemDialog
      // The dialog will convert these to IDs using the tags data
      tags: item.restaurant_product_tags?.filter(tag => tag && tag.tag).map(tag => tag.tag) || [],
      active: item.status === 1,
      online: item.is_online === 1,
      restrictAttributeCombinations: typeof item.restrict_attribute_combinations === 'boolean' 
        ? item.restrict_attribute_combinations 
        : item.restrict_attribute_combinations === 1,
      isOfferHalfNHalf: typeof item.is_offer_half_n_half === 'boolean' 
        ? item.is_offer_half_n_half 
        : item.is_offer_half_n_half === 1
    };
    
    setSelectedEditItem(transformedItem);
    setEditDialogOpen(true);
  };

  // Add handleSubmitEdit at the bottom
  const handleSubmitEdit = async (updatedItem: any) => {
    
    
    try {
      // Prepare the data for the API (without tags)
      const updateData = {
        price: Number(updatedItem.price.replace(/[^0-9.-]+/g, '')),
        online_price: Number(updatedItem.onlinePrice.replace(/[^0-9.-]+/g, '')),
        status: updatedItem.active ? 1 : 0,
        is_online: updatedItem.online ? 1 : 0,
        discount: Number(updatedItem.discount),
        online_discount: Number(updatedItem.onlineDiscount),
        discount_type: updatedItem.discountType === "Percentage" ? 2 : 1,
        restrict_attribute_combinations: updatedItem.restrictAttributeCombinations ? 1 : 0,
        is_offer_half_n_half: updatedItem.isOfferHalfNHalf ? 1 : 0,
      };
      
      
      
      // First, update the item details
      await locationItemsApi.updateLocationItem(updatedItem.id, updateData);
      
      // Handle tags separately
      if (updatedItem.tags && Array.isArray(updatedItem.tags)) {
        // Get the current item to find existing tags
        const currentItem = locationItems.find(item => item.id === updatedItem.id);
        const existingTags = currentItem?.restaurant_product_tags?.filter(tag => tag && tag.tag) || [];
        const existingTagNames = existingTags.map(tag => tag.tag);
        
        // Find tags to add (new tags)
        const tagsToAdd = updatedItem.tags.filter(tag => !existingTagNames.includes(tag));
        
        // Find tags to remove (tags that were removed)
        const tagsToRemove = existingTags.filter(tag => !updatedItem.tags.includes(tag.tag));
        
        // Get tag IDs for new tags
        if (tagsToAdd.length > 0) {
          const tagResponse = await locationItemsApi.getTagsByName(tagsToAdd);
          const tagObjects = Array.isArray(tagResponse) ? tagResponse : (tagResponse.data || []);
          
          // Add each new tag
          for (const tagObj of tagObjects) {
            await locationItemsApi.addProductTag({
              tag_id: Number(tagObj.id),
              restaurant_product_id: updatedItem.id
            });
          }
        }
        
        // Remove tags that were removed
        for (const tagToRemove of tagsToRemove) {
          await locationItemsApi.removeProductTag(updatedItem.id, tagToRemove.id);
        }
      }
      
      toast({
        title: "Success",
        description: "Item updated successfully"
      });
      
      refetch(); // Refetch the location items
      setEditDialogOpen(false);
    } catch (error) {
      
      
      // Handle validation errors
      if (error.response?.data) {
        const validationErrors = error.response.data;
        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          // Display the first validation error
          toast({
            title: "Validation Error",
            description: validationErrors[0].message || "Invalid data submitted",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update item",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to update item",
          variant: "destructive"
        });
      }
    }
  };

  // Handlers for bulk operations
  const handleBulkEdit = () => {
    if (selectedItems.length > 0) {
      setBulkEditDialogOpen(true);
    }
  };

  const handleBulkAddModifiers = () => {
    if (selectedItems.length > 0) {
      setBulkEditModifiersDialogOpen(true);
    }
  };

  const updateBulkStatus = async (status: number) => {
    if (selectedItems.length === 0) return;
    
    try {
      // Create payload for bulk update API
      const bulkUpdatePayload = selectedItems.map(item => ({
        entityType: "restaurant_products",
        id: item.id,
        data: { status }
      }));
      
      // Make bulk update request
      await locationItemsApi.bulkUpdate(bulkUpdatePayload);
      
      // Show success message
      toast({
        title: "Success",
        description: `Updated ${selectedItems.length} items successfully`
      });
      
      // Refresh data
      refetch();
      
      // Clear selection
      setSelectedItems([]);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update items. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkUpdateSuccess = () => {
    refetch();
    // We'll clear selections after the dialog closes
  };

  // Function to handle closing of bulk edit modifiers dialog
  const handleCloseBulkEditModifiersDialog = (open: boolean) => {
    setBulkEditModifiersDialogOpen(open);
    if (!open) {
      // Clear selections when the dialog is closed
      setSelectedItems([]);
    }
  };

  // Function to handle closing of bulk edit dialog
  const handleCloseBulkEditDialog = (open: boolean) => {
    setBulkEditDialogOpen(open);
    if (!open) {
      // Clear selections when the dialog is closed
      setSelectedItems([]);
    }
  };

  // Add a function to handle adding modifiers for a single item
  const handleAddModifiers = (item: LocationItem) => {
    setSelectedItems([item]);
    setBulkEditModifiersDialogOpen(true);
  };

  // Add a function to handle opening the settings dialog
  const handleSettings = (item: LocationItem) => {
    setSelectedSettingsItem(item);
    setSettingsDialogOpen(true);
  };

  // Add a function to handle saving attributes
  const handleSaveAttributes = (attributes: any[]) => {
    
    
    // Here you would typically call an API to save the attributes
    toast({
      title: "Success",
      description: "Item attributes saved successfully",
    });
    
    // Refresh data if needed
    refetch();
  };

  const handlePriceRules = (item: LocationItem) => {
    setSelectedPriceRulesItem(item);
    setPriceRulesDialogOpen(true);
  };

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        {/* Filter inputs */}
        <div className="grid gap-3 flex-1 sm:grid-cols-2 md:flex md:flex-wrap md:gap-4">
          {/* Location Filter */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1 block">Location</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {availableRestaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={String(restaurant.id)}>{restaurant.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Input */}
          <div className="w-full md:w-72">
            <label className="text-xs text-gray-500 mb-1 block">Item Name</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Item"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="pl-8 pr-8 h-9 bg-white border border-gray-300 w-full"
              />
              {searchItem && (
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchItem("")}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1 block">Category</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(category => (
                  <SelectItem key={category.id} value={category.category}>{category.category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Availability Filter */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1 block">Availability</label>
            <Select value={onlineFilter} onValueChange={setOnlineFilter}>
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[160px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Products">All Products</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="In Store only">In Store only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Status Filter */}
          <div className="w-full sm:w-auto">
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 bg-white border border-gray-300 w-full sm:w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button 
            variant="outline"
            size="icon" 
            className="h-9 w-9 border border-gray-300"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline"
            size="icon" 
            className="h-9 w-9 border border-gray-300"
            onClick={() => setCloneDialogOpen(true)}
            title="Clone Items"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow relative overflow-x-auto">
        {/* Show bulk action buttons only when items are selected */}
        {selectedItems.length > 0 && (
          <div className="flex justify-end items-center p-4 border-b">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateBulkStatus(1)}
                title="Activate Selected"
              >
                <CheckSquare className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => updateBulkStatus(0)}
                title="Deactivate Selected"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleBulkAddModifiers}
                title="Add Modifiers"
              >
                <PlusSquare className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={handleBulkEdit}
                title="Edit Selected"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader className="bg-black rounded-t-lg overflow-hidden">
            <TableRow className="border-b-0">
              <TableHead className="text-white font-semibold rounded-tl-lg w-12">
                <div className="flex items-center justify-center">
                  {selectedItems.length === filteredItems.length && filteredItems.length > 0 ? (
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      <CheckSquare className="h-5 w-5 text-white" />
                    </button>
                  ) : (
                    <button onClick={handleSelectAll} className="cursor-pointer">
                      <Square className="h-5 w-5 text-gray-300" />
                    </button>
                  )}
                </div>
              </TableHead>
              <TableHead className="text-white font-semibold">ID</TableHead>
              <TableHead className="text-white font-semibold">Name</TableHead>
              <TableHead className="text-white font-semibold">Category</TableHead>
              <TableHead className="text-white font-semibold">Tags</TableHead>
              <TableHead className="text-white font-semibold">Price</TableHead>
              <TableHead className="text-white font-semibold">Online Price</TableHead>
              <TableHead className="text-white font-semibold">Online</TableHead>
              <TableHead className="text-white font-semibold">Status</TableHead>
              <TableHead className="text-white font-semibold text-right rounded-tr-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  No items found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      {selectedItems.some(i => i.id === item.id) ? (
                        <button onClick={() => handleSelectItem(item)} className="cursor-pointer">
                          <CheckSquare className="h-5 w-5 text-primary" />
                        </button>
                      ) : (
                        <button onClick={() => handleSelectItem(item)} className="cursor-pointer">
                          <Square className="h-5 w-5 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.products?.name}</TableCell>
                  <TableCell>{item.products?.categories?.category}</TableCell>
                  <TableCell>
                    {
                      item.restaurant_product_tags?.filter(tag => tag && tag.tag).map(tag => tag.tag).join(', ') || 'No tags'
                    }
                  </TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>{formatPrice(item.online_price)}</TableCell>
                  <TableCell>
                    <span className={item.is_online ? "text-green-600 font-medium" : ""}>
                      {item.is_online ? "Online" : "In Store only"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={item.status === 1 ? "text-green-600 font-medium" : ""}>
                      {item.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(item)} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} title="Edit Item">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAddModifiers(item)} title="Add Modifiers">
                        <PlusSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handlePriceRules(item)} title="Price Rules">
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleSettings(item)} title="Settings">
                        <Settings className="h-4 w-4" />
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
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {selectedViewItem && (
        <ViewLocationItemDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          item={selectedViewItem}
        />
      )}
      {selectedEditItem && (
        <EditLocationItemDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={selectedEditItem}
          onSubmit={handleSubmitEdit}
        />
      )}
      
      {/* Bulk Edit Dialog */}
      <BulkEditLocationItemDialog
        isOpen={bulkEditDialogOpen}
        onOpenChange={handleCloseBulkEditDialog}
        selectedItems={selectedItems}
        onBulkUpdateSuccess={handleBulkUpdateSuccess}
        discountTypes={[
          { id: 1, name: "Flat" },
          { id: 2, name: "Percentage" }
        ]}
      />
      
      {/* Bulk Edit Modifiers Dialog */}
      <BulkEditModifiersDialog
        isOpen={bulkEditModifiersDialogOpen}
        onOpenChange={handleCloseBulkEditModifiersDialog}
        selectedItems={selectedItems}
        onBulkUpdateSuccess={handleBulkUpdateSuccess}
      />
      
      {/* Item Attributes Settings Dialog */}
      {selectedSettingsItem && (
        <ItemAttributesSettingsDialog
          isOpen={settingsDialogOpen}
          onOpenChange={setSettingsDialogOpen}
          itemName={selectedSettingsItem.products?.name || ""}
          onSave={handleSaveAttributes}
          restaurantProductId={selectedSettingsItem.id}
          productId={selectedSettingsItem.product_id.toString()}
        />
      )}

      {selectedPriceRulesItem && (
        <ViewPriceRulesDialog
          isOpen={priceRulesDialogOpen}
          onOpenChange={setPriceRulesDialogOpen}
          productId={selectedPriceRulesItem.product_id.toString()}
          restaurantProductId={selectedPriceRulesItem.id}
        />
      )}

      {/* Clone Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Location Items</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From Location</Label>
              <Select value={sourceLocation} onValueChange={setSourceLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source location" />
                </SelectTrigger>
                <SelectContent>
                  {availableRestaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={String(restaurant.id)}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>To Location</Label>
              <Select value={targetLocation} onValueChange={setTargetLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target location" />
                </SelectTrigger>
                <SelectContent>
                  {availableRestaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={String(restaurant.id)}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleClone}>
              Clone Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationItems;
