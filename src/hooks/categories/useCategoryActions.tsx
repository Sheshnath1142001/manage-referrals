import { useCategoryMutations } from './useCategoryMutations';

export const useCategoryActions = () => {
  const { importCategoryMutation, updateCategorySequenceMutation } = useCategoryMutations();

  const handleImportCSV = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        importCategoryMutation.mutate(formData);
      }
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleUpdateSequence = (categoryId: string, newSeqNo: number, categoryName: string) => {
    updateCategorySequenceMutation.mutate({
      id: categoryId,
      seqNo: newSeqNo,
      name: categoryName
    });
  };

  return {
    handleImportCSV,
    handleUpdateSequence
  };
};
