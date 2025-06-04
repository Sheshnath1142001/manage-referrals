
import { CategoryList } from './CategoryList';
import { CategoryFilters } from './CategoryFilters';
import { CategoryForm } from './CategoryForm';
import { CategoriesProvider } from './CategoriesContext';
// Import the hook from our new refactored location
import { useCategories as useCategoriesHook } from '@/hooks/categories';
// Import the type separately
import type { Category } from './CategoriesContext';

export {
  CategoryList,
  CategoryFilters,
  CategoryForm,
  CategoriesProvider,
  useCategoriesHook,
};

// Export the type with the 'export type' syntax
export type { Category };
