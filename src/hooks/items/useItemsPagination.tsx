
import { useState } from "react";
import { Item } from "@/components/items/types";

export function useItemsPagination(filteredItems: Item[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate totalPages
  const totalItems = filteredItems.length;
  const totalPages = pageSize === -1 ? 1 : Math.ceil(totalItems / pageSize);

  // Get paginated items based on current page and page size
  const paginatedItems = pageSize === -1 
    ? filteredItems 
    : filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    const newPageSize = size === 0 ? -1 : size;
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange
  };
}
