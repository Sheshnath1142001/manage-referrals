import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Clock, Settings, Eye, X, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AddEditLocationDialog from "@/components/AddEditLocationDialog";
import WorkingHoursDialog from "@/components/WorkingHoursDialog";
import LocationSettingsDialog from "@/components/LocationSettingsDialog";
import { CategoryPagination } from "@/components/categories/list/CategoryPagination";
import { restaurantsApi } from "@/services/api/restaurants";

interface Location {
  id: number;
  name: string;
  restaurant_type: number;
  restaurant_types: { id: number; type: string };
  owner_id: string;
  users_restaurants_owner_idTousers: { id: string; name: string };
  status: number;
  created_at: string;
  created_by: string;
  users_restaurants_created_byTousers: { id: string; name: string };
  restaurant_unique_id: string;
  receiver_email: string;
  timezone: string;
  order_types: { id: number; type: string };
  phone: string;
  address: {
    id: string;
    unit_number: string;
    street_name: string;
    postcode: string;
    city: string;
    country: string;
    province: string;
    latitude: string;
    longitude: string;
    phone: string;
    alternate_phone: string;
  };
  alternate_phone: string;
  site_reference: string;
  abn_number: string;
  is_delivery: number;
  gift_card_feature: number;
  dine_in_service: number;
  is_cloud_printing_enabled: number;
  delivery_charge: string;
  minimum_order_value: string;
  pickup_time_duration: string;
  online_order_surcharge_type: string;
  online_order_surcharge_value: string;
  online_order_discount_type: string;
  online_order_discount_value: string;
}

