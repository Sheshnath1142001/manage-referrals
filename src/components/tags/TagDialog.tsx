import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tagsService } from "@/services/api/items/tags";
import { useToast } from "@/components/ui/use-toast";
import type { Tag } from "@/hooks/useTags";

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: Tag;
  onSuccess?: () => void;
}

export function TagDialog({ isOpen, onClose, mode, initialData, onSuccess }: TagDialogProps) {
  const [tag, setTag] = React.useState(initialData?.tag || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setTag(initialData?.tag || "");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "add") {
        await tagsService.createTag({ tag });
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
      } else if (mode === "edit" && initialData?.id) {
        await tagsService.updateTag(initialData.id, { tag });
        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to save tag. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTag("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add Tag" : "Edit Tag"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name*</Label>
              <Input
                id="tag-name"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Enter tag name"
                required
                maxLength={255}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={handleReset} disabled={isSubmitting}>
              RESET
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 