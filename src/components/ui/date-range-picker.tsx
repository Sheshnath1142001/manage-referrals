import * as React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerWithRangeProps {
  className?: string;
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  selected,
  onSelect,
}: DatePickerWithRangeProps) {
  // Use local state to buffer selections before propagating to parent
  const [localDateRange, setLocalDateRange] = React.useState<DateRange | undefined>(selected);

  // Update local state when selected prop changes
  React.useEffect(() => {
    if (selected !== localDateRange) {
      setLocalDateRange(selected);
    }
  }, [selected]);

  // Handle local date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setLocalDateRange(range);
    
    // Only propagate complete date ranges to parent
    if (range?.from && range?.to) {
      onSelect?.(range);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={selected?.from || new Date()}
        selected={localDateRange}
        onSelect={handleDateRangeSelect}
        numberOfMonths={2}
        className="rounded-md border"
      />
      <div className="flex gap-2 px-4 pb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const today = new Date();
            const lastWeek = addDays(today, -7);
            const range = {
              from: lastWeek,
              to: today,
            };
            setLocalDateRange(range);
            onSelect?.(range);
          }}
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const today = new Date();
            const lastMonth = new Date(today);
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            const range = {
              from: lastMonth,
              to: today,
            };
            setLocalDateRange(range);
            onSelect?.(range);
          }}
        >
          Last 30 days
        </Button>
      </div>
    </div>
  );
} 