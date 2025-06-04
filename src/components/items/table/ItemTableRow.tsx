import { Item } from "@/components/items/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Draggable } from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";
import { ItemActions } from "./ItemActions";
import { Checkbox } from "@/components/ui/checkbox";

interface ItemTableRowProps {
  item: Item;
  index: number;
  columns: {
    name: string;
    required?: boolean;
    field: string | ((item: any) => any);
    label: string;
    align: string;
    sortable?: boolean;
  }[];
  handleItemAction: (item: Item, action: 'view' | 'edit') => void;
  isSelected?: boolean;
  toggleItemSelection?: (item: Item) => void;
}

export const ItemTableRow = ({ 
  item, 
  index, 
  columns, 
  handleItemAction,
  isSelected = false,
  toggleItemSelection
}: ItemTableRowProps) => {
  // Function to get the value based on field definition (string or function)
  const getCellValue = (item: Item, field: string | ((item: any) => any)) => {
    if (typeof field === 'function') {
      return field(item);
    }
    
    // Special handling for seqNo to ensure it's never displayed as zero
    if (field === 'seq_no') {
      const seqNo = (item as any)[field];
      return seqNo && seqNo > 0 ? seqNo : index + 1;
    }

    // Special handling for status
    if (field === 'status') {
      return item.status === 1 ? 'Active' : 'Inactive';
    }
    
    // Special handling for category (it's nested in categories.category)
    if (field === 'category') {
      return (item as any).categories?.category || 'Uncategorized';
    }
    
    return (item as any)[field];
  };

  const handleCheckboxChange = () => {
    if (toggleItemSelection) {
      toggleItemSelection(item);
    }
  };

  return (
    <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
      {(provided) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-t hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
        >
          <TableCell className="w-[40px] px-4">
            <Checkbox 
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
            />
          </TableCell>
          <TableCell>
            <div {...provided.dragHandleProps}>
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
          </TableCell>
          {columns.map((column) => (
            <TableCell 
              key={column.name} 
              className={`${column.name === 'name' ? 'font-medium' : ''} ${column.align === 'right' ? 'text-right' : ''}`}
            >
              {column.name === 'status' ? (
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 1
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getCellValue(item, column.field)}
                </span>
              ) : column.name === 'price' || column.name === 'online_price' ? (
                `$${getCellValue(item, column.field)}`
              ) : (
                getCellValue(item, column.field)
              )}
            </TableCell>
          ))}
          <TableCell className="text-right">
            <ItemActions item={item} handleItemAction={handleItemAction} />
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};
