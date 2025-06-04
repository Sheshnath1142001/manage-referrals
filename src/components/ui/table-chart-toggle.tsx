import React from "react";
import { BarChart as BarChartIcon, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TableChartToggleProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function TableChartToggle({ value, onValueChange, className }: TableChartToggleProps) {
  // Convert value format (lowercase in CategorySalesReport) to match SalesReport format (first letter uppercase)
  const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

  return (
    <Tabs 
      value={formattedValue}
      onValueChange={(newValue) => onValueChange(newValue.toLowerCase())}
      className={className || "w-full"}
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="Table" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Table
        </TabsTrigger>
        <TabsTrigger value="Chart" className="flex items-center gap-2">
          <BarChartIcon className="h-4 w-4" />
          Chart
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 