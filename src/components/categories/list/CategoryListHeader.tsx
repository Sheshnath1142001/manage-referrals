import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const CategoryListHeader = () => {
  return (
    <TableHeader className="overflow-hidden rounded-t-lg">
      <TableRow className="bg-primary hover:bg-primary">
        <TableHead className="text-primary-foreground w-16 pr-4 first:rounded-tl-lg">Id</TableHead>
        <TableHead className="text-primary-foreground w-12 px-4"></TableHead>
        <TableHead className="text-primary-foreground px-4">Category</TableHead>
        <TableHead className="text-primary-foreground px-4">Status</TableHead>
        <TableHead className="text-primary-foreground w-24 px-4">Seq No</TableHead>
        <TableHead className="text-primary-foreground w-32 pl-4 last:rounded-tr-lg">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
