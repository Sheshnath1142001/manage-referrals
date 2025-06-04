import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Edit, Eye, GripVertical, RefreshCw, Pencil } from "lucide-react";
import { useModifierCategories } from "./ModifierCategoriesContext";
import { modifierCategoriesApi } from "@/services/api/modifiers";
import { toast } from "@/components/ui/use-toast";
import { ModifierCategory } from "@/types/modifiers";

const ModifierCategoryTable = () => {
  const { 
    modifierCategories,
    setModifierCategories,
    nameFilter,
    seqNoFilter,
    statusFilter,
    isLoading,
    currentPage,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
    isDragging,
    setIsDragging,
    setEditingCategory,
    setDialogMode,
    setIsDialogOpen,
    isError,
    fetchModifierCategories
  } = useModifierCategories();
  
  // Use the server-filtered categories directly since filtering is now handled by the API
  const displayCategories = modifierCategories;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleEdit = (category: ModifierCategory) => {
    setEditingCategory(category);
    setDialogMode("EDIT");
    setIsDialogOpen(true);
  };

  const handleView = (category: ModifierCategory) => {
    setEditingCategory(category);
    setDialogMode("VIEW");
    setIsDialogOpen(true);
  };

  const onDragEnd = async (result: any) => {
    setIsDragging(false);
    
    if (!result.destination) {
      return;
    }
    
    if (result.destination.index === result.source.index) {
      return;
    }
    
    const reorderedCategories = Array.from(displayCategories);
    
    const [removed] = reorderedCategories.splice(result.source.index, 1);
    
    reorderedCategories.splice(result.destination.index, 0, removed);
    
    const updatedCategories = reorderedCategories.map((category, index) => ({
      ...category,
      seqNo: index + 1
    }));
    
    setModifierCategories(prevCategories => {
      const newCategories = [...prevCategories];
      
      updatedCategories.forEach(updatedCategory => {
        const index = newCategories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          newCategories[index] = { ...newCategories[index], seqNo: updatedCategory.seqNo };
        }
      });
      
      return newCategories;
    });
    
    try {
      const movedCategory = updatedCategories.find(c => c.id === removed.id);
      if (movedCategory) {
        await modifierCategoriesApi.updateModifierCategorySequence(
          movedCategory.id, 
          movedCategory.seqNo,
          movedCategory.name
        );
        
        toast({
          title: "Category Reordered",
          description: "The new sequence has been saved successfully."
        });
        
        // Refresh the data to show the latest from the server
        await fetchModifierCategories();
      }
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast({
        title: "Reordering Failed",
        description: "Failed to update the category sequence on the server.",
        variant: "destructive"
      });
      
      // Refresh to get the current state from the server
      fetchModifierCategories();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={onDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1E293B] hover:bg-[#1E293B]">
              <TableHead className="w-10 text-white font-medium">ID</TableHead>
              <TableHead className="w-10 text-white font-medium"></TableHead>
              <TableHead className="text-white font-medium">Modifier Category</TableHead>
              <TableHead className="text-white font-medium">Is Mandatory</TableHead>
              <TableHead className="text-white font-medium">Is Single Select</TableHead>
              <TableHead className="text-white font-medium">Seq No</TableHead>
              <TableHead className="text-white font-medium">Max</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="modifierCategories">
            {(provided) => (
              <TableBody
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={isDragging ? "bg-gray-50" : ""}
              >
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                        <p className="text-gray-500">Loading modifier categories...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <p className="text-gray-500">Error loading data. Please try again.</p>
                    </TableCell>
                  </TableRow>
                ) : modifierCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <p className="text-gray-500">No modifier categories found.</p>
                      <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayCategories.map((category, index) => (
                    <Draggable 
                      key={category.id} 
                      draggableId={category.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TableRow 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border-t hover:bg-gray-50 ${snapshot.isDragging ? "bg-gray-100" : ""}`}
                        >
                          <TableCell>{category.id}</TableCell>
                          <TableCell className="w-10">
                            <div 
                              {...provided.dragHandleProps} 
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>
                            {category.isMandatory ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>
                            {category.isSingleSelect ? "Yes" : "No"}
                          </TableCell>
                          <TableCell>{category.seqNo}</TableCell>
                          <TableCell>{category.max !== null ? category.max : "-"}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              category.status === 'Active' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {category.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9 border border-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(category);
                                }}
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-9 w-9 border border-gray-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(category);
                                }}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
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
      </DragDropContext>
      
      {totalItems > 0 && (
        <TablePagination 
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default ModifierCategoryTable;
