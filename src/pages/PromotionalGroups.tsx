import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { promotionalGroupsApi, PromotionalGroup } from "@/services/api/promotionalGroups";

// Schema for promotional group form
const formSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

type FormValues = z.infer<typeof formSchema>;

const PromotionalGroups = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<PromotionalGroup[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<PromotionalGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete confirmation dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<PromotionalGroup | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    }
  });

  // Fetch promotional groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const data = await promotionalGroupsApi.getPromotionalGroups();
      console.log('shesh',data)
      setGroups(data);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to fetch promotional groups",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    form.reset({ name: "" });
    setCurrentGroup(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (group: PromotionalGroup) => {
    form.reset({
      name: group.type, // Changed from group.name to group.type
    });
    setCurrentGroup(group);
    setIsDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (group: PromotionalGroup) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      setIsDeleting(true);
      await promotionalGroupsApi.deletePromotionalGroup(groupToDelete.id);
      setGroups(groups.filter(group => group.id !== groupToDelete.id));
      toast({
        title: "Group deleted",
        description: "The promotional group has been deleted successfully"
      });
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to delete promotional group",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (currentGroup) {
        // Update existing group
        const updatedGroup = await promotionalGroupsApi.updatePromotionalGroup(currentGroup.id, { name: values.name });
        await fetchGroups(); // Fetch updated data
        toast({
          title: "Group updated",
          description: "The promotional group has been updated successfully"
        });
      } else {
        // Create new group
        const newGroup = await promotionalGroupsApi.createPromotionalGroup({ name: values.name });
        await fetchGroups(); // Fetch updated data
        toast({
          title: "Group created",
          description: "New promotional group has been created successfully"
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      
      toast({
        title: "Error",
        description: currentGroup ? "Failed to update promotional group" : "Failed to create promotional group",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          onClick={openCreateDialog}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.id}</TableCell>
                  <TableCell>{group.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(group)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No promotional groups found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {groups.length > 0 && (
          <div className="flex items-center justify-end p-4 border-t">
            <div className="text-sm text-gray-500">
              1-{groups.length} of {groups.length}
            </div>
          </div>
        )}
      </div>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentGroup ? "Edit Promotional Group" : "Add Promotional Group"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : currentGroup ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete GroupTypes <strong>"{groupToDelete?.type}"</strong>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromotionalGroups;
