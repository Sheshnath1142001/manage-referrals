
import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Droppable } from "react-beautiful-dnd";
import { CategoryItem } from "./CategoryItem";
import { Category } from "../CategoriesContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

interface CategoryListBodyProps {
  categories: Category[];
  isDragging: boolean;
  isLoading: boolean;
  onViewEdit: (category: Category, viewOnly: boolean) => void;
}

export const CategoryListBody = React.memo(({ 
  categories, 
  isDragging, 
  isLoading,
  onViewEdit 
}: CategoryListBodyProps) => {
  if (isLoading) {
    return (
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-[250px]" />
              </div>
            </TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  }

  return (
    <Droppable droppableId="categories">
      {(provided) => (
        <TableBody
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={isDragging ? "bg-gray-50" : ""}
        >
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <CategoryItem 
                key={category.id}
                category={category}
                index={index}
                onViewEdit={onViewEdit}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                No categories found matching your filters
              </TableCell>
            </TableRow>
          )}
          {provided.placeholder}
        </TableBody>
      )}
    </Droppable>
  );
});

CategoryListBody.displayName = "CategoryListBody";
