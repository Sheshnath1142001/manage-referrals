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
import { Customer } from "@/services/api/customers";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  isError: boolean;
  onView: (customerId: string) => void;
  onEdit: (customerId: string) => void;
}

export function CustomerTable({ customers, isLoading, isError, onView, onEdit }: CustomerTableProps) {
  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case 1:
        return "bg-green-500 hover:bg-green-600";
      case 0:
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Active";
      case 0:
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary rounded-t-md">
            <TableHead className="text-primary-foreground first:rounded-tl-md">ID</TableHead>
            <TableHead className="text-primary-foreground">Name</TableHead>
            <TableHead className="text-primary-foreground">Username</TableHead>
            <TableHead className="text-primary-foreground">Email</TableHead>
            <TableHead className="text-primary-foreground">Phone</TableHead>
            <TableHead className="text-primary-foreground">Role</TableHead>
            <TableHead className="text-primary-foreground">Status</TableHead>
            <TableHead className="text-primary-foreground last:rounded-tr-md">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                Loading customer data...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10 text-red-500">
                Error loading customer data. Please try again.
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-secondary/20">
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.username}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>
                  {customer.country_code && customer.phone_no 
                    ? `${customer.country_code} ${customer.phone_no}`
                    : customer.phone_no || '-'}
                </TableCell>
                <TableCell>{customer.roles.role}</TableCell>
                <TableCell>
                  <Badge 
                    variant="default"
                    className={getStatusBadgeVariant(customer.status)}
                  >
                    {getStatusText(customer.status)}
                  </Badge>
                </TableCell>
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
