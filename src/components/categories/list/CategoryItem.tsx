
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Eye, Pencil, GripVertical } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { Category, useCategories } from "../CategoriesContext";

interface CategoryItemProps {
  category: Category;
  index: number;
  onViewEdit: (category: Category, viewOnly: boolean) => void;
}

export const CategoryItem = ({ category, index, onViewEdit }: CategoryItemProps) => {
  const { 
    draggedCategory, 
    dragOverCategory, 
    handleDragStart, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop 
  } = useCategories();

  return (
    <Draggable key={category.id} draggableId={category.id} index={index}>
      {(provided, snapshot) => (
        <TableRow 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`border-t ${snapshot.isDragging ? "bg-gray-100 opacity-70" : "hover:bg-gray-50"}
                    ${draggedCategory?.id === category.id ? "bg-gray-100 opacity-70" : ""}
                    ${dragOverCategory?.id === category.id ? "border-t-2 border-primary" : ""}`}
          draggable="true"
          onDragStart={() => handleDragStart?.(category)}
          onDragOver={(e) => handleDragOver?.(e, category)}
          onDragLeave={() => handleDragLeave?.()}
          onDrop={() => handleDrop?.(category)}
        >
          <TableCell>{category.id}</TableCell>
          <TableCell className="w-10 p-0">
            <div 
              {...provided.dragHandleProps} 
              className="flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </div>
          </TableCell>
          <TableCell className="font-medium">{category.name}</TableCell>
          <TableCell>
            <span className={`px-2 py-1 rounded-full text-xs ${
              category.status === "active" 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {category.status === "active" ? "Active" : "Inactive"}
            </span>
          </TableCell>
          <TableCell className="text-center">{category.seqNo}</TableCell>
          <TableCell>
            <div className="flex gap-2 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-transparent bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200"
                      onClick={() => onViewEdit(category, true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Category</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 rounded-full border-transparent bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200"
                      onClick={() => onViewEdit(category, false)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Category</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Draggable>
  );
};
