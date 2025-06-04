
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
import { StaffMember } from "@/services/api/staff";

interface StaffTableProps {
  staffData: StaffMember[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (staff: StaffMember) => void;
}

export function StaffTable({ staffData, isLoading, isError, onEdit }: StaffTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90 rounded-t-lg">
          <TableHead className="text-white rounded-tl-lg">Id</TableHead>
          <TableHead className="text-white">Name</TableHead>
          <TableHead className="text-white">Type</TableHead>
          <TableHead className="text-white">Location</TableHead>
          <TableHead className="text-white">Username</TableHead>
          <TableHead className="text-white">Email</TableHead>
          <TableHead className="text-white">Phone No</TableHead>
          <TableHead className="text-white">Status</TableHead>
          <TableHead className="text-white text-right rounded-tr-lg">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <span className="text-muted-foreground">Loading...</span>
            </TableCell>
          </TableRow>
        ) : isError ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <span className="text-muted-foreground">Error loading staff data</span>
            </TableCell>
          </TableRow>
        ) : staffData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              <span className="text-muted-foreground">No staff members found</span>
            </TableCell>
          </TableRow>
        ) : (
          staffData.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell className="font-medium">{staff.id}</TableCell>
              <TableCell>{staff.name}</TableCell>
              <TableCell>{staff.roles?.role || '—'}</TableCell>
              <TableCell>{staff.restaurants_users_employee_outlet_idTorestaurants?.name || '—'}</TableCell>
              <TableCell>{staff.username || '—'}</TableCell>
              <TableCell>{staff.email}</TableCell>
              <TableCell>{staff.phone_no || '—'}</TableCell>
              <TableCell>
                <Badge variant={staff.status === 1 ? "success" : "secondary"}>
                  {staff.status === 1 ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(staff)}>
                    <PenSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
