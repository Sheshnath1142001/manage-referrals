
export interface AttributeConfig {
  attributeId: string;
  attributeName: string;
  minSelections: string;
  maxSelections: string;
  isActive: boolean;
  isRequired: boolean;
  isEditing?: boolean;
}

export interface AttributeOption {
  label: string;
  value: string;
}
