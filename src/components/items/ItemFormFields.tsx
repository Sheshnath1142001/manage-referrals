import { BasicInfoFields } from "./form/BasicInfoFields";
import { QuantityFields } from "./form/QuantityFields";
import { PriceFields } from "./form/PriceFields";
import { DiscountFields } from "./form/DiscountFields";
import { DescriptionSection } from "./form/DescriptionSection";
import { StatusToggle } from "./form/StatusToggle";

interface ItemFormFieldsProps {
  formData: any;
  updateFormField: (field: string, value: any) => void;
  isViewMode: boolean;
  editingItem: any | null;
  categories: Array<{id: number, category: string}>;
  allCategories: Array<{id: number, category: string}>;
  quantityUnits: Array<{id: number, unit: string}>;
  locations: Array<{id: number, name: string, status: number}>;
  discountTypes: Array<{id: number, type: string}>;
}

export const ItemFormFields = ({
  formData,
  updateFormField,
  isViewMode,
  editingItem,
  categories,
  allCategories,
  quantityUnits,
  locations,
  discountTypes,
}: ItemFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* General Information Section */}
      <BasicInfoFields 
        formData={formData}
        updateFormField={updateFormField}
        isViewMode={isViewMode}
        categories={categories}
        allCategories={allCategories}
        quantityUnits={quantityUnits}
      />

      {/* Price Information Section */}
      <PriceFields 
        formData={formData}
        updateFormField={updateFormField}
        isViewMode={isViewMode}
        locations={locations}
      />

      {/* Discount Information Section */}
      <DiscountFields 
        formData={formData}
        updateFormField={updateFormField}
        isViewMode={isViewMode}
        discountTypes={discountTypes}
      />

      {/* Description Section */}
      <DescriptionSection 
        formData={formData}
        updateFormField={updateFormField}
        isViewMode={isViewMode}
        editingItem={editingItem}
      />
      
      {/* Status toggle at the bottom */}
      <StatusToggle 
        formData={formData}
        updateFormField={updateFormField}
        isViewMode={isViewMode}
      />
    </div>
  );
};
