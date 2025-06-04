
import { TableHead } from "@/components/ui/table";

interface TableColumnHeaderProps {
  name: string;
  label: string;
  align: string;
}

export const TableColumnHeader = ({ name, label, align }: TableColumnHeaderProps) => {
  return (
    <TableHead 
      className={`text-primary-foreground font-medium ${align === 'right' ? 'text-right' : ''}`}
    >
      {label}
    </TableHead>
  );
};
