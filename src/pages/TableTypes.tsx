import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TablePagination } from "@/components/ui/table";
import { tableTypesApi, TableType } from "@/services/api/tableTypes";
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
import { Plus, RefreshCw, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableTypeDialog } from "@/components/table-types/TableTypeDialog";
import { Input } from "@/components/ui/input";
import { useGetRestaurants } from '@/hooks/useGetRestaurants';

export default function TableTypes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTableType, setSelectedTableType] = useState<TableType | undefined>();
  const [search, setSearch] = useState("");
  const { restaurants: availableRestaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [locationFilter, setLocationFilter] = useState<string>("");

  // Fetch table types
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tableTypes", page, pageSize, locationFilter],
    queryFn: () => tableTypesApi.getTableTypes({
      status: 1,
      page,
      per_page: pageSize,
      with_prd_defines: 1,
      ...(locationFilter ? { restaurant_id: locationFilter } : {})
    }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { table_type: string; status: number }) => 
      tableTypesApi.createTableType({
        table_type: data.table_type,
        status: data.status
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Table type created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create table type",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { table_type: string; status: number } }) =>
      tableTypesApi.updateTableType(id, {
        table_type: data.table_type,
        status: data.status
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Table type updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update table type",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => tableTypesApi.deleteTableType(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Table type deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete table type",
        variant: "destructive",
      });
    },
  });

  const tableTypes = data?.data || [];
  const totalItems = data?.total || 0;

  // Filter table types based on search
  const filteredTableTypes = tableTypes.filter(tableType =>
    tableType.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Table Types",
      description: "Table type data is being refreshed."
    });
  };

  const handleAddNew = () => {
    setSelectedTableType(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (tableType: TableType) => {
    setSelectedTableType(tableType);
    setIsDialogOpen(true);
  };

  const handleDelete = async (tableType: TableType) => {
    if (window.confirm("Are you sure you want to delete this table type?")) {
      await deleteMutation.mutateAsync(tableType.id);
    }
  };

  const handleSubmit = async (data: { table_type: string; status: number }) => {
    if (selectedTableType) {
      await updateMutation.mutateAsync({
        id: selectedTableType.id,
        data
      });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Table Types</h1>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 w-full">
          <select
            className="h-10 min-w-[180px] bg-white border border-gray-300 rounded px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="Search Table Types"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 min-w-[200px] max-w-[300px] text-sm"
            aria-label="Search Table Types"
          />
          <Button variant="outline" size="icon" onClick={handleRefresh} className="h-10 w-10 ml-auto">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="default" onClick={handleAddNew} className="h-10 px-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Table Type
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90 rounded-t-lg">
              <TableHead className="text-white rounded-tl-lg">ID</TableHead>
              <TableHead className="text-white">Type</TableHead>
              <TableHead className="text-white">Restaurant</TableHead>
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
            ) : filteredTableTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <span className="text-muted-foreground">No table types found</span>
                </TableCell>
              </TableRow>
            ) : (
              filteredTableTypes.map((tableType) => (
                <TableRow key={tableType.id}>
                  <TableCell className="font-medium">{tableType.id}</TableCell>
                  <TableCell>{tableType.type}</TableCell>
                  <TableCell>
                    {tableType.restaurant_id ? tableType.restaurants?.name || tableType.restaurant_id : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={tableType.status === 1 ? "success" : "secondary"}>
                      {tableType.status === 1 ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {!["indoor", "outdoor", "rooftop"].includes(tableType.type.toLowerCase()) && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tableType)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
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

      <TableTypeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        tableType={selectedTableType}
        isSubmitting={createMutation.isLoading || updateMutation.isLoading}
        availableRestaurants={availableRestaurants}
        showLocationSelect={!selectedTableType}
      />
    </div>
  );
}
