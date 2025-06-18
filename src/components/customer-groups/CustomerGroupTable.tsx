import React from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell,
  TablePagination
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CustomerGroup } from "@/services/api/customerGroups";
import { format } from "date-fns";

interface CustomerGroupTableProps {
  customerGroups: CustomerGroup[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (customerGroup: CustomerGroup) => void;
  onDelete: (customerGroup: CustomerGroup) => void;
  isLoading: boolean;
}

export const CustomerGroupTable = ({ 
  customerGroups, 
  totalItems, 
  currentPage, 
  pageSize, 
  onPageChange, 
  onPageSizeChange, 
  onEdit,
  onDelete,
  isLoading 
}: CustomerGroupTableProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MM/dd/yyyy, h:mm:ss a");
    } catch (error) {
      
      return dateString;
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              <TableHead className="text-primary-foreground">Name</TableHead>
              <TableHead className="text-primary-foreground">Description</TableHead>
              <TableHead className="text-primary-foreground">Created At</TableHead>
              <TableHead className="text-primary-foreground">Status</TableHead>
              <TableHead className="text-primary-foreground text-center">Customers</TableHead>
              <TableHead className="text-primary-foreground text-center w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading customer groups...
                </TableCell>
              </TableRow>
            ) : customerGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No customer groups found
                </TableCell>
              </TableRow>
            ) : (
              customerGroups.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.description || "—"}</TableCell>
                  <TableCell>{formatDate(group.created_at)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      group.status === 1 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {group.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs">
                      {group.customers_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => onEdit(group)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20"
                        onClick={() => onDelete(group)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
