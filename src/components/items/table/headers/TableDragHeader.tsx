
import { TableHead } from "@/components/ui/table";
import { MoreVertical } from "lucide-react";

export const TableDragHeader = () => {
  return (
    <TableHead className="w-10">
      <MoreVertical className="h-4 w-4 text-white" />
    </TableHead>
  );
};
