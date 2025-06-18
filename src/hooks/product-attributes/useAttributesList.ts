
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { attributesService } from "@/services/api/items/productAttributes";
import { ProductAttributesFilterParams } from "@/types/productAttributes";
import { useSearchParams } from "react-router-dom";
import { debounce } from "lodash";

export function useAttributesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filterParams, setFilterParams] = useState<ProductAttributesFilterParams & {
    page: number;
    per_page: number;
  }>({
    page: Number(searchParams.get('page')) || 1,
    per_page: Number(searchParams.get('per_page')) || 10,
    name: searchParams.get('atrribute') || undefined
  });
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('atrribute') || "");
  const [expandedAttribute, setExpandedAttribute] = useState<number | null>(null);

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setFilterParams(prev => ({
        ...prev,
        name: term || undefined,
        page: 1 // Reset to first page when search changes
      }));
    }, 500),
    []
  );

  // Apply debounced search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Update URL when filter params change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    // Set parameters in the exact order required: atrribute, page, per_page
    if (filterParams.name) newParams.set('atrribute', filterParams.name);
    newParams.set('page', filterParams.page.toString());
    newParams.set('per_page', filterParams.per_page.toString());
    if (filterParams.status !== undefined) newParams.set('status', filterParams.status.toString());
    
    setSearchParams(newParams);
  }, [filterParams, setSearchParams]);

  // Fetch product attributes
  const { data: attributesResponse, isLoading } = useQuery({
    queryKey: ['product-attributes', filterParams],
    queryFn: () => attributesService.getProductAttributes(filterParams)
      .then(response => {
        
        // Handle response format variations
        if (response?.data?.data) {
          return {
            attributes: response.data.data,
            total: response.data.pagination?.total || response.data.total || response.data.data.length,
            pagination: {
              page: filterParams.page,
              per_page: filterParams.per_page,
              total_pages: Math.ceil((response.data.total || response.data.data.length) / filterParams.per_page)
            }
          };
        }
        if (Array.isArray(response?.data)) {
          return {
            attributes: response.data,
            total: response.data.length,
            pagination: {
              page: filterParams.page,
              per_page: filterParams.per_page,
              total_pages: Math.ceil(response.data.length / filterParams.per_page)
            }
          };
        }
        return {
          attributes: [],
          total: 0,
          pagination: {
            page: 1,
            per_page: 10,
            total_pages: 0
          }
        };
      }),
  });
  
  const attributes = attributesResponse?.attributes || [];
  const totalItems = attributesResponse?.total || 0;
  const totalPages = Math.ceil(totalItems / filterParams.per_page);
  const pagination = attributesResponse?.pagination || {
    page: filterParams.page,
    per_page: filterParams.per_page,
    total_pages: totalPages
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    let statusValue: number | undefined;
    
    if (value === "All") {
      statusValue = undefined;
    } else if (value === "Active") {
      statusValue = 1;
    } else if (value === "Inactive") {
      statusValue = 0;
    }
    
    setFilterParams(prev => ({
      ...prev,
      status: statusValue,
      page: 1 // Reset to first page when filter changes
    }));
  };

  // Set search term (now with auto-filter via debounce)
  const handleSearchInputChange = (value: string) => {
    setSearchTerm(value);
    // The debounced search will be triggered by the useEffect
  };

  // Handle manual search (for backward compatibility)
  const handleSearch = () => {
    setFilterParams(prev => ({
      ...prev,
      name: searchTerm,
      page: 1 // Reset to first page when search changes
    }));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilterParams(prev => ({
      ...prev,
      name: undefined,
      page: 1 // Reset to first page when search is cleared
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilterParams(prev => ({
      ...prev,
      page
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    const newPageSize = pageSize === 0 ? -1 : pageSize;
    setFilterParams(prev => ({
      ...prev,
      per_page: newPageSize,
      page: 1 // Reset to first page when page size changes
    }));
  };

  // Toggle expanded attribute
  const toggleAttributeExpand = (id: number) => {
    setExpandedAttribute(expandedAttribute === id ? null : id);
  };

  return {
    // State
    filterParams,
    searchTerm,
    expandedAttribute,
    attributes,
    totalItems,
    pagination,
    isLoading,
    
    // Actions
    setSearchTerm: handleSearchInputChange,
    handleFilterChange,
    handleSearch,
    clearSearch,
    handlePageChange,
    handlePageSizeChange,
    toggleAttributeExpand
  };
}
