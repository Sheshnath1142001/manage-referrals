import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RotateCcw, Edit, Trash2 } from "lucide-react";
import { TagDialog } from "@/components/tags/TagDialog";
import { useTags } from "@/hooks/useTags";
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

export default function Tags() {
  const {
    tags,
    search,
    setSearch,
    currentPage,
    pageSize,
    total,
    isLoading,
    handlePageChange,
    handlePageSizeChange,
    fetchTags,
    deleteTag
  } = useTags();

  // Dialog controls
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [selectedTag, setSelectedTag] = React.useState<any | undefined>();

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [tagToDelete, setTagToDelete] = React.useState<string | null>(null);

  // Filter logic
  const filtered = tags.filter(tag =>
    tag.tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClick = () => {
    setDialogMode("add");
    setSelectedTag(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (tag: any) => {
    setDialogMode("edit");
    setSelectedTag(tag);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTagToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tagToDelete) {
      await deleteTag(tagToDelete);
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Tags</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] max-w-[300px]">
            <Input
              placeholder="Search Tags"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="icon" onClick={fetchTags}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0F172A] hover:bg-[#0F172A]/90">
                <TableHead className="text-white">Id</TableHead>
                <TableHead className="text-white">Tag</TableHead>
                <TableHead className="text-white">Created At</TableHead>
                <TableHead className="text-white">Updated At</TableHead>
                <TableHead className="text-white text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">Loading...</span>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <span className="text-muted-foreground">No tags found</span>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(tag => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.id}</TableCell>
                    <TableCell>{tag.tag}</TableCell>
                    <TableCell>{new Date(tag.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(tag.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(tag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(tag.id)}>
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
          totalItems={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      <TagDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        initialData={selectedTag}
        onSuccess={fetchTags}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tag.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
