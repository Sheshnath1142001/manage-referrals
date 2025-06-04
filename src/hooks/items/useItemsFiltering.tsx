
import { useState, useEffect, useMemo } from 'react';
import { Item } from '@/components/items/types';

export function useItemsFiltering(itemsList: Item[]) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Helper function for formatting text
  const titleCase = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter items based on search term, category, and status
  const filteredItems = useMemo(() => {
    return itemsList.filter((item) => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        item.category_id.toString() === selectedCategory;
      
      const statusValue = typeof item.status === 'string' 
        ? (item.status === 'Active' ? '1' : '0')
        : item.status.toString();
        
      const matchesStatus = selectedStatus === 'all' || 
        statusValue === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [itemsList, searchTerm, selectedCategory, selectedStatus]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    filteredItems,
    titleCase
  };
}
