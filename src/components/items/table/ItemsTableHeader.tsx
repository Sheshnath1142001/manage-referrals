import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const ItemsTableHeader = () => {
  return (
    <TableHeader className="overflow-hidden rounded-t-lg">
      <TableRow className="bg-[#1E293B] hover:bg-[#1E293B]">
        <TableHead className="text-white font-medium w-12">Select</TableHead>
        <TableHead className="text-white font-medium">Item Name</TableHead>
        <TableHead className="text-white font-medium">Category</TableHead>
        <TableHead className="text-white font-medium">Price</TableHead>
        <TableHead className="text-white font-medium">Status</TableHead>
        <TableHead className="text-white font-medium text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
