import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Plus, RotateCcw } from "lucide-react";
import { QuantityUnitDialog } from "@/components/quantity-units/QuantityUnitDialog";
import { useQuantityUnits } from "@/hooks/useQuantityUnits";

export default function QuantityUnits() {
  const {
    quantityUnits,
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchQuantityUnits
  } = useQuantityUnits();

  // Dialog controls
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit" | "view">("add");
  const [selectedUnit, setSelectedUnit] = React.useState<any | undefined>();
  
  // Local search state for debounce
  const [searchInput, setSearchInput] = useState(search);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleAddClick = () => {
    setDialogMode("add");
    setSelectedUnit(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (unit: any) => {
    setDialogMode("edit");
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  const handleViewClick = (unit: any) => {
    setDialogMode("view");
    setSelectedUnit(unit);
    setDialogOpen(true);
  };

  // Handle status change to trigger API fetch
  const handleStatusChange = (value: typeof status) => {
    setStatus(value);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Quantity Units</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Search Units"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Select value={status} onValueChange={handleStatusChange}>
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
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="icon" onClick={fetchQuantityUnits}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                <TableHead className="text-white">Id</TableHead>
                <TableHead className="text-white">Unit</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <span className="text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : quantityUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <span className="text-muted-foreground">No units found</span>
                  </TableCell>
                </TableRow>
              ) : (
                quantityUnits.map(unit => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.id}</TableCell>
                    <TableCell>{unit.unit}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        unit.status === 1 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {unit.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleViewClick(unit)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(unit)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <QuantityUnitDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        initialData={selectedUnit}
        onSuccess={fetchQuantityUnits}
      />
    </div>
  );
}
