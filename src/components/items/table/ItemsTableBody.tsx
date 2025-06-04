import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ItemTableRow } from "./ItemTableRow";
import { Item } from "@/components/items/types";
import { DroppableProvided } from "react-beautiful-dnd";

interface Column {
  name: string;
  required?: boolean;
  field: string | ((item: any) => any);
  label: string;
  align: string;
  sortable?: boolean;
}

interface ItemsTableBodyProps {
  isLoading: boolean;
  paginatedItems: Item[];
  columns: Column[];
  provided: DroppableProvided;
  handleItemAction: (item: Item, action: 'view' | 'edit') => void;
  selectedItems: Item[];
  toggleItemSelection: (item: Item) => void;
}

export const ItemsTableBody = ({ 
  isLoading, 
  paginatedItems, 
  columns, 
  provided, 
  handleItemAction,
  selectedItems,
  toggleItemSelection 
}: ItemsTableBodyProps) => {
  if (isLoading) {
    return (
      <TableBody {...provided.droppableProps} ref={provided.innerRef}>
        <TableRow>
          <TableCell colSpan={columns.length + 4} className="h-24 text-center">
            <p className="text-gray-500">Loading items...</p>
          </TableCell>
        </TableRow>
        {provided.placeholder}
      </TableBody>
    );
  }

  if (paginatedItems.length === 0) {
    return (
      <TableBody {...provided.droppableProps} ref={provided.innerRef}>
        <TableRow>
          <TableCell colSpan={columns.length + 4} className="h-24 text-center">
            <p className="text-gray-500">No items found matching your filters</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
          </TableCell>
        </TableRow>
        {provided.placeholder}
      </TableBody>
    );
  }

  return (
    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
      {paginatedItems.map((item, index) => (
        <ItemTableRow 
          key={item.id} 
          item={item} 
          index={index} 
          columns={columns} 
          handleItemAction={handleItemAction}
          isSelected={selectedItems.some(selectedItem => selectedItem.id === item.id)}
          toggleItemSelection={toggleItemSelection}
        />
      ))}
      {provided.placeholder}
    </TableBody>
  );
};
