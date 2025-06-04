
import { useItemsData } from './useItemsData';
import { useItemsFiltering } from './useItemsFiltering';
import { useItemsCategories } from './useItemsCategories';
import { useItemsPagination } from './useItemsPagination';

// Export individual hooks
export {
  useItemsData,
  useItemsFiltering,
  useItemsCategories,
  useItemsPagination
};

// Create and export the combined useItems hook
export const useItems = () => {
  // Use the individual hooks to compose functionality
  const { 
    itemsList, 
    isLoading, 
    totalItems,
    fetchItems,
    fetchDiscountTypes,
    discountTypes,
    titleCase
  } = useItemsData();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredItems
  } = useItemsFiltering(itemsList);

  const {
    availableCategories,
    fetchCategories
  } = useItemsCategories();

  const {
    currentPage,
    pageSize,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange
  } = useItemsPagination(filteredItems);

  // Return combined data and functions
  return {
    items: itemsList,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    pageSize,
    isLoading,
    totalItems,
    availableCategories,
    discountTypes,
    fetchItems,
    fetchDiscountTypes,
    fetchCategories,
    titleCase,
    filteredItems,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange
  };
};
