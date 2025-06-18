import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnlinePromotionImageUpload } from "./OnlinePromotionImageUpload";
import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/services/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  status: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface OnlinePromotion {
  id: number;
  name: string;
  description: string;
  type: string;
  category?: string;
  image?: string;
  images?: { id: string | number; upload_path: string }[];
  status: number;
}

interface OnlinePromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  promotion?: OnlinePromotion;
  isSubmitting?: boolean;
  isViewMode?: boolean;
}

export function OnlinePromotionDialog({
  isOpen,
  onClose,
  onSubmit,
  promotion,
  isSubmitting = false,
  isViewMode = false,
}: OnlinePromotionDialogProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch categories (per_page large to get all)
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["itemCategories"],
    queryFn: () => categoriesApi.getCategories({ per_page: 999999, status: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  // Extract list (handle both wrapped and direct)
  const categories = (categoriesData?.categories || categoriesData?.data) ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      image: "",
      status: true,
    },
  });

  useEffect(() => {
    if (promotion) {
      form.reset({
        name: promotion.name,
        description: promotion.description,
        category: promotion.category || "",
        image: promotion.image || "",
        status: promotion.status === 1,
      });
      setImageUrl(promotion.image || "");
    } else {
      form.reset({
        name: "",
        description: "",
        category: "",
        image: "",
        status: true,
      });
      setImageUrl("");
    }
  }, [promotion, form]);

  const handleSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description,
      category: values.category,
      image: imageUrl,
      status: values.status ? 1 : 0,
      imageFile: selectedFile,
    };
    onSubmit(payload);
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
    form.setValue("image", url);
  };

  const handleImageDeleted = () => {
    setImageUrl("");
    form.setValue("image", "");
    setSelectedFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isViewMode 
              ? "View Online Promotion" 
              : promotion 
                ? "Edit Online Promotion" 
                : "Add Online Promotion"
            }
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter promotion name" 
                        {...field} 
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isViewMode}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingCategories ? (
                          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
                        ) : categories.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">No categories found</div>
                        ) : (
                          categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.category}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description:</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter promotion description" 
                        {...field} 
                        disabled={isViewMode}
                        rows={6}
                        className="resize-none"
                      />
                    </FormControl>
                    <div className="text-xs text-gray-500 text-right">
                      {field.value?.length || 0} / 200
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image:</FormLabel>
                    <FormControl>
                      <OnlinePromotionImageUpload
                        promotionId={promotion?.id}
                        moduleId={promotion?.id}
                        attachmentId={promotion?.images?.[0]?.id}
                        initialImageUrl={imageUrl}
                        onImageUploaded={handleImageUploaded}
                        onImageDeleted={handleImageDeleted}
                        onFileSelected={setSelectedFile}
                        disabled={isViewMode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                      disabled={isViewMode}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              {!isViewMode ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                  >
                    RESET
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "SUBMIT"}
                  </Button>
                </>
              ) : (
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
