
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileEntry {
  id: string;
  file: File | null;
  fileName: string;
  group: string;
}

interface AddFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddFilesDialog = ({ open, onOpenChange }: AddFilesDialogProps) => {
  const { toast } = useToast();
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([
    { id: '1', file: null, fileName: '', group: '' }
  ]);

  const handleFileSelect = (id: string, file: File | null) => {
    setFileEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, file } : entry
    ));
  };

  const handleFileNameChange = (id: string, fileName: string) => {
    setFileEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, fileName } : entry
    ));
  };

  const handleGroupChange = (id: string, group: string) => {
    setFileEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, group } : entry
    ));
  };

  const addMoreFiles = () => {
    const newId = (fileEntries.length + 1).toString();
    setFileEntries(prev => [...prev, { id: newId, file: null, fileName: '', group: '' }]);
  };

  const removeFileEntry = (id: string) => {
    if (fileEntries.length > 1) {
      setFileEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = () => {
    const validEntries = fileEntries.filter(entry => entry.file && entry.fileName && entry.group);
    
    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete file entry",
        variant: "destructive",
      });
      return;
    }

    // Simulate file upload
    toast({
      title: "Success",
      description: `${validEntries.length} file(s) uploaded successfully`,
    });
    
    onOpenChange(false);
    setFileEntries([{ id: '1', file: null, fileName: '', group: '' }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black">Add Files</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You can upload only 30 images and 5 videos in total!
          </p>

          <div className="space-y-4">
            {fileEntries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-2 gap-6 p-4 border rounded-lg">
                {/* Left Column - File Name and Group */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`filename-${entry.id}`}>
                      File Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`filename-${entry.id}`}
                      value={entry.fileName}
                      onChange={(e) => handleFileNameChange(entry.id, e.target.value)}
                      placeholder="Enter file name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`group-${entry.id}`}>
                      Group<span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select value={entry.group} onValueChange={(value) => handleGroupChange(entry.id, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="promotional">Promotional</SelectItem>
                          <SelectItem value="menu">Menu</SelectItem>
                          <SelectItem value="branding">Branding</SelectItem>
                          <SelectItem value="instructional">Instructional</SelectItem>
                        </SelectContent>
                      </Select>
                      {fileEntries.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeFileEntry(entry.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - File Upload */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`file-${entry.id}`}>
                      File<span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id={`file-${entry.id}`}
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => handleFileSelect(entry.id, e.target.files?.[0] || null)}
                      />
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-black transition-colors"
                        onClick={() => document.getElementById(`file-${entry.id}`)?.click()}
                      >
                        <Paperclip className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {entry.file ? entry.file.name : 'Click to select file'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={addMoreFiles}
              className="bg-black text-white hover:bg-gray-800 border-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              ADD MORE FILES
            </Button>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSubmit}
              className="bg-black text-white hover:bg-gray-800 px-8"
            >
              SUBMIT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