const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const Location = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWorkingHoursDialogOpen, setIsWorkingHoursDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined);
  const [viewOnly, setViewOnly] = useState(false);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("1"); // 1 = Active, 0 = Inactive, all = all
  const [isLoading, setIsLoading] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>("all");
  const [restaurantTypes, setRestaurantTypes] = useState<{ id: number; type: string }[]>([]);

  // Fetch restaurant types
  useEffect(() => {
    const fetchRestaurantTypes = async () => {
      try {
        const types = await restaurantsApi.getRestaurantTypes();
        setRestaurantTypes(types);
      } catch (error) {
        console.error("Error fetching restaurant types:", error);
      }
    };
    fetchRestaurantTypes();
  }, []);

  // Fetch locations from API
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        per_page: String(pageSize),
      });
      
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      
      if (nameFilter) {
        params.append("restaurant_name", nameFilter);
      }
      
      if (locationTypeFilter !== "all") {
        params.append("restaurant_type_id", locationTypeFilter);
      }
      
      // Get token from localStorage
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }
      const res = await fetch(
        `${apiBaseUrl}/restaurants?${params.toString()}`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        throw new Error('Unauthorized');
      }
      const data = await res.json();
      setLocations(data.restaurants || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch locations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch locations when filters change
  useEffect(() => {
    fetchLocations();
  }, [currentPage, pageSize, statusFilter, nameFilter, locationTypeFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Update this function to match the CategoryPagination behavior
  const handlePageSizeChange = (size: number) => {
    const newPageSize = size === 0 ? -1 : size;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleAddNew = () => {
    setEditingLocation(undefined);
    setViewOnly(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation({
      ...location,
      locationType: location.restaurant_types?.type || "OUTLET",
      serviceType: location.order_types?.type || "Delivery, Dine In, Takeaway",
      status: location.status === 1 ? "Active" : "Inactive",
      receiverEmail: location.receiver_email || ""
    });
    setViewOnly(false);
    setIsDialogOpen(true);
  };

  const handleView = (location: Location) => {
    setEditingLocation({
      ...location,
      locationType: location.restaurant_types?.type || "OUTLET",
      serviceType: location.order_types?.type || "Delivery, Dine In, Takeaway",
      status: location.status === 1 ? "Active" : "Inactive",
      receiverEmail: location.receiver_email || ""
    });
    setViewOnly(true);
    setIsDialogOpen(true);
  };

  const handleWorkingHours = (location: Location) => {
    setEditingLocation(location);
    setIsWorkingHoursDialogOpen(true);
  };

  const handleSettings = (location: Location) => {
    setEditingLocation(location);
    setIsSettingsDialogOpen(true);
  };

  const handleFormSubmit = async (locationData: any) => {
    try {
      // Get token from localStorage
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      if (!token) {
        throw new Error('No authorization token found');
      }

      // Prepare restaurant request data
      const restaurantData = {
        name: locationData.name,
        status: locationData.status === "Active" ? 1 : 0,
        restaurant_type: locationData.locationType === "OUTLET" ? 2 : 1, // 2 for OUTLET, 1 for BRAND
        restaurant_order_type_otm: [], // Will be populated based on serviceType
        receiver_email: locationData.receiverEmail || locationData.email || "" // Add fallback to email field
      };

      // Validate receiver_email
      if (!restaurantData.receiver_email) {
        throw new Error('Receiver email is required');
      }

      // Map service types to order type IDs
      const serviceTypes = locationData.serviceType.split(", ");
      const orderTypeMap: { [key: string]: string } = {
        "Dine In": "1",
        "Takeaway": "2",
        "Delivery": "3"
      };
      restaurantData.restaurant_order_type_otm = serviceTypes.map(type => orderTypeMap[type]).filter(id => id);

      if (editingLocation) {
        // Update existing location
        const restaurantResponse = await fetch(
          `${apiBaseUrl}/restaurant/${editingLocation.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Timezone': 'Asia/Calcutta'
            },
            body: JSON.stringify(restaurantData)
          }
        );

        if (!restaurantResponse.ok) {
          const errorData = await restaurantResponse.json();
          throw new Error(errorData[0]?.message || 'Failed to update location');
        }

        // Get the address ID from the API response
        const restaurantResult = await restaurantResponse.json();

        // Prepare address request data
        const addressData = {
          unit_number: locationData.unitNumber || "",
          street_name: locationData.streetName || "",
          postcode: locationData.postcode || "",
          city: locationData.city || "",
          province: locationData.province || "",
          country: locationData.country || "",
          latitude: locationData.latitude || "",
          longitude: locationData.longitude || "",
          phone: locationData.phone || "",
          alternate_phone: locationData.alternatePhone || "",
          module_type: 4 // Restaurant module type
        };

        // Fetch existing address to get the address ID
        const addressListResponse = await fetch(
          `${apiBaseUrl}/address?module_type=4&module_id=${editingLocation.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!addressListResponse.ok) {
          throw new Error('Failed to fetch address details');
        }

        const addressList = await addressListResponse.json();
        const addressId = addressList[0]?.id;

        if (addressId) {
          // Update address
          const addressResponse = await fetch(
            `${apiBaseUrl}/update-address/${addressId}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Timezone': 'Asia/Calcutta'
              },
              body: JSON.stringify(addressData)
            }
          );

          if (!addressResponse.ok) {
            throw new Error('Failed to update address');
          }
        }

        toast({
          title: "Success",
          description: "Location and address updated successfully"
        });
      } else {
        // Create new location
        const restaurantResponse = await fetch(
          `${apiBaseUrl}/restaurant`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Timezone': 'Asia/Calcutta'
            },
            body: JSON.stringify(restaurantData)
          }
        );

        if (!restaurantResponse.ok) {
          const errorData = await restaurantResponse.json();
          throw new Error(errorData[0]?.message || 'Failed to create location');
        }

        const restaurantResult = await restaurantResponse.json();
        const newRestaurantId = restaurantResult.restaurant?.id;

        if (!newRestaurantId) {
          throw new Error('Failed to get new restaurant ID');
        }

        // Create address for new restaurant
        const addressData = {
          unit_number: locationData.unitNumber || "",
          street_name: locationData.streetName || "",
          postcode: locationData.postcode || "",
          city: locationData.city || "",
          province: locationData.province || "",
          country: locationData.country || "",
          latitude: locationData.latitude || "",
          longitude: locationData.longitude || "",
          phone: locationData.phone || "",
          alternate_phone: locationData.alternatePhone || "",
          module_type: 4,
          module_id: newRestaurantId
        };

        const addressResponse = await fetch(
          `${apiBaseUrl}/create-address`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Timezone': 'Asia/Calcutta'
            },
            body: JSON.stringify(addressData)
          }
        );

        if (!addressResponse.ok) {
          throw new Error('Failed to create address');
        }

        // Handle image upload if there's a selected file
        if (locationData.selectedFile) {
          const formData = new FormData();
          formData.append('module_type', '4');
          formData.append('module_id', newRestaurantId.toString());
          formData.append('attachment', locationData.selectedFile);
          formData.append('attachment_type', '1');

          const imageResponse = await fetch(
            `${apiBaseUrl}/attachment`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'X-Timezone': 'Asia/Calcutta'
              },
              body: formData
            }
          );

          if (!imageResponse.ok) {
            console.error('Failed to upload image, but location was created');
          }
        }

        toast({
          title: "Success",
          description: "Location created successfully with address"
        });
      }

      // Close dialog and refresh data
      setIsDialogOpen(false);
      fetchLocations();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save location",
        variant: "destructive"
      });
    }
  };

  const handleWorkingHoursSubmit = () => {
    setIsWorkingHoursDialogOpen(false);
    // Refresh the locations list
    fetchLocations();
  };

  const handleSettingsSubmit = async (settings: any) => {
    if (!editingLocation) return;
    
    try {
      // Convert settings to match API format
      const apiData = {
        restaurant_id: editingLocation.id,
        phone_no: settings.phone,
        product_vendor_name: "Restaurant",
        product_name: editingLocation.name,
        authorized_discount: 10,
        product_version: "1.0",
        site_reference: settings.siteReference,
        address_line_1: settings.addressLine1,
        address_line_2: settings.addressLine2,
        show_product_offer_popup: true,
        gst_tax_rate: 10,
        gst_ratio: 0.1,
        expected_floating_amount: 100,
        status: 1,
        abn: settings.abnNumber,
        tyro_api_key: "",
        paring_secret: "",
        is_refer_program_required: false,
        is_spent_reward_program_required: false,
        order_discount_type: 1,
        order_fixed_discount: Number(settings.onlineOrderDiscountValue) || 0,
        order_surcharge_type: 1,
        order_fixed_surcharge: Number(settings.onlineOrderSurchargeValue) || 0,
        is_deliverable: settings.isDelivery,
        min_order_value_to_avail_disc: Number(settings.minimumOrderValue) || 0,
        fixed_delivery_charge: Number(settings.deliveryCharge) || 0,
        pickup_time_duration: Number(settings.pickupTimeDuration) || 30,
        is_dine_in_enabled: settings.dineInService === "Enabled",
        is_giftcard_feature_enabled: settings.giftCardFeature === "Enabled",
        is_online_order_enabled: true,
        is_cloud_printing_enabled: settings.is_cloud_printing_enabled
      };

      await restaurantsApi.updateRestaurant(editingLocation.id, apiData);
      
      toast({
        title: "Success",
        description: "Restaurant settings updated successfully"
      });
      
      setIsSettingsDialogOpen(false);
      // Refresh the locations list
      fetchLocations();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update restaurant settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchLocations();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row gap-4 mb-6 items-center">
        {/* Name Filter */}
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Input
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-10 bg-white border border-gray-300"
            />
            {nameFilter && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                onClick={() => setNameFilter("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Location Type Filter */}
        <div className="flex-1 max-w-xs">
          <Select 
            value={locationTypeFilter} 
            onValueChange={setLocationTypeFilter}
          >
            <SelectTrigger className="h-10 bg-white border border-gray-300">
              <SelectValue placeholder="Location Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {restaurantTypes
                .filter((type) => type.type !== "BRAND")
                .map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.type}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 max-w-xs">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="h-10 bg-white border border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="default"
            size="icon" 
            className="bg-primary hover:bg-primary/90 text-white rounded-full"
            onClick={handleAddNew}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader className="bg-primary text-primary-foreground">
            <TableRow>
              <TableHead className="text-primary-foreground">Id</TableHead>
              <TableHead className="text-primary-foreground">Name</TableHead>
              <TableHead className="text-primary-foreground">Location type</TableHead>
              <TableHead className="text-primary-foreground">Type</TableHead>
              <TableHead className="text-primary-foreground">Owner</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground">Receiver email</TableHead>
              <TableHead className="text-primary-foreground">Service type</TableHead>
              <TableHead className="text-primary-foreground">Phone</TableHead>
              <TableHead className="text-primary-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">No locations found</TableCell>
              </TableRow>
            ) : (
              locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.id}</TableCell>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.restaurant_types?.type || "-"}</TableCell>
                  <TableCell>{location.order_types?.type || "-"}</TableCell>
                  <TableCell>{location.users_restaurants_owner_idTousers?.name || "-"}</TableCell>
                  <TableCell>
                    <span className={location.status === 1 ? 'text-green-600' : 'text-gray-600'}>
                      {location.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>{location.receiver_email}</TableCell>
                  <TableCell>{location.order_types?.type || "-"}</TableCell>
                  <TableCell>{location.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost"
                        size="icon" 
                        className="h-8 w-8 text-blue-500"
                        onClick={() => handleView(location)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon" 
                        className="h-8 w-8 text-green-500"
                        onClick={() => handleEdit(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon" 
                        className="h-8 w-8 text-purple-500"
                        onClick={() => handleWorkingHours(location)}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost"
                        size="icon" 
                        className="h-8 w-8 text-gray-500"
                        onClick={() => handleSettings(location)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Replace the current pagination with CategoryPagination */}
        <CategoryPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Add/Edit Dialog */}
      <AddEditLocationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingLocation}
        viewOnly={viewOnly}
      />

      {/* Working Hours Dialog */}
      {editingLocation && (
        <WorkingHoursDialog
          open={isWorkingHoursDialogOpen}
          onOpenChange={setIsWorkingHoursDialogOpen}
          onSubmit={handleWorkingHoursSubmit}
          restaurantId={editingLocation.id}
          initialData={undefined}
          serviceType={editingLocation.order_types?.type || "-"}
        />
      )}

      {/* Settings Dialog */}
      {editingLocation && (
        <LocationSettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
          onSubmit={handleSettingsSubmit}
          initialData={{
            siteReference: editingLocation.site_reference || "",
            addressLine1: editingLocation.address?.street_name || "",
            addressLine2: `${editingLocation.address?.city || ""}, ${editingLocation.address?.postcode || ""}`,
            abnNumber: editingLocation.abn_number || "",
            phone: editingLocation.phone || "",
            isDelivery: editingLocation.is_delivery === 1,
            giftCardFeature: editingLocation.gift_card_feature === 1 ? "Enabled" : "Disabled",
            dineInService: editingLocation.dine_in_service === 1 ? "Enabled" : "Disabled",
            is_cloud_printing_enabled: editingLocation.is_cloud_printing_enabled === 1,
            
            // Online Order Settings
            deliveryCharge: editingLocation.delivery_charge?.toString() || "0",
            minimumOrderValue: editingLocation.minimum_order_value?.toString() || "0",
            pickupTimeDuration: editingLocation.pickup_time_duration?.toString() || "30",
            onlineOrderSurchargeType: editingLocation.online_order_surcharge_type || "Fixed",
            onlineOrderSurchargeValue: editingLocation.online_order_surcharge_value?.toString() || "0",
            onlineOrderDiscountType: editingLocation.online_order_discount_type || "Percentage",
            onlineOrderDiscountValue: editingLocation.online_order_discount_value?.toString() || "0"
          }}
        />
      )}
    </div>
  );
};

export default Location;
