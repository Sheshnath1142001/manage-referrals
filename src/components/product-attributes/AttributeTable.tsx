import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { ProductAttribute } from "@/types/productAttributes";
import { AttributeValue } from "@/types/productAttributes";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CategoryPagination } from "@/components/categories/list/CategoryPagination";
import { attributeValuesService } from "@/services/api/items/attributeValues";
import { attributesService } from "@/services/api/items/productAttributes";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

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
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [draggedValue, setDraggedValue] = useState<AttributeValue | null>(null);
  const [isDraggingAttribute, setIsDraggingAttribute] = useState(false);
  const [draggedAttribute, setDraggedAttribute] = useState<ProductAttribute | null>(null);

  // Log when attribute values change
  useEffect(() => {
    console.log('AttributeTable - attributeValues:', attributeValues);
    console.log('AttributeTable - expandedAttribute:', expandedAttribute);
  }, [attributeValues, expandedAttribute]);

  const handleDragStart = (e: React.DragEvent, value: AttributeValue) => {
    setIsDragging(true);
    setDraggedValue(value);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetValue: AttributeValue) => {
    e.preventDefault();
    setIsDragging(false);

    if (!draggedValue || draggedValue.id === targetValue.id) return;

    try {
      await attributeValuesService.updateSequence({
        id: draggedValue.id,
        new_seq_no: targetValue.sequence
      });

      // Show success message
      toast({
        title: "Success",
        description: "Attribute value sequence updated successfully",
      });

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
    } catch (error) {
      console.error('Failed to update sequence:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute value sequence",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedValue(null);
  };

  // Attribute drag handlers
  const handleAttributeDragStart = (e: React.DragEvent, attribute: ProductAttribute) => {
    setIsDraggingAttribute(true);
    setDraggedAttribute(attribute);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleAttributeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleAttributeDrop = async (e: React.DragEvent, targetAttribute: ProductAttribute) => {
    e.preventDefault();
    setIsDraggingAttribute(false);

    if (!draggedAttribute || draggedAttribute.id === targetAttribute.id) return;

    try {
      await attributesService.updateSequence({
        id: draggedAttribute.id,
        new_seq_no: targetAttribute.sequence
      });

      // Show success message
      toast({
        title: "Success",
        description: "Attribute sequence updated successfully",
      });

      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['product-attributes'] });
    } catch (error) {
      console.error('Failed to update sequence:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute sequence",
        variant: "destructive",
      });
    }
  };

  const handleAttributeDragEnd = () => {
    setIsDraggingAttribute(false);
    setDraggedAttribute(null);
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[#1E293B] hover:bg-[#1E293B] [&>th:first-child]:rounded-tl-xl [&>th:last-child]:rounded-tr-xl">
            <TableHead className="w-[50px] text-white font-medium"></TableHead>
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
            <TableHead className="text-white font-medium text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">Loading...</TableCell>
            </TableRow>
          ) : attributes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">No attributes found.</TableCell>
            </TableRow>
          ) : (
            attributes.map((attribute) => {
              const isExpanded = expandedAttribute?.id === attribute.id;
              return [
                <TableRow 
                  key={`row-${attribute.id}`} 
                  className={cn(
                    "hover:bg-gray-50",
                    isDraggingAttribute && draggedAttribute?.id === attribute.id && "opacity-50"
                  )}
                  draggable
                  onDragStart={(e) => handleAttributeDragStart(e, attribute)}
                  onDragOver={handleAttributeDragOver}
                  onDrop={(e) => handleAttributeDrop(e, attribute)}
                  onDragEnd={handleAttributeDragEnd}
                >
                  <TableCell className="w-[50px]">
                    <div className="flex items-center justify-center cursor-grab">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleExpand(attribute)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
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
                </TableRow>,
                isExpanded && (
                  <TableRow key={`expanded-${attribute.id}`}>
                    <TableCell colSpan={11} className="p-0">
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

                        {attributeValues.length === 0 ? (
                          <p className="text-sm text-gray-500">No values added for this attribute.</p>
                        ) : (
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
                              {attributeValues.map((value) => (
                                <TableRow 
                                  key={value.id} 
                                  className={cn(
                                    "hover:bg-white border-t border-gray-200",
                                    isDragging && draggedValue?.id === value.id && "opacity-50"
                                  )}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, value)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, value)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <TableCell className="w-[50px]">
                                    <div className="flex items-center justify-center cursor-grab">
                                      <GripVertical className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {value.name}
                                    {value.display_name && value.display_name !== value.name && (
                                      <div className="text-xs text-gray-500">Display: {value.display_name}</div>
                                    )}
                                  </TableCell>
                                  <TableCell>$ {value.base_price.toFixed(2)}</TableCell>
                                  <TableCell>{value.is_default ? "Yes" : "No"}</TableCell>
                                  <TableCell>{value.sequence}</TableCell>
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
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ].filter(Boolean);
            }).flat()
          )}
        </TableBody>
      </Table>
      
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
