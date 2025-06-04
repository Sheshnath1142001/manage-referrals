import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const CategoryPagination = ({ 
  currentPage, 
  pageSize, 
  totalItems, 
  onPageChange, 
  onPageSizeChange 
}: CategoryPaginationProps) => {
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(currentPage - Math.floor((maxPagesToShow - 2) / 2), 2);
      let endPage = startPage + maxPagesToShow - 3;

      if (endPage >= totalPages) {
        endPage = totalPages - 1;
        startPage = Math.max(endPage - (maxPagesToShow - 3), 2);
      }

      if (startPage > 2) {
        pages.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Records per page:</span>
          <Select 
            value={pageSize === -1 ? "all" : pageSize.toString()} 
            onValueChange={(value) => {
              if (value === "all") {
                onPageSizeChange(0); // This will be converted to -1 in the hook
              } else {
                onPageSizeChange(Number(value));
              }
            }}
          >
            <SelectTrigger className="h-9 bg-white border border-gray-300 w-[80px]">
              <SelectValue placeholder={pageSize === -1 ? "All" : pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {totalItems === 0 ? (
              "No items"
            ) : pageSize === -1 ? (
              `Showing all ${totalItems} items`
            ) : (
              `${Math.min((currentPage - 1) * pageSize + 1, totalItems)}-${Math.min(currentPage * pageSize, totalItems)} of ${totalItems}`
            )}
          </span>
          
          {pageSize !== -1 && (
            <div className="flex flex-wrap gap-1 items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border border-gray-300"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {pageNumbers.map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <div key={`ellipsis-${index}`} className="flex items-center justify-center h-9 w-9">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </div>
                  );
                }
                
                return (
                  <Button
                    key={`page-${page}`}
                    variant="outline"
                    className={`h-9 w-9 border border-gray-300 ${currentPage === page ? "bg-gray-900 text-white" : ""}`}
                    onClick={() => onPageChange(page as number)}
                  >
                    {page}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border border-gray-300"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
