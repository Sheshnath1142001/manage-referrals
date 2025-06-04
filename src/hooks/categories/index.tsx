
import { useCategoriesData } from './useCategoriesData';
import { useCategoryMutations } from './useCategoryMutations';
import { useCategoryActions } from './useCategoryActions';

export const useCategories = () => {
  const categoriesData = useCategoriesData();
  const mutations = useCategoryMutations();
  const actions = useCategoryActions();

  return {
    ...categoriesData,
    ...mutations,
    ...actions
  };
};

export {
  useCategoriesData,
  useCategoryMutations,
  useCategoryActions
};
