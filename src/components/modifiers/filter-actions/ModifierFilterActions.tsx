
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
    <div className="flex flex-col sm:flex-row gap-4 sm:justify-end">
      <div className="flex gap-2 justify-end">
        <RefreshButton onRefresh={onRefresh} />
        <ImportButton onImportCSV={onImportCSV} />
        <AddNewButton onAddNew={onAddNew} />
      </div>
    </div>
  );
};
