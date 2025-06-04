
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

const fileSchema = z.object({
  file: z.any().optional(),
  fileName: z.string().min(1, "File name is required"),
  aspectRatio: z.string().min(1, "Aspect ratio is required"),
  group: z.string().min(1, "Group is required"),
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
  
  // Mock data for aspect ratios and customer groups
  const aspectRatios = ["16:9", "4:3", "1:1", "21:9"];
  const customerGroups = ["Default", "VIP", "Regular", "New Customers"];

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileSchema),
    defaultValues: {
      fileName: "",
      aspectRatio: "",
      group: "",
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
      
      toast({
        title: "File added",
        description: "File has been added to the list"
      });
      
      form.reset();
    })();
  };

  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
    toast({
      title: "File removed",
      description: "File has been removed from the list",
      variant: "destructive"
    });
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add Files
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mb-4">
          You can upload only 30 images and 5 videos in total!
        </div>

        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input placeholder="Enter file name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect Ratio*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select aspect ratio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aspectRatios.map((ratio) => (
                          <SelectItem key={ratio} value={ratio}>
                            {ratio}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customerGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
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
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add File
              </Button>
            </div>
          </form>
        </Form>

        {files.length > 0 && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Files to Upload</h3>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    {file.previewUrl && (
                      <div className="h-10 w-10 relative overflow-hidden rounded">
                        <img src={file.previewUrl} alt={file.fileName} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {file.aspectRatio} · {file.group}
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            disabled={isSubmitting || files.length === 0} 
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
