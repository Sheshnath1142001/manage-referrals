import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { ItemsTableBody } from "./table/ItemsTableBody";
import { CategoryPagination } from "@/components/categories/list/CategoryPagination";
import { api } from "@/services/api/client";
import { toast } from "@/hooks/use-toast";
import { ItemsTableHeader } from "./table/ItemsTableHeader";
import { Item } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface Column {
  name: string;
  required?: boolean;
  field: string;
  label: string;
  align: string;
  sortable?: boolean;
}

interface ItemsTableProps {
  items: Item[];
  isLoading: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleItemAction: (item: Item, action: 'view' | 'edit') => void;
  selectedItems: Item[];
  toggleItemSelection: (item: Item) => void;
  toggleSelectAll: (isSelected: boolean) => void;
  updateBulkStatus: (status: number) => Promise<void>;
  onBulkEdit: () => void;
}

export const ItemsTable = ({
  items = [],
  isLoading,
  totalItems,
  currentPage,
  pageSize,
  handlePageChange,
  handlePageSizeChange,
  handleItemAction,
  selectedItems,
  toggleItemSelection,
  toggleSelectAll,
  updateBulkStatus,
  onBulkEdit,
}: ItemsTableProps) => {
  console.log({  items })
  const columns: Column[] = [
    {
      name: "id",
      required: true,
      field: 'id',
      label: "ID",
      align: "left",
      sortable: true
    },
    {
      name: "name",
      required: true,
      field: 'name',
      label: "Name",
      align: "left"
    },
    {
      name: "quantity",
      required: true,
      field: 'quantity',
      label: "Quantity",
      align: "right"
    },
    {
      name: "price",
      required: true,
      field: 'price',
      label: "Price",
      align: "right"
    },
    {
      name: "online_price",
      required: true,
      field: 'online_price',
      label: "Online Price",
      align: "right"
    },
    {
      name: "barcode",
      required: true,
      field: 'barcode',
      label: "Barcode",
      align: "left"
    },
    {
      name: "category",
      field: 'category',
      label: "Category",
      align: "left"
    },
    {
      name: "seq_no",
      field: 'seq_no',
      label: "Seq No",
      align: "right"
    },
    {
      name: "status",
      field: 'status',
      label: "Status",
      align: "left"
    }
  ];

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(items);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Calculate the new sequence number based on the destination index
    // Add 1 because sequence numbers are 1-based
    const newSeqNo = Math.min(Math.max(1, result.destination.index + 1), items.length);

    // Update sequence in the backend
    try {
      await api.patch('/shift-product-seq', {
        id: removed.id,
        name: removed.name,
        category_id: removed.category_id,
        new_seq_no: newSeqNo
      });
      
      toast({
        title: "Success",
        description: "Item sequence has been updated successfully."
      });
      
      // Refresh the items list without opening the view dialog
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Error",
        description: "Failed to update item sequence. Please try again.",
        variant: "destructive"
      });
    }
  };

  const areAllItemsSelected = items.length > 0 && selectedItems.length === items.length;
  
  const handleSelectAllChange = (checked: boolean) => {
    toggleSelectAll(checked);
  };
  return (
    <div className="space-y-4">
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateBulkStatus(1)}
            >
              Set Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateBulkStatus(0)}
            >
              Set Inactive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkEdit}
            >
              Bulk Edit
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Table>
            <TableHeader className="overflow-hidden rounded-t-[8px]">
              <TableRow className="bg-[#1E293B] hover:bg-[#1E293B]">
                <TableHead className="text-white font-medium w-[40px] first:rounded-tl-[8px]">
                  <Checkbox 
                    checked={areAllItemsSelected}
                    onCheckedChange={handleSelectAllChange}
                    className="border-white"
                  />
                </TableHead>
                <TableHead className="text-white font-medium w-[40px]"></TableHead>
                {columns.map((column, index) => (
                  <TableHead 
                    key={column.name} 
                    className={`text-white font-medium ${column.align === 'right' ? 'text-right' : ''} ${
                      index === columns.length - 1 ? 'last:rounded-tr-[8px]' : ''
                    }`}
                  >
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-right w-[100px] last:rounded-tr-[8px]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <Droppable droppableId="items">
              {(provided) => (
                <ItemsTableBody
                  isLoading={isLoading}
                  paginatedItems={items}
                  columns={columns}
                  provided={provided}
                  handleItemAction={handleItemAction}
                  selectedItems={selectedItems}
                  toggleItemSelection={toggleItemSelection}
                />
              )}
            </Droppable>
          </Table>
        </DragDropContext>

        <CategoryPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
};
