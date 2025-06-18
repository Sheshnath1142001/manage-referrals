import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface OrderLineItem {
  id: string;
  order_id: string;
  quantity: string;
  price: string;
  line_item_total: string;
  total_amount: string;
  note: string | null;
  status: number;
  product_id: number;
  is_half_and_half: number;
  deal_id: string | null;
  products: {
    id: number;
    name: string;
    description: string;
    price: string;
  };
  order_modifiers: Array<{
    id: string;
    price: string;
    quantity: number;
    restaurant_product_modifiers: {
      modifiers: {
        modifier: string;
      };
    };
  }>;
  order_line_item_configurations: Array<{
    id: string;
    price_adjustment: string;
    product_configuration_attributes: {
      name: string;
      display_name: string;
    };
    product_configuration_attribute_values: {
      value: string;
      display_value: string;
      base_price: string;
    };
  }>;
  order_line_item_portions?: Array<{
    id: string;
    portion_type: string;
    portion_ratio: string;
    restaurant_products: {
      products: {
        name: string;
      };
    };
    order_line_item_portion_modifiers: Array<{
      price: string;
      quantity: number;
      modifier_name: string;
    }>;
  }>;
  deals?: {
    name: string;
  };
  combo_products?: {
    name: string;
  };
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  note?: string;
  modifiers?: Array<{
    name: string;
    price: number;
  }>;
}

interface OrderItemsTableProps {
  items?: OrderItem[] | OrderLineItem[];
  amount: number | undefined;
  note?: string;
}

// Helper function to check if items are in the new API format (v2)
// We treat any item whose `id` is a string (the new endpoints use string IDs) as the new format.
const isOrderLineItem = (item: any): item is OrderLineItem => {
  return item && typeof item.id === 'string';
};

