import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableType } from "@/services/api/tableTypes";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  status: z.boolean().default(true),
  restaurant_ids: z.array(z.number()).min(1, "At least one restaurant must be selected"),
});

type FormValues = z.infer<typeof formSchema>;

interface TableTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  tableType?: TableType;
  isSubmitting?: boolean;
  availableRestaurants?: { id: number | string; name: string }[];
  showLocationSelect?: boolean;
}

export function TableTypeDialog({
  isOpen,
  onClose,
  onSubmit,
  tableType,
  isSubmitting = false,
  availableRestaurants = [],
  showLocationSelect = false,
}: TableTypeDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      status: true,
      restaurant_ids: [],
    },
  });

  useEffect(() => {
    if (tableType) {
      form.reset({
        type: tableType.type,
        status: tableType.status === 1,
        restaurant_ids: tableType.restaurant_id ? [tableType.restaurant_id] : [],
      });
    } else {
      form.reset({
        type: "",
        status: true,
        restaurant_ids: [],
      });
    }
  }, [tableType, form]);

  const handleSubmit = (values: FormValues) => {
    const payload = {
      table_type: values.type,
      status: values.status ? 1 : 0,
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tableType ? "Edit Table Type" : "Add Table Type"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter table type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restaurant_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurants</FormLabel>
                  <FormControl>
                    <select
  className="h-9 bg-white border border-gray-300 w-full rounded px-2"
  value={field.value[0] || ""}
  disabled={!!tableType}  // Disable in edit mode
  onChange={(e) => {
    const value = e.target.value ? [parseInt(e.target.value)] : [];
    field.onChange(value);
  }}
>
  <option value="">Select Restaurant</option>
  {availableRestaurants.map((restaurant) => (
    <option key={restaurant.id} value={restaurant.id}>
      {restaurant.name}
    </option>
  ))}
</select>

                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
