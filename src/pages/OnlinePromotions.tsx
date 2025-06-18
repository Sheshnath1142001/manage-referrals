import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TablePagination } from "@/components/ui/table";
import { bannersApi } from "@/services/api/banners";
import { api } from "@/services/api/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Pencil, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OnlinePromotionDialog } from "@/components/online-promotions/OnlinePromotionDialog";
import { Input } from "@/components/ui/input";
import { useGetRestaurants } from '@/hooks/useGetRestaurants';
import { useAuth } from '@/hooks/use-auth';

interface OnlinePromotion {
  id: number;
  name: string;
  description: string | null;
  status: number;
  restaurant_id: number | null;
  category: string; // holds category_id as string for form compatibility
  category_name?: string;
  image?: string; // first image path (if any)
  images?: { id: string; upload_path: string }[];
  // Additional backend fields
  [key: string]: any;
}

export default function OnlinePromotions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<OnlinePromotion | undefined>();
  const [search, setSearch] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const { restaurants: availableRestaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [locationFilter, setLocationFilter] = useState<string>("");
  const { user } = useAuth();

  // Fetch banners from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["onlinePromotions", page, pageSize, locationFilter],
    queryFn: async () => {
      const params: any = {
        page,
        per_page: pageSize,
        tenant_id: user?.restaurant_id ?? undefined,
      };

      const response = await bannersApi.getBanners(params);

      // Handle possible response shapes
      let banners: any[] = [];
      let total = 0;

      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          banners = response;
          total = banners.length;
        } else if ('data' in response && Array.isArray(response.data)) {
          banners = response.data;
          if ('pagination' in response && response.pagination?.total) {
            total = response.pagination.total;
          } else {
            total = banners.length;
          }
        } else if ('banners' in response && Array.isArray(response.banners)) {
          banners = response.banners;
          total = banners.length;
        }
      }

      // Map banners to OnlinePromotion structure used by table/search
      const mapped: OnlinePromotion[] = banners.map((b: any) => ({
        id: b.id,
        name: b.banner_name ?? b.name ?? '',
        description: b.description ?? null,
        status: typeof b.status === 'number' ? b.status : Number(b.status ?? 0),
        restaurant_id: b.restaurant_id ?? null,
        category: String(b.category_id ?? ''),
        category_name: b.category_name,
        image: Array.isArray(b.images) && b.images.length > 0 ? b.images[0].upload_path : '',
        images: b.images ?? [],
      }));

      return {
        data: mapped,
        total,
      };
    },
  });

  interface SubmitPayload {
    name: string;
    description: string | null;
    category: string;
    status: number;
    image?: string;
    imageFile?: File | null;
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: SubmitPayload) => {
      // Map to backend payload
      const payload = {
        banner_name: data.name,
        status: data.status,
        category_id: Number(data.category),
        description: data.description ?? null,
      } as const;

      // 1) Create banner
      const res = await bannersApi.createBanner(payload);

      // 2) If an image file is provided, upload attachment
      if (data.imageFile) {
        const formData = new FormData();
        formData.append('module_type', '5'); // as per requirement
        formData.append('module_id', String(res.data.id));
        formData.append('attachment_type', '1');
        formData.append('attachment', data.imageFile, data.imageFile.name);

        // Using base api instance directly to hit singular endpoint
        await api.post('/attachment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Online promotion created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["onlinePromotions"] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create online promotion",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SubmitPayload }) => {
      // 1) Update banner details
      await bannersApi.updateBanner({
        banner_id: id,
        banner_name: data.name,
        category_id: Number(data.category),
        description: data.description ?? null,
        status: data.status,
      });

      // 2) If a new image file is provided, upload attachment.
      if (data.imageFile) {
        const formData = new FormData();
        formData.append('module_type', '5');
        formData.append('module_id', String(id));
        formData.append('attachment_type', '1');
        formData.append('attachment', data.imageFile, data.imageFile.name);

        await api.post('/attachment', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Online promotion updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["onlinePromotions"] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update online promotion",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await bannersApi.deleteBanner(id);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Online promotion deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["onlinePromotions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete online promotion",
        variant: "destructive",
      });
    },
  });

  const promotions = data?.data || [];
  const totalItems = data?.total || 0;

  // Filter promotions based on search and (optional) location
  const filteredPromotions = promotions.filter((promotion) => {
    const matchesText =
      promotion.name.toLowerCase().includes(search.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(search.toLowerCase()) ||
      promotion.category_name?.toLowerCase().includes(search.toLowerCase()) ||
      promotion.category.toLowerCase().includes(search.toLowerCase());

    const matchesLocation = locationFilter
      ? String(promotion.restaurant_id ?? '') === locationFilter
      : true;

    return matchesText && matchesLocation;
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Online Promotions",
      description: "Online promotion data is being refreshed."
    });
  };

  const handleAddNew = () => {
    setSelectedPromotion(undefined);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (promotion: OnlinePromotion) => {
    setSelectedPromotion(promotion);
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (promotion: OnlinePromotion) => {
    setSelectedPromotion(promotion);
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (promotion: OnlinePromotion) => {
    if (window.confirm("Are you sure you want to delete this online promotion?")) {
      await deleteMutation.mutateAsync(promotion.id);
    }
  };

  const handleSubmit = async (data: SubmitPayload) => {
    if (selectedPromotion) {
      await updateMutation.mutateAsync({
        id: selectedPromotion.id,
        data
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Online Promotions</h1>
      </div>

      <div className="space-y-6">
        {/* Filter & action bar */}
        <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:gap-3">
          <select
            className="h-10 w-full md:min-w-[180px] bg-white border border-gray-300 rounded px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            disabled={isLoadingRestaurants}
            aria-label="Location"
          >
            <option value="">All Locations</option>
            {availableRestaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
          <Input
            placeholder="Search Online Promotions"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full md:min-w-[200px] md:max-w-[300px] text-sm"
            aria-label="Search Online Promotions"
          />
          <Button variant="outline" size="icon" onClick={handleRefresh} className="h-10 w-10 md:ml-auto">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="default" onClick={handleAddNew} className="h-10 px-4 w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Online Promotion
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90 rounded-t-lg">
              <TableHead className="text-white rounded-tl-lg">ID</TableHead>
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white text-right rounded-tr-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-muted-foreground">Loading...</span>
                </TableCell>
              </TableRow>
            ) : filteredPromotions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-muted-foreground">No online promotions found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredPromotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">{promotion.id}</TableCell>
                  <TableCell>{promotion.name}</TableCell>
                  <TableCell>{promotion.description ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={promotion.status === 1 ? "success" : "secondary"}>
                      {promotion.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleView(promotion)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(promotion)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(promotion)}>
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
          currentPage={page}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>

      <OnlinePromotionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        promotion={selectedPromotion}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        isViewMode={isViewMode}
      />
    </div>
  );
}
