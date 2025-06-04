import { useState, useEffect } from "react";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { useCloudPrinters } from "@/hooks/useCloudPrinters";
import { CloudPrinter } from "@/services/api/cloudPrinters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TablePagination,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cloudPrintersApi } from "@/services/api/cloudPrinters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

// Order types mapping
const ORDER_TYPES = [
  { id: 1, label: "Dine-in" },
  { id: 2, label: "Pickup" },
  { id: 3, label: "Delivery" },
];

export default function CloudPrinting() {
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<CloudPrinter | null>(null);
  const { toast } = useToast();
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<number[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [printerName, setPrinterName] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { printers, isLoading, refreshPrinters } = useCloudPrinters({
    restaurantId: selectedRestaurantId || 0,
    activeOnly: statusFilter === "all" ? undefined : statusFilter === "active",
    page: currentPage,
    perPage: pageSize,
    printerName,
  });

  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(Number(restaurants[0].id));
    }
  }, [restaurants, selectedRestaurantId]);

  const handleAddPrinter = () => {
    setEditingPrinter(null);
    setSelectedOrderTypes([]);
    setIsActive(true);
    setIsDialogOpen(true);
  };

  const handleEditPrinter = (printer: CloudPrinter) => {
    setEditingPrinter(printer);
    setSelectedOrderTypes(
      Array.isArray(printer.order_types)
        ? printer.order_types.map(Number)
        : printer.order_types
        ? String(printer.order_types)
            .split(',')
            .map(Number)
        : []
    );
    setIsActive(printer.is_active);
    setIsDialogOpen(true);
  };

  const handleDeletePrinter = async (id: number) => {
    try {
      await cloudPrintersApi.deleteCloudPrinter(id);
      toast({
        title: "Success",
        description: "Cloud printer deleted successfully",
      });
      refreshPrinters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete cloud printer",
        variant: "destructive",
      });
    }
  };

  const handleSavePrinter = async (formData: any) => {
    try {
      const payload = {
        name: formData.name,
        sn: formData.sn,
        voice_type: Number(formData.voice_type),
        should_print_order: formData.should_print_order === "on" || formData.should_print_order === true,
        should_announce: formData.should_announce === "on" || formData.should_announce === true,
        order_types: selectedOrderTypes,
        is_active: isActive,
        restaurant_id: selectedRestaurantId,
        location_restaurant_id: Number(formData.location_restaurant_id),
      };
      if (editingPrinter) {
        await cloudPrintersApi.updateCloudPrinter(editingPrinter.id, payload);
        toast({
          title: "Success",
          description: "Cloud printer updated successfully",
        });
      } else {
        await cloudPrintersApi.createCloudPrinter(payload);
        toast({
          title: "Success",
          description: "Cloud printer created successfully",
        });
      }
      setIsDialogOpen(false);
      refreshPrinters();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save cloud printer",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Cloud Printing</h1>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Select
              value={selectedRestaurantId?.toString()}
              onValueChange={(value) => setSelectedRestaurantId(Number(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select restaurant" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Search by printer name"
              value={printerName}
              onChange={e => setPrinterName(e.target.value)}
              className="w-[220px]"
            />
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refreshPrinters}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleAddPrinter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Printer
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Serial Number</TableHead>
                <TableHead className="text-white">Location</TableHead>
                <TableHead className="text-white">Voice Type</TableHead>
                <TableHead className="text-white">Print Orders</TableHead>
                <TableHead className="text-white">Announce</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <span className="text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : printers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <span className="text-muted-foreground">No cloud printers found</span>
                  </TableCell>
                </TableRow>
              ) : (
                printers.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell>{printer.name}</TableCell>
                    <TableCell>{printer.sn}</TableCell>
                    <TableCell>
                      {printer.restaurants_cloud_printers_location_restaurant_idTorestaurants?.name}
                    </TableCell>
                    <TableCell>{printer.voice_type}</TableCell>
                    <TableCell>{printer.should_print_order ? "Yes" : "No"}</TableCell>
                    <TableCell>{printer.should_announce ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        printer.is_active 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {printer.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditPrinter(printer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePrinter(printer.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
          totalItems={printers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {editingPrinter ? "Edit Cloud Printer" : "Add Cloud Printer"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = Object.fromEntries(new FormData(e.currentTarget));
              handleSavePrinter(formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingPrinter?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sn">Serial Number</Label>
              <Input
                id="sn"
                name="sn"
                defaultValue={editingPrinter?.sn}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voice_type">Voice Type</Label>
              <Select
                name="voice_type"
                defaultValue={editingPrinter?.voice_type.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Type 1</SelectItem>
                  <SelectItem value="2">Type 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_restaurant_id">Location</Label>
              <Select
                name="location_restaurant_id"
                defaultValue={editingPrinter?.location_restaurant_id.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order Types*</Label>
              <div className="flex flex-col gap-2 border rounded p-2">
                {ORDER_TYPES.map((type) => (
                  <label key={type.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedOrderTypes.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setSelectedOrderTypes((prev) =>
                          checked
                            ? [...prev, type.id]
                            : prev.filter((id) => id !== type.id)
                        );
                      }}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                name="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingPrinter ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
