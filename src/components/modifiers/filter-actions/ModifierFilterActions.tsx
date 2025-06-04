
import { RefreshButton } from "./buttons/RefreshButton";
import { ImportButton } from "./buttons/ImportButton";
import { AddNewButton } from "./buttons/AddNewButton";

interface ModifierFilterActionsProps {
  onRefresh: () => void;
  onImportCSV: () => void;
  onAddNew: () => void;
}

export const ModifierFilterActions = ({ onRefresh, onImportCSV, onAddNew }: ModifierFilterActionsProps) => {
  return (
    <div className="flex items-end gap-2">
      <RefreshButton onRefresh={onRefresh} />
      <ImportButton onImportCSV={onImportCSV} />
      <AddNewButton onAddNew={onAddNew} />
    </div>
  );
};