// Component to render order line item details
const OrderLineItemRow: React.FC<{ item: OrderLineItem; index: number }> = ({ item, index }) => {
  const basePrice = parseFloat(item.price) || 0;
  const quantity = parseInt(item.quantity) || 1;
  const totalAmount = parseFloat(item.total_amount) || 0;

  // Get product name
  let productName = item.products?.name || 'Unknown Product';
  
  // If it's a deal or combo, use that name instead
  if (item.deals?.name) {
    productName = item.deals.name;
  } else if (item.combo_products?.name) {
    productName = item.combo_products.name;
  }

  // Check if this is a combo product
  const isCombo = item.combo_products || (item as any).is_combo;
  const childItems = (item as any).child_items || (item as any).other_order_line_items || [];

  return (
    <>
      {/* Main product row */}
      <TableRow className="border-b border-gray-200 h-8 text-xs">
        <TableCell className="font-medium text-gray-800 px-2 py-1 text-xs">
          {productName}
        </TableCell>
        <TableCell className="text-right text-gray-600 px-2 py-1 text-xs">
          ${basePrice.toFixed(2)}
        </TableCell>
        <TableCell className="text-center text-gray-600 px-2 py-1 text-xs">
          {quantity}
        </TableCell>
        <TableCell className="text-right font-medium text-gray-800 px-2 py-1 text-xs">
          ${totalAmount.toFixed(2)}
        </TableCell>
        <TableCell className="text-right text-gray-600 italic px-2 py-1 text-xs">
          {item.note || ''}
        </TableCell>
      </TableRow>

      {/* Render child items for combo products */}
      {isCombo && childItems.length > 0 && childItems.map((childItem: any, childIndex: number) => {
        const childPrice = parseFloat(childItem.price) || 0;
        const childQuantity = parseInt(childItem.quantity) || 1;
        const childTotal = parseFloat(childItem.total_amount) || parseFloat(childItem.line_item_total) || 0;
        const childName = childItem.products?.name || childItem.misc_product_name || 'Unknown Item';

        return (
          <React.Fragment key={`${item.id}-child-${childIndex}`}>
            {/* Child item main row */}
            <TableRow className="bg-blue-50 border-0 h-7 text-xs">
              <TableCell className="text-xs text-blue-700 pl-8 border-0 py-1 font-medium">
                {childName}
              </TableCell>
              <TableCell className="text-right text-xs text-blue-600 border-0 py-1">
                ${childPrice.toFixed(2)}
              </TableCell>
              <TableCell className="text-center text-xs text-blue-600 border-0 py-1">
                {childQuantity}
              </TableCell>
              <TableCell className="text-right text-xs text-blue-600 border-0 py-1">
                ${childTotal.toFixed(2)}
              </TableCell>
              <TableCell className="border-0 py-1"></TableCell>
            </TableRow>

            {/* Child item configurations */}
            {childItem.order_line_item_configurations?.map((config: any, configIndex: number) => {
              const priceAdjustment = parseFloat(config.price_adjustment) || 0;
              const basePrice = parseFloat(config.product_configuration_attribute_values.base_price) || 0;
              
              return (
                <TableRow key={`${item.id}-child-${childIndex}-config-${configIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
                  <TableCell className="text-xs text-gray-600 pl-12 border-0 py-1">
                    {config.product_configuration_attributes.display_name}: {config.product_configuration_attribute_values.display_value} ({basePrice > 0 ? `$${basePrice.toFixed(2)}` : '$0.00'})
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${priceAdjustment.toFixed(2)}
                  </TableCell>
                  <TableCell className="border-0 py-1"></TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${priceAdjustment.toFixed(2)}
                  </TableCell>
                  <TableCell className="border-0 py-1"></TableCell>
                </TableRow>
              );
            })}

            {/* Child item modifiers */}
            {childItem.order_modifiers?.map((modifier: any, modIndex: number) => {
              const modifierPrice = parseFloat(modifier.price) || 0;
              const modifierQuantity = modifier.quantity || 1;
              const modifierTotal = modifierPrice * modifierQuantity;
              
              return (
                <TableRow key={`${item.id}-child-${childIndex}-mod-${modIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
                  <TableCell className="text-xs text-gray-600 pl-12 border-0 py-1">
                    {modifier.restaurant_product_modifiers?.modifiers?.modifier || 'Unknown Modifier'} (${modifierPrice.toFixed(2)} x {modifierQuantity})
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${modifierPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-600 border-0 py-1">
                    {modifierQuantity}
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${modifierTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="border-0 py-1"></TableCell>
                </TableRow>
              );
            })}

            {/* Child item half and half portions */}
            {childItem.is_half_and_half === 1 && childItem.order_line_item_portions?.map((portion: any, portionIndex: number) => {
              const portionName = portion.restaurant_products?.products?.name || 'Unknown Portion';
              
              return (
                <React.Fragment key={`${item.id}-child-${childIndex}-portion-${portionIndex}`}>
                  {/* Portion header */}
                  <TableRow className="bg-blue-50 border-0 h-7 text-xs">
                    <TableCell className="text-xs text-blue-700 pl-16 border-0 py-1 font-medium">
                      {portionName}(?)
                    </TableCell>
                    <TableCell className="border-0 py-1"></TableCell>
                    <TableCell className="border-0 py-1"></TableCell>
                    <TableCell className="border-0 py-1"></TableCell>
                    <TableCell className="border-0 py-1"></TableCell>
                  </TableRow>
                  
                  {/* Portion modifiers */}
                  {portion.order_line_item_portion_modifiers?.map((portionMod: any, portionModIndex: number) => {
                    const portionModPrice = parseFloat(portionMod.price) || 0;
                    const portionModQuantity = portionMod.quantity || 1;
                    const portionModTotal = portionModPrice * portionModQuantity;
                    
                    return (
                      <TableRow key={`${item.id}-child-${childIndex}-portion-${portionIndex}-mod-${portionModIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
                        <TableCell className="text-xs text-gray-600 pl-20 border-0 py-1">
                          {portionMod.modifier_name} (${portionModPrice.toFixed(2)} x {portionModQuantity})
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                          ${portionModPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center text-xs text-gray-600 border-0 py-1">
                          {portionModQuantity}
                        </TableCell>
                        <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                          ${portionModTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="border-0 py-1"></TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}

      {/* Regular product configurations (for non-combo items) */}
      {!isCombo && item.order_line_item_configurations?.map((config, configIndex) => {
        const priceAdjustment = parseFloat(config.price_adjustment) || 0;
        const basePrice = parseFloat(config.product_configuration_attribute_values.base_price) || 0;
        
        return (
          <TableRow key={`${item.id}-config-${configIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
            <TableCell className="text-xs text-gray-600 pl-8 border-0 py-1">
              {config.product_configuration_attributes.display_name}: {config.product_configuration_attribute_values.display_value} ({basePrice > 0 ? `$${basePrice.toFixed(2)}` : '$0.00'})
            </TableCell>
            <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
              ${priceAdjustment.toFixed(2)}
            </TableCell>
            <TableCell className="border-0 py-1"></TableCell>
            <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
              ${priceAdjustment.toFixed(2)}
            </TableCell>
            <TableCell className="border-0 py-1"></TableCell>
          </TableRow>
        );
      })}

      {/* Regular product modifiers (for non-combo items) */}
      {!isCombo && item.order_modifiers?.map((modifier, modIndex) => {
        const modifierPrice = parseFloat(modifier.price) || 0;
        const modifierQuantity = modifier.quantity || 1;
        const modifierTotal = modifierPrice * modifierQuantity;
        
        return (
          <TableRow key={`${item.id}-mod-${modIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
            <TableCell className="text-xs text-gray-600 pl-8 border-0 py-1">
              {modifier.restaurant_product_modifiers?.modifiers?.modifier || 'Unknown Modifier'} (${modifierPrice.toFixed(2)} x {modifierQuantity})
            </TableCell>
            <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
              ${modifierPrice.toFixed(2)}
            </TableCell>
            <TableCell className="text-center text-xs text-gray-600 border-0 py-1">
              {modifierQuantity}
            </TableCell>
            <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
              ${modifierTotal.toFixed(2)}
            </TableCell>
            <TableCell className="border-0 py-1"></TableCell>
          </TableRow>
        );
      })}

      {/* Regular product half and half portions (for non-combo items) */}
      {!isCombo && item.is_half_and_half === 1 && item.order_line_item_portions?.map((portion, portionIndex) => {
        const portionName = portion.restaurant_products?.products?.name || 'Unknown Portion';
        const portionType = portion.portion_type;
        
        return (
          <React.Fragment key={`${item.id}-portion-${portionIndex}`}>
            {/* Portion header */}
            <TableRow className="bg-blue-50 border-0 h-7 text-xs">
              <TableCell className="text-xs text-blue-700 pl-8 border-0 py-1 font-medium">
                {portionName}(?)
              </TableCell>
              <TableCell className="border-0 py-1"></TableCell>
              <TableCell className="border-0 py-1"></TableCell>
              <TableCell className="border-0 py-1"></TableCell>
              <TableCell className="border-0 py-1"></TableCell>
            </TableRow>
            
            {/* Portion modifiers */}
            {portion.order_line_item_portion_modifiers?.map((portionMod, portionModIndex) => {
              const portionModPrice = parseFloat(portionMod.price) || 0;
              const portionModQuantity = portionMod.quantity || 1;
              const portionModTotal = portionModPrice * portionModQuantity;
              
              return (
                <TableRow key={`${item.id}-portion-${portionIndex}-mod-${portionModIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
                  <TableCell className="text-xs text-gray-600 pl-12 border-0 py-1">
                    {portionMod.modifier_name} (${portionModPrice.toFixed(2)} x {portionModQuantity})
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${portionModPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center text-xs text-gray-600 border-0 py-1">
                    {portionModQuantity}
                  </TableCell>
                  <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
                    ${portionModTotal.toFixed(2)}
                  </TableCell>
                  <TableCell className="border-0 py-1"></TableCell>
                </TableRow>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

// Component to render legacy order item
const LegacyOrderItemRow: React.FC<{ item: OrderItem; index: number }> = ({ item, index }) => {
  return (
    <>
      <TableRow className="border-b border-gray-200 h-8 text-xs">
        <TableCell className="font-medium text-gray-800 px-2 py-1 text-xs">
          {item.name || 'Unknown Item'}
        </TableCell>
        <TableCell className="text-right text-gray-600 px-2 py-1 text-xs">
          ${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}
        </TableCell>
        <TableCell className="text-center text-gray-600 px-2 py-1 text-xs">
          {item.quantity || 1}
        </TableCell>
        <TableCell className="text-right font-medium text-gray-800 px-2 py-1 text-xs">
          ${typeof item.totalPrice === 'number' ? item.totalPrice.toFixed(2) : '0.00'}
        </TableCell>
        <TableCell className="text-right text-gray-600 italic px-2 py-1 text-xs">
          {item.note || ''}
        </TableCell>
      </TableRow>
      {item.modifiers?.map((modifier, mIndex) => (
        <TableRow key={`${item.id}-m-${mIndex}`} className="bg-gray-50 border-0 h-7 text-xs">
          <TableCell className="text-xs text-gray-600 pl-8 border-0 py-1">
            - {modifier.name || 'Unknown Modifier'}
          </TableCell>
          <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
            ${typeof modifier.price === 'number' ? modifier.price.toFixed(2) : '0.00'}
          </TableCell>
          <TableCell className="border-0 py-1"></TableCell>
          <TableCell className="text-right text-xs text-gray-600 border-0 py-1">
            ${typeof modifier.price === 'number' ? modifier.price.toFixed(2) : '0.00'}
          </TableCell>
          <TableCell className="border-0 py-1"></TableCell>
        </TableRow>
      ))}
    </>
  );
};

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({ items, amount, note }) => {
  // Safely handle potentially undefined items
  const safeItems = items || [];
  const hasItems = safeItems.length > 0;
  const safeAmount = typeof amount === 'number' ? amount : 0;

  return (
    <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="h-8">
              <TableHead className="text-gray-700 px-2 py-1 text-xs">Item</TableHead>
              <TableHead className="text-gray-700 text-right px-2 py-1 text-xs">Price</TableHead>
              <TableHead className="text-gray-700 text-center px-2 py-1 text-xs">Qty</TableHead>
              <TableHead className="text-gray-700 text-right px-2 py-1 text-xs">Total</TableHead>
              <TableHead className="text-gray-700 text-right px-2 py-1 text-xs">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasItems ? (
              <TableRow className="h-8">
                <TableCell colSpan={5} className="text-center text-gray-500 px-2 py-1 text-xs">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              safeItems.map((item, index) => {
                // Check if this is the new API format
                if (isOrderLineItem(item)) {
                  return <OrderLineItemRow key={item.id} item={item} index={index} />;
                } else {
                  // Legacy format
                  return <LegacyOrderItemRow key={item.id || index} item={item as OrderItem} index={index} />;
                }
              })
            )}
          </TableBody>
        </Table>
      </div>
      {note && (
        <div className="p-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Note</p>
          <p className="bg-gray-50 p-2 rounded text-gray-700 border border-gray-200 text-xs">{note}</p>
        </div>
      )}
    </div>
  );
};
