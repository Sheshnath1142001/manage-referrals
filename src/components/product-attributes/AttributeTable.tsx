import React, { useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { ProductAttribute } from "@/types/productAttributes";
import { AttributeValue } from "@/types/productAttributes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CategoryPagination } from "@/components/categories/list/CategoryPagination";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { attributesService } from "@/services/api/items/productAttributes";
import { attributeValuesService } from "@/services/api/items/productAttributeValues";
import { useToast } from "@/hooks/use-toast";

interface AttributeTableProps {
  attributes: ProductAttribute[];
  attributeValues: AttributeValue[];
  totalItems: number;
  expandedAttribute: ProductAttribute | null;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleExpand: (attribute: ProductAttribute) => void;
  onEditAttribute: (attribute: ProductAttribute) => void;
  onViewAttribute: (attribute: ProductAttribute) => void;
  onAddAttributeValue: (attribute: ProductAttribute) => void;
  onEditAttributeValue: (attributeValue: AttributeValue) => void;
  onRefresh?: () => void;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({
  attributes,
  attributeValues,
  totalItems,
  expandedAttribute,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onToggleExpand,
  onEditAttribute,
  onViewAttribute,
  onAddAttributeValue,
  onEditAttributeValue,
  onRefresh,
}) => {
  const { toast } = useToast();

  // Log when attribute values change
  useEffect(() => {
    
    
  }, [attributeValues, expandedAttribute]);

  // Handle attribute drag and drop
  const handleAttributeDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }

    const draggedAttribute = attributes[result.source.index];
    const targetAttribute = attributes[result.destination.index];
    
    try {
      await attributesService.updateSequence({
        id: draggedAttribute.id,
        new_seq_no: targetAttribute.sequence
      });

      toast({
        title: "Success",
        description: "Attribute order updated successfully",
      });

      // Refresh the data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update attribute order",
        variant: "destructive",
      });
    }
  };

  // Handle attribute value drag and drop
  const handleAttributeValueDragEnd = async (result: DropResult) => {
    if (!result.destination || result.source.index === result.destination.index) {
      return;
    }

    // Filter values for the expanded attribute
    const expandedAttributeValues = attributeValues.filter(
      value => value.attribute_id === expandedAttribute?.id
    ).sort((a, b) => {
      const aSeq = a.seq_no !== undefined ? a.seq_no : a.sequence;
      const bSeq = b.seq_no !== undefined ? b.seq_no : b.sequence;
      return aSeq - bSeq;
    });

    const draggedValue = expandedAttributeValues[result.source.index];
    const targetValue = expandedAttributeValues[result.destination.index];
    
    try {
      const targetSeq = targetValue.seq_no !== undefined ? targetValue.seq_no : targetValue.sequence;
      
      await attributeValuesService.updateProductAttributeValuesSeqNo({
        id: draggedValue.id,
        new_seq_no: targetSeq
      });

      toast({
        title: "Success",
        description: "Attribute value order updated successfully",
      });

      // Refresh the data
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update attribute value order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative overflow-x-auto">
      <DragDropContext onDragEnd={handleAttributeDragEnd}>
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1E293B] hover:bg-[#1E293B] rounded-t-lg">
              <TableHead className="w-[50px] text-white font-medium rounded-tl-lg"></TableHead>
              <TableHead className="w-[50px] text-white font-medium"></TableHead>
              <TableHead className="text-white font-medium">Id</TableHead>
              <TableHead className="text-white font-medium">Name</TableHead>
              <TableHead className="text-white font-medium">Display name</TableHead>
              <TableHead className="text-white font-medium">Attribute type</TableHead>
              <TableHead className="text-white font-medium">Is required</TableHead>
              <TableHead className="text-white font-medium">Min selections</TableHead>
              <TableHead className="text-white font-medium">Max selections</TableHead>
              <TableHead className="text-white font-medium">Sequence</TableHead>
              <TableHead className="text-white font-medium">Status</TableHead>
              <TableHead className="text-white font-medium text-center rounded-tr-lg">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <Droppable droppableId="attributes">
            {(provided) => (
              <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : attributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-4">No attributes found.</TableCell>
                  </TableRow>
                ) : (
                  attributes.map((attribute, index) => {
                    const isExpanded = expandedAttribute?.id === attribute.id;
                    // Filter and sort attribute values for this attribute
                    const currentAttributeValues = attributeValues
                      .filter(value => value.attribute_id === attribute.id)
                      .sort((a, b) => {
                        const aSeq = a.seq_no !== undefined ? a.seq_no : a.sequence;
                        const bSeq = b.seq_no !== undefined ? b.seq_no : b.sequence;
                        return aSeq - bSeq;
                      });

                    return [
                      <Draggable key={attribute.id} draggableId={attribute.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <TableRow 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "hover:bg-gray-50",
                              snapshot.isDragging && "bg-blue-50 shadow-lg"
                            )}
                          >
                            <TableCell className="w-[50px]">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggleExpand(attribute)}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                            <TableCell className="w-[50px]" {...provided.dragHandleProps}>
                              <div className="flex items-center justify-center cursor-grab">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </TableCell>
                            <TableCell>{attribute.id}</TableCell>
                            <TableCell>{attribute.name}</TableCell>
                            <TableCell>{attribute.display_name}</TableCell>
                            <TableCell>{attribute.attribute_type}</TableCell>
                            <TableCell>
                              <Badge variant={attribute.is_required ? "default" : "secondary"}>
                                {attribute.is_required ? "Required" : "Not Required"}
                              </Badge>
                            </TableCell>
                            <TableCell>{attribute.min_selections}</TableCell>
                            <TableCell>{attribute.max_selections}</TableCell>
                            <TableCell>{attribute.sequence}</TableCell>
                            <TableCell>
                              <Badge variant={(attribute.status === 1 || attribute.status === "Active") ? "default" : "secondary"}>
                                {(attribute.status === 1 || attribute.status === "Active") ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => onViewAttribute(attribute)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onEditAttribute(attribute)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>,
                      isExpanded && (
                        <TableRow key={`expanded-${attribute.id}`}>
                          <TableCell colSpan={12} className="p-0">
                            <div className="bg-gray-50 p-4">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold">Values for {attribute.name} (ID: {attribute.id})</h4>
                                <Button 
                                  size="sm" 
                                  className="bg-gray-900 hover:bg-gray-800" 
                                  onClick={() => onAddAttributeValue(attribute)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Value
                                </Button>
                              </div>

                              {currentAttributeValues.length === 0 ? (
                                <p className="text-sm text-gray-500">No values added for this attribute.</p>
                              ) : (
                                <DragDropContext onDragEnd={handleAttributeValueDragEnd}>
                                  <Droppable droppableId={`attribute-values-${attribute.id}`}>
                                    {(provided) => (
                                      <div ref={provided.innerRef} {...provided.droppableProps}>
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-gray-200 hover:bg-gray-200">
                                              <TableHead className="w-[50px]"></TableHead>
                                              <TableHead className="font-semibold">Value</TableHead>
                                              <TableHead className="font-semibold">Base Price</TableHead>
                                              <TableHead className="font-semibold">Default</TableHead>
                                              <TableHead className="font-semibold">Sequence</TableHead>
                                              <TableHead className="font-semibold">Status</TableHead>
                                              <TableHead className="text-center">Actions</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {currentAttributeValues.map((value, valueIndex) => (
                                              <Draggable 
                                                key={value.id} 
                                                draggableId={`value-${value.id}`} 
                                                index={valueIndex}
                                              >
                                                {(provided, snapshot) => (
                                                  <TableRow 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                      "hover:bg-white border-t border-gray-200",
                                                      snapshot.isDragging && "bg-blue-50 shadow-lg"
                                                    )}
                                                  >
                                                    <TableCell className="w-[50px]" {...provided.dragHandleProps}>
                                                      <div className="flex items-center justify-center cursor-grab">
                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                      {value.name}
                                                      {value.display_name && value.display_name !== value.name && (
                                                        <div className="text-xs text-gray-500">Display: {value.display_name}</div>
                                                      )}
                                                    </TableCell>
                                                    <TableCell>
                                                      $ {value.base_price.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                      {value.is_default ? "Yes" : "No"}
                                                    </TableCell>
                                                    <TableCell>
                                                      {value.seq_no !== undefined ? value.seq_no : value.sequence}
                                                    </TableCell>
                                                    <TableCell>
                                                      <Badge variant={value.status === "Active" ? "default" : "secondary"}>
                                                        {value.status}
                                                      </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                      <Button variant="ghost" size="icon" onClick={() => onEditAttributeValue(value)}>
                                                        <Edit className="h-4 w-4" />
                                                      </Button>
                                                    </TableCell>
                                                  </TableRow>
                                                )}
                                              </Draggable>
                                            ))}
                                            {provided.placeholder}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    )}
                                  </Droppable>
                                </DragDropContext>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ].filter(Boolean);
                  }).flat()
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </DragDropContext>
      
      {/* Replace Pagination with CategoryPagination */}
      <CategoryPagination
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
