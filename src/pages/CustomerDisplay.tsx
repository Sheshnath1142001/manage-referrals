
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CustomerDisplayFileDialog } from "@/components/customer-display/CustomerDisplayFileDialog";

interface FileEntry {
  id: string;
  file?: File;
  fileName: string;
  aspectRatio: string;
  group: string;
  previewUrl?: string;
}

const CustomerDisplay = () => {
  const { toast } = useToast();
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedGroup, setSelectedGroup] = useState("Default");
  const [imageUrl, setImageUrl] = useState("/placeholder.svg");
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for customer groups
  const customerGroups = ["Default", "VIP", "Regular", "New Customers"];
  
  // Mock data for aspect ratios
  const aspectRatios = ["16:9", "4:3", "1:1", "21:9"];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a URL for the file to preview it
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      toast({
        title: "Image uploaded",
        description: "Your display image has been updated"
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Customer display settings have been updated"
    });
  };

  const handleDelete = () => {
    setImageUrl("/placeholder.svg");
    toast({
      title: "Image removed",
      description: "Display image has been removed",
      variant: "destructive"
    });
  };

  const handleFileSubmit = (files: FileEntry[]) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update the current display with the first file
      if (files.length > 0 && files[0].previewUrl) {
        setImageUrl(files[0].previewUrl);
        setAspectRatio(files[0].aspectRatio);
        setSelectedGroup(files[0].group);
      }
      
      setIsSubmitting(false);
      setIsFileDialogOpen(false);
      
      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${files.length} file(s)`
      });
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Customer Display Settings</h1>
        <Button 
          variant="default" 
          onClick={() => setIsFileDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Files
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Customer Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatios.map((ratio) => (
                      <SelectItem key={ratio} value={ratio}>
                        {ratio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="group">Customer Group</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer group" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Display Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button onClick={handleSave} className="w-full bg-[#1A1F2C]">
                Save Settings
              </Button>
            </div>
            
            {isPreviewVisible && (
              <div className="border rounded-md p-4 space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Preview</h3>
                  <Button variant="ghost" size="icon" onClick={handleDelete}>
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
                <div className="relative">
                  <div className="overflow-hidden border rounded-md">
                    <img
                      src={imageUrl}
                      alt="Customer Display Preview"
                      className="w-full h-auto object-cover"
                      style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                    />
                  </div>
                  <div className="mt-3 text-sm text-gray-500 space-y-1">
                    <p><span className="font-medium">Aspect Ratio:</span> {aspectRatio}</p>
                    <p><span className="font-medium">Groups:</span> {selectedGroup}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <CustomerDisplayFileDialog 
        isOpen={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onSubmit={handleFileSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CustomerDisplay;
