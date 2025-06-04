import React from "react";
import { BarChart, Table as TableIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface ViewToggleProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select view">
          {value === "table" ? (
            <div className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span>Table</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Chart</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="table">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4" />
            <span>Table</span>
          </div>
        </SelectItem>
        <SelectItem value="chart">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Chart</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 