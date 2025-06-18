import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCustomerDisplayOptions } from "@/hooks/useCustomerDisplayOptions";

const fileSchema = z.object({
  file: z.any().optional(),
  fileName: z.string().min(1, "File name is required"),
  aspectRatio: z.number().min(1, "Aspect ratio is required"),
  group: z.number().min(1, "Group is required"),
});

type FileFormValues = z.infer<typeof fileSchema>;

interface FileEntry extends FileFormValues {
  id: string;
  previewUrl?: string;
}

interface CustomerDisplayFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: FileEntry[]) => void;
  isSubmitting?: boolean;
}

export function CustomerDisplayFileDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CustomerDisplayFileDialogProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const { toast } = useToast();
  
  // Fetch dynamic data for aspect ratios and customer groups
  const { aspectRatios, groupTypes, isLoading: optionsLoading, error: optionsError } = useCustomerDisplayOptions();

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      fileName: "",
      aspectRatio: 0,
      group: 0,
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setFiles([]);
    }
  }, [isOpen, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the file to preview it
      const url = URL.createObjectURL(file);
      form.setValue("file", file);
      form.setValue("fileName", file.name);
    }
  };

  const handleAddFile = () => {
    form.handleSubmit((values) => {
      const newFile: FileEntry = {
        ...values,
        id: Date.now().toString(),
        previewUrl: values.file ? URL.createObjectURL(values.file) : undefined,
      };
      
      setFiles([...files, newFile]);
      
      form.reset();
    })();
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      toast({
        title: "No files to submit",
        description: "Please add at least one file before submitting",
        variant: "destructive"
      });
      return;
    }
    onSubmit(files);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isSubmitting ? undefined : onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Add Files
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mb-4">
          You can upload only 30 images and 5 videos in total!
        </div>

        {optionsError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">
              Failed to load form options. Please refresh the page and try again.
            </p>
          </div>
        )}

        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>File*</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          id="file"
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          className="w-full"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter file name" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio*</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                      disabled={optionsLoading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={optionsLoading ? "Loading..." : "Select aspect ratio"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio.id} value={ratio.id.toString()}>
                            {ratio.aspect_ratio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group*</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                      disabled={optionsLoading || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={optionsLoading ? "Loading..." : "Select customer group"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groupTypes.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="default" 
                onClick={handleAddFile}
                disabled={isSubmitting}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Add File
              </Button>
            </div>
          </form>
        </Form>

        {files.length > 0 && (
          <div className="mt-6 border rounded-md p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-medium mb-3">Files to Upload ({files.length})</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded-md gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {file.previewUrl && (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 relative overflow-hidden rounded flex-shrink-0">
                        <img src={file.previewUrl} alt={file.fileName} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate" title={file.fileName}>{file.fileName}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {aspectRatios.find(ar => ar.id === file.aspectRatio)?.aspect_ratio || file.aspectRatio} · {groupTypes.find(gt => gt.id === file.group)?.type || file.group}
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={isSubmitting}
                    className="flex-shrink-0 h-8 w-8"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isSubmitting || files.length === 0} 
            onClick={handleSubmit}
            className="relative w-full sm:w-auto order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span className="hidden sm:inline">Uploading...</span>
                  <span className="sm:hidden">Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...</span>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Upload {files.length} {files.length === 1 ? 'File' : 'Files'}</span>
                <span className="sm:hidden">Upload {files.length}</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="bg-white p-8 rounded-lg shadow-lg flex items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
