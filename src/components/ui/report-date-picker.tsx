import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface ReportDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function ReportDatePicker({ selectedDate, onDateChange }: ReportDatePickerProps) {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(selectedDate, { weekStartsOn: 0 }));
  const [weekEnd, setWeekEnd] = useState<Date>(endOfWeek(selectedDate, { weekStartsOn: 0 }));

  useEffect(() => {
    // When selectedDate changes, update week start and end
    setWeekStart(startOfWeek(selectedDate, { weekStartsOn: 0 }));
    setWeekEnd(endOfWeek(selectedDate, { weekStartsOn: 0 }));
  }, [selectedDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start text-left font-normal w-full">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {`Week of ${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
} 