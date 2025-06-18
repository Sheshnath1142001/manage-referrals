import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TablePagination } from "@/components/ui/table";
import { staffApi } from "@/services/api/staff";
import { useToast } from "@/hooks/use-toast";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { StaffFilters } from "@/components/staff/StaffFilters";
import { StaffTable } from "@/components/staff/StaffTable";
import { StaffDialog } from "@/components/staff/StaffDialog";

const Staff = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    status: "1", // Default to status 1 staff
    search: ""
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Fetch staff with filters
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["staff", page, pageSize, filters.status, filters.search],
    queryFn: async () => {
      
      
      // Don't send status at all when "all" is selected
      let statusValue = undefined;
      if (filters.status !== "all") {
        statusValue = Number(filters.status);
      }
      
      // Only send search if not empty
      const searchValue = filters.search ? filters.search : undefined;
      
      const result = await staffApi.getStaffMembers(
        page, 
        pageSize,
        statusValue,
        searchValue,
        undefined
      );
      
      
      return result;
    },
  });

  // Extract staff data and total safely
  const staffData = data?.users || [];
  const totalItems = data?.total || 0;
  
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
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

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedStaff(null);
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <StaffHeader 
          onRefresh={handleRefresh}
          onAdd={handleAdd}
        />
        
        <StaffFilters 
          status={filters.status}
          search={filters.search}
          onSearchChange={(value) => handleFilterChange("search", value)}
          onStatusChange={(value) => handleFilterChange("status", value)}
          onClearStatusFilter={() => setFilters(prev => ({ ...prev, status: "1" }))}
        />
        
        <Card>
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
        </Card>

        <StaffDialog
          isOpen={dialogOpen}
          onClose={handleCloseDialog}
          onSuccess={handleRefresh}
          mode={dialogMode}
          initialData={selectedStaff}
        />
      </div>
    </div>
  );
};

export default Staff;
