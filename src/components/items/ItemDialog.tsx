
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ItemFormFields } from "./ItemFormFields";
import { ItemDialogFooter } from "./ItemDialogFooter";
import { useQuery } from "@tanstack/react-query";
import { getRestaurantsForProduct } from "@/services/api/items/restaurantsForProduct";
import { Badge } from "@/components/ui/badge";

interface ItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isViewMode: boolean;
  editingItem: any | null;
  formData: any;
  updateFormField: (field: string, value: any) => void;
  resetForm: () => void;
  fetchItems: () => void;
  allCategories: Array<{id: number, category: string}>;
  categories: Array<{id: number, category: string}>;
  quantityUnits: Array<{id: number, unit: string}>;
  locations: Array<{id: number, name: string}>;
  discountTypes: Array<{id: number, type: string}>;
}

export const ItemDialog = ({
  isOpen,
  onOpenChange,
  isViewMode,
  editingItem,
  formData,
  updateFormField,
  resetForm,
  fetchItems,
  categories,
  quantityUnits,
  locations,
  discountTypes,
  allCategories
}: ItemDialogProps) => {
  // Fetch restaurants for product when editing/viewing
  const { data: restaurantsForProduct = [], isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['restaurants-for-product', editingItem?.id],
    queryFn: () => getRestaurantsForProduct(editingItem.id),
    enabled: isOpen && !!editingItem?.id && (isViewMode || !!editingItem),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] w-[95vw] p-4 max-h-[90vh] overflow-y-auto" hideCloseButton>
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isViewMode ? 'View' : editingItem ? 'Edit' : 'Add'} Item
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <form className="space-y-4">
          <ItemFormFields 
            formData={formData}
            updateFormField={updateFormField}
            isViewMode={isViewMode}
            editingItem={editingItem}
            categories={categories}
            allCategories={allCategories}
            quantityUnits={quantityUnits}
            locations={locations}
            discountTypes={discountTypes}
          />

          {/* Available Locations Section - Show only in view/edit mode */}
          {(isViewMode || editingItem) && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Available Locations</h3>
              {isLoadingRestaurants ? (
                <div className="text-sm text-gray-500">Loading locations...</div>
              ) : restaurantsForProduct.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {restaurantsForProduct.map((item, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className={`px-3 py-1 ${
                        item.restaurants.status === 1 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}
                    >
                      {item.restaurants.name}
                      {item.restaurants.status !== 1 && ' (Inactive)'}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">No locations assigned</div>
              )}
            </div>
          )}
        </form>

        <ItemDialogFooter
          isViewMode={isViewMode}
          editingItem={editingItem}
          formData={formData}
          onOpenChange={onOpenChange}
          resetForm={resetForm}
          fetchItems={fetchItems}
        />
      </DialogContent>
    </Dialog>
  );
};