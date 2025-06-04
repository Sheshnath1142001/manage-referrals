import { Button } from "@/components/ui/button";
import { Eye, Edit, Copy, Settings } from "lucide-react";
import { Item } from "@/components/items/types";
import { useState } from "react";
import { AssignAttributesDialog } from "../AssignAttributesDialog";
import { getRestaurantsForProduct } from "@/services/api/items/restaurantsForProduct";
import { CopyItemDialog } from "../CopyItemDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useItems } from "@/hooks/useItems";

interface ItemActionsProps {
  item: Item;
  handleItemAction: (item: Item, action: 'view' | 'edit') => void;
}

export const ItemActions = ({ item, handleItemAction }: ItemActionsProps) => {
  const [isAttributesDialogOpen, setIsAttributesDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get required data from useItems hook
  const {
    availableCategories,
    quantityUnits,
    locations,
    discountTypes,
    fetchItems
  } = useItems({});

  // Handle view action with restaurant data fetch
  const handleViewClick = async () => {
    try {
      // Fetch restaurants for the product
      await getRestaurantsForProduct(item.id);
      // Call the original handler
      handleItemAction(item, 'view');
    } catch (error) {
      console.error('Error fetching restaurants for product:', error);
      // Still call the handler even if API fails
      handleItemAction(item, 'view');
    }
  };

  // Handle edit action with restaurant data fetch
  const handleEditClick = async () => {
    try {
      // Fetch restaurants for the product
      await getRestaurantsForProduct(item.id);
      // Call the original handler
      handleItemAction(item, 'edit');
    } catch (error) {
      console.error('Error fetching restaurants for product:', error);
      // Still call the handler even if API fails
      handleItemAction(item, 'edit');
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          size="icon"
          className="h-9 w-9 border border-gray-300"
          onClick={handleViewClick}
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          className="h-9 w-9 border border-gray-300"
          onClick={handleEditClick}
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 border border-gray-300"
          onClick={() => setIsCopyDialogOpen(true)}
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 border border-gray-300"
          onClick={() => setIsAttributesDialogOpen(true)}
          title="Assign Attributes"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <AssignAttributesDialog 
        open={isAttributesDialogOpen}
        onOpenChange={(open) => {
          console.log('AssignAttributesDialog open state changing to:', open);
          if (open) {
            console.log('Opening AssignAttributesDialog with productId:', item.id);
            console.log('Item details:', item);
          }
          setIsAttributesDialogOpen(open);
        }}
        productId={item.id.toString()}
      />

      <CopyItemDialog
        isOpen={isCopyDialogOpen}
        onOpenChange={setIsCopyDialogOpen}
        item={item}
        categories={availableCategories}
        quantityUnits={quantityUnits}
        locations={locations}
        discountTypes={discountTypes}
        fetchItems={fetchItems}
      />
    </>
  );
};