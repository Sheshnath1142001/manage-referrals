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
  locations: Array<{id: number, name: string}>;
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
    <div className="space-y-8">
      {/* Main Fields - 3 Column Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <BasicInfoFields 
          formData={formData}
          updateFormField={updateFormField}
          isViewMode={isViewMode}
          categories={categories}
          allCategories={allCategories}
        />
        
        <QuantityFields 
          formData={formData}
          updateFormField={updateFormField}
          isViewMode={isViewMode}
          quantityUnits={quantityUnits}
        />
        
        <PriceFields 
          formData={formData}
          updateFormField={updateFormField}
          isViewMode={isViewMode}
          locations={locations}
        />
      </div>

      {/* Discount fields in a separate row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DiscountFields 
          formData={formData}
          updateFormField={updateFormField}
          isViewMode={isViewMode}
          discountTypes={discountTypes}
        />
        
        {/* Description and image in second column */}
        <div className="lg:col-span-2">
          <DescriptionSection 
            formData={formData}
            updateFormField={updateFormField}
            isViewMode={isViewMode}
          />
        </div>
      </div>
      
      {/* Status toggle at the bottom */}
      <div className="pt-2">
        <StatusToggle 
          formData={formData}
          updateFormField={updateFormField}
          isViewMode={isViewMode}
        />
      </div>
    </div>
  );
};
