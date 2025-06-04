import { Edit, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AttributeValue } from "@/types/productAttributes";
import { useState } from "react";
import { attributeValuesService } from "@/services/api/items/attributeValues";
import { toast } from "sonner";

interface AttributeValueTableProps {
  attributeValues: AttributeValue[];
  attributeId: number;
  onAddValue: () => void;
  onEditValue: (value: AttributeValue) => void;
}

export function AttributeValueTable({ 
  attributeValues, 
  attributeId, 
  onAddValue,
  onEditValue 
}: AttributeValueTableProps) {
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedValue, setDraggedValue] = useState<AttributeValue | null>(null);
  
  // Filter values to only show those that belong to the current attribute
  const filteredValues = attributeValues.filter(value => value.attribute_id === attributeId);
  
  // Sort values by sequence number - handle both sequence and seq_no properties
  const sortedValues = [...filteredValues].sort((a, b) => {
    const aSeq = a.seq_no !== undefined ? a.seq_no : a.sequence;
    const bSeq = b.seq_no !== undefined ? b.seq_no : b.sequence;
    return aSeq - bSeq;
  });
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, value: AttributeValue) => {
    setIsDragging(true);
    setDraggedValue(value);
    
    // Required for Firefox
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', value.id.toString());
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop
  const handleDrop = async (e: React.DragEvent, targetValue: AttributeValue) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!draggedValue || draggedValue.id === targetValue.id) return;
    
    // Get sequence numbers, handling both properties
    const targetSeq = targetValue.seq_no !== undefined ? targetValue.seq_no : targetValue.sequence;
    
    // Update the sequence numbers
    try {
      await attributeValuesService.updateProductAttributeValuesSeqNo({
        id: draggedValue.id,
        seq_no: targetSeq
      });
      
      toast.success("Attribute value order updated successfully");
      
      // Refetch values or update local state
      // This would typically happen through a query invalidation in a real app
    } catch (error) {
      console.error("Error updating sequence:", error);
      toast.error("Failed to update attribute value order");
    }
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedValue(null);
  };

  // Handle edit value
  const handleEditValue = (value: AttributeValue) => {
    onEditValue(value);
  };
  
  return (
    <div className="p-2 pl-12">
      <div className="flex justify-between items-center mb-2 px-4 py-2 bg-muted/20">
        <h3 className="font-medium">Attribute Values</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onAddValue}
          className="h-9 bg-white border border-gray-300"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Value
        </Button>
      </div>
      
      <div className="bg-white rounded-md border border-gray-200 overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-white hover:bg-white">
              <TableHead className="w-12 text-gray-500 font-medium"></TableHead>
              <TableHead className="text-gray-500 font-medium">Value</TableHead>
              <TableHead className="text-gray-500 font-medium">Base Price</TableHead>
              <TableHead className="text-gray-500 font-medium">Default</TableHead>
              <TableHead className="text-gray-500 font-medium">Sequence</TableHead>
              <TableHead className="text-gray-500 font-medium">Status</TableHead>
              <TableHead className="text-gray-500 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedValues.length > 0 ? (
              sortedValues.map((value) => (
                <TableRow 
                  key={value.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, value)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, value)}
                  onDragEnd={handleDragEnd}
                  className={`border-t hover:bg-gray-50 ${isDragging && draggedValue?.id === value.id ? "opacity-50" : ""}`}
                >
                  <TableCell className="w-12">
                    <div className="flex items-center justify-center cursor-grab">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{value.name}</div>
                    <div className="text-sm text-muted-foreground">Display: {value.display_name || value.name}</div>
                  </TableCell>
                  <TableCell>${typeof value.base_price === 'number' ? value.base_price.toFixed(2) : value.base_price}</TableCell>
                  <TableCell>{value.is_default ? "Yes" : "No"}</TableCell>
                  <TableCell>{value.seq_no !== undefined ? value.seq_no : value.sequence}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      value.status === 'Active' || value.status === 1
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {typeof value.status === 'string' ? value.status : value.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-9 w-9 border border-gray-300"
                      onClick={() => handleEditValue(value)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-gray-500">No values for this attribute</p>
                  <p className="text-sm text-gray-400 mt-2">Click 'Add Value' to add a new value</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
