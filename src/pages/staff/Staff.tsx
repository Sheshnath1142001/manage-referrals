import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TablePagination } from "@/components/ui/table";
import { staffApi } from "@/services/api/staff";
import { useToast } from "@/hooks/use-toast";
import { StaffFilters } from "@/components/staff/StaffFilters";
import { StaffTable } from "@/components/staff/StaffTable";
import { StaffDialog } from "@/components/staff/StaffDialog";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export default function Staff() {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: "1", // Default to active staff
    search: "",
    email: "",
    phone: "",
    userType: "all",
    location: "all"
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Fetch staff with filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["staff", page, pageSize, filters.status, filters.search, filters.email, filters.phone, filters.userType, filters.location],
    queryFn: async () => {
      // Don't send status at all when "all" is selected
      let statusValue = undefined;
      if (filters.status !== "all") {
        statusValue = Number(filters.status);
      }

      const result = await staffApi.getStaffMembers({
        page,
        perPage: pageSize,
        status: statusValue,
        search: filters.search || undefined,
        email: filters.email || undefined,
        phone: filters.phone || undefined,
        roleId: filters.userType !== "all" ? filters.userType : undefined,
        restaurantId: filters.location !== "all" ? filters.location : undefined
      });
      return result;
    },
  });

  const staffData = data?.users || [];
  const totalItems = data?.total || 0;
  
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Staff",
      description: "Staff data is being refreshed."
    });
  };

  const handleAdd = () => {
    setDialogMode("add");
    setSelectedStaff(null);
    setDialogOpen(true);
  };

  const handleEdit = (staff: any) => {
    setDialogMode("edit");
    setSelectedStaff(staff);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Staff</h1>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <StaffFilters 
            status={filters.status}
            search={filters.search}
            email={filters.email}
            phone={filters.phone}
            userType={filters.userType}
            location={filters.location}
            onSearchChange={(value) => handleFilterChange("search", value)}
            onEmailChange={(value) => handleFilterChange("email", value)}
            onPhoneChange={(value) => handleFilterChange("phone", value)}
            onUserTypeChange={(value) => handleFilterChange("userType", value)}
            onLocationChange={(value) => handleFilterChange("location", value)}
            onStatusChange={(value) => handleFilterChange("status", value)}
            onClearStatusFilter={() => setFilters(prev => ({ ...prev, status: "1" }))}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} className="shrink-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="default" onClick={handleAdd} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <StaffTable 
          staffData={staffData}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleEdit}
        />
        
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

      <StaffDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={handleRefresh}
        mode={dialogMode}
        initialData={selectedStaff}
      />
    </div>
  );
}
