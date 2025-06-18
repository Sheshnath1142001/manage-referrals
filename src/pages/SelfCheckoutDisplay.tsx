import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddFilesDialog } from "@/components/self-checkout/AddFilesDialog";

const SelfCheckoutDisplay: React.FC = () => {
  const { toast } = useToast();
  const [addFilesOpen, setAddFilesOpen] = useState(false);

  const handleRefresh = () => {
    toast({
      title: "Refreshing",
      description: "Updating media files list...",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Self-Checkout Display</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                onClick={() => setAddFilesOpen(true)}
                className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Files
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-lg text-gray-500 mb-4">No media files are available!</p>
            <Button 
              onClick={() => setAddFilesOpen(true)}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First File
            </Button>
          </div>
        </CardContent>
      </Card>

      <AddFilesDialog 
        open={addFilesOpen} 
        onOpenChange={setAddFilesOpen} 
      />
    </div>
  );
};

export default SelfCheckoutDisplay;
