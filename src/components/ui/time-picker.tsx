
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  minTime?: string;
}

export function TimePicker({ 
  value, 
  onValueChange, 
  className,
  placeholder = "Select time",
  minTime 
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("12");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  // Parse existing value if provided
  React.useEffect(() => {
    if (value) {
      const [time, period] = value.split(' ');
      const [hour, minute] = time.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedPeriod(period);
    }
  }, [value]);

  // Convert time string to minutes for comparison
  const timeToMinutes = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    return hour24 * 60 + minute;
  };

  // Check if a time option is disabled
  const isTimeDisabled = (hour: string, minute: string, period: string) => {
    if (!minTime) return false;
    
    const currentTimeStr = `${hour}:${minute} ${period}`;
    const currentMinutes = timeToMinutes(currentTimeStr);
    const minMinutes = timeToMinutes(minTime);
    
    return currentMinutes < minMinutes;
  };

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = (i + 1).toString().padStart(2, '0');
    return hour;
  });

  // Generate minute options (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    return i.toString().padStart(2, '0');
  });

  const periodOptions = ["AM", "PM"];

  const handleApply = () => {
    const timeString = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
    onValueChange?.(timeString);
    setOpen(false);
  };

  const handleQuickSelect = (timeString: string) => {
    onValueChange?.(timeString);
    setOpen(false);
  };

  // Quick select options for common times
  const allQuickSelectTimes = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
  ];

  // Filter quick select times based on minTime
  const quickSelectTimes = minTime 
    ? allQuickSelectTimes.filter(time => !isTimeDisabled(
        time.split(':')[0], 
        time.split(':')[1].split(' ')[0], 
        time.split(' ')[1]
      ))
    : allQuickSelectTimes;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {/* Custom Time Selection */}
          <div className="space-y-4">
            <div className="flex gap-2 items-center">
              <Select value={selectedHour} onValueChange={setSelectedHour}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hourOptions.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      {hour}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-lg font-bold">:</span>
              
              <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-40">
                  {minuteOptions.map((minute) => (
                    <SelectItem key={minute} value={minute}>
                      {minute}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleApply} 
              className="w-full" 
              size="sm"
              disabled={isTimeDisabled(selectedHour, selectedMinute, selectedPeriod)}
            >
              Apply
            </Button>
            
            {isTimeDisabled(selectedHour, selectedMinute, selectedPeriod) && minTime && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                Selected time must be after {minTime}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
