import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

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
  items?: OrderItem[];
  amount: number | undefined;
  note?: string;
}

// Use a custom wrapper component instead of React.Fragment to handle any extra props safely
const ItemRowGroup = ({ children, ...props }: React.PropsWithChildren<any>) => {
  // We use a div with display: contents to avoid affecting the table layout
  // but still allow accepting arbitrary props
  return <div style={{ display: 'contents' }}>{children}</div>;
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
              safeItems.map((item, index) => (
                <ItemRowGroup key={item.id || index}>
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
                </ItemRowGroup>
              ))
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
