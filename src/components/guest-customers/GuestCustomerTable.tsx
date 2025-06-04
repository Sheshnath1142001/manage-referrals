
import React from "react";
import { Eye, PenSquare } from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GuestCustomer } from "@/services/api/guestCustomers";

interface GuestCustomerTableProps {
  guestCustomers: GuestCustomer[];
  isLoading: boolean;
  isError: boolean;
  onView: (customerId: string) => void;
  onEdit: (customerId: string) => void;
}

export function GuestCustomerTable({ 
  guestCustomers, 
  isLoading, 
  isError, 
  onView, 
  onEdit 
}: GuestCustomerTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground">Name</TableHead>
            <TableHead className="text-primary-foreground">Email</TableHead>
            <TableHead className="text-primary-foreground">Phone</TableHead>
            <TableHead className="text-primary-foreground">Status</TableHead>
            <TableHead className="text-primary-foreground">Location</TableHead>
            <TableHead className="text-primary-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                Loading guest customers...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-red-500">
                Error loading guest customers. Please try again.
              </TableCell>
            </TableRow>
          ) : guestCustomers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10">
                No guest customers found.
              </TableCell>
            </TableRow>
          ) : (
            guestCustomers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-secondary/20">
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      customer.status === "Active" || customer.status === 1 
                        ? "success" 
                        : "secondary"
                    }
                  >
                    {customer.status === "Active" || customer.status === 1 
                      ? "Active" 
                      : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{customer.address || "—"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() => onView(customer.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                      onClick={() => onEdit(customer.id)}
                    >
                      <PenSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
