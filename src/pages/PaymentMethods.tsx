import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus, RotateCcw } from "lucide-react";
import { PaymentMethodDialog } from "@/components/payment-methods/PaymentMethodDialog";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";

export default function PaymentMethods() {
  const {
    paymentMethods,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchPaymentMethods
  } = usePaymentMethods();

  // Dialog controls
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedMethod, setSelectedMethod] = React.useState<any | undefined>();

  const handleAddClick = () => {
    setDialogMode("add");
    setSelectedMethod(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (method: any) => {
    setDialogMode("edit");
    setSelectedMethod(method);
    setDialogOpen(true);
  };

  const isEditDisabled = (method: string) => {
    const disabledMethods = ["Cash", "Card", "Shadow Card", "Gift Card", "Online Card"];
    return disabledMethods.includes(method);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Payment Methods</h1>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchPaymentMethods}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Method
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                <TableHead className="text-white">Id</TableHead>
                <TableHead className="text-white">Method</TableHead>
                <TableHead className="text-white">Description</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : paymentMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">No payment methods found</span>
                  </TableCell>
                </TableRow>
              ) : (
                paymentMethods.map(method => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.id}</TableCell>
                    <TableCell>{method.method}</TableCell>
                    <TableCell>{method.description || '-'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        method.status === 1 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {method.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClick(method)}
                          disabled={isEditDisabled(method.method)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <TablePagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <PaymentMethodDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        initialData={selectedMethod}
        onSuccess={fetchPaymentMethods}
      />
    </div>
  );
}
