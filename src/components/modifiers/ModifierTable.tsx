import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Modifier } from "@/types/modifiers";

interface ModifierTableProps {
  modifiers: Modifier[];
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onDragEnd: (result: any) => void;
  onEdit: (modifier: Modifier) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const ModifierTable = ({
  modifiers,
  isLoading,
  currentPage,
  totalItems,
  pageSize,
  onDragEnd,
  onEdit,
  onPageChange,
  onPageSizeChange,
}: ModifierTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 relative overflow-x-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1E293B] hover:bg-[#1E293B]">
              <TableHead className="w-10 text-white font-medium"></TableHead>
              <TableHead className="w-10 text-white font-medium">Id</TableHead>
              <TableHead className="text-white font-medium">Modifier</TableHead>
              <TableHead className="text-white font-medium">Seq No</TableHead>
              <TableHead className="text-white font-medium">Modifier category</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="modifiers">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading modifiers...
                    </TableCell>
                  </TableRow>
                ) : modifiers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No modifiers found. Try adjusting your filters or add a new modifier.
                    </TableCell>
                  </TableRow>
                ) : (
                  modifiers.map((modifier, index) => (
                    <Draggable 
                      key={modifier.id} 
                      draggableId={modifier.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "bg-gray-50" : ""}
                        >
                          <TableCell>
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                          </TableCell>
                          <TableCell>{modifier.id}</TableCell>
                          <TableCell className="font-medium">{modifier.name}</TableCell>
                          <TableCell>{modifier.seqNo}</TableCell>
                          <TableCell>{modifier.category}</TableCell>
                          <TableCell>
                            <span className={modifier.status === 'Active' ? 'text-green-600' : 'text-gray-600'}>
                              {modifier.status}
                            </span>
                          </TableCell>
                          <TableCell className="">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-9 w-9 border border-gray-300"
                              onClick={() => onEdit(modifier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
        <TablePagination 
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </DragDropContext>
    </div>
  );
};

export default ModifierTable;
