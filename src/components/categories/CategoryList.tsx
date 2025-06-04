import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DragDropContext } from "react-beautiful-dnd";
import { Category, useCategories } from './CategoriesContext';
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react"; // Add missing import
import {
  CategoryListHeader,
  CategoryListBody,
  CategoryPagination,
  ApiDataView
} from './list';

interface CategoryListProps {
  onViewEdit: (category: Category, viewOnly: boolean) => void;
  onUpdateSequence: (categoryId: string, newSeqNo: number, categoryName: string) => void;
}

export const CategoryList = ({ onViewEdit, onUpdateSequence }: CategoryListProps) => {
  const { 
    categories, 
    setCategories, 
    currentPage, 
    setCurrentPage, 
    pageSize, 
    setPageSize, 
    totalItems,
    isLoading,
    isDragging,
    setIsDragging,
    refetch
  } = useCategories();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    const newPageSize = size === 0 ? -1 : size;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) {
      return;
    }
    
    if (result.destination.index === result.source.index) {
      return;
    }
    
    const reorderedCategories = Array.from(categories);
    const [removed] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, removed);
    
    // Calculate the new sequence number
    const newSeqNo = result.destination.index + 1;
    
    try {
      // Update the sequence in the backend
      await onUpdateSequence(removed.id, newSeqNo, removed.name);
      
      // Update local state after successful API call
      const updatedCategories = reorderedCategories.map((category, index) => ({
        ...category,
        seqNo: index + 1
      }));
      
      setCategories(updatedCategories);
      
      toast({
        title: "Success",
        description: "Category order has been updated successfully."
      });
      
      // Refresh the list to get the latest order from the server
      refetch();
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Error",
        description: "Failed to update category order. Please try again.",
        variant: "destructive"
      });
      
      // Refresh to get the current state from the server
      refetch();
    }
  };

  return (
    <div className="bg-white rounded-md border border-gray-200 mt-4 relative overflow-hidden">
      <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={onDragEnd}>
        <Table>
          <CategoryListHeader />
          <CategoryListBody 
            categories={categories} 
            isDragging={isDragging} 
            isLoading={isLoading}
            onViewEdit={onViewEdit} 
          />
        </Table>
      </DragDropContext>
      
      <CategoryPagination 
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <Loader className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};
