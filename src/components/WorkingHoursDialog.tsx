import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus, Clock, Copy } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  id?: number;
  start_time: string;
  end_time: string;
}

interface DaySlots {
  id?: number;
  day_of_week: number;
  status: number;
  slots: TimeSlot[];
  order_type_id: number;
}

interface WorkingHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  initialData?: any;
  serviceType: string;
  restaurantId?: number;
}

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const apiBaseUrl = import.meta.env.API_BASE_URL || 'https://pratham-respos-testbe-v34.achyutlabs.cloud/api';

const WorkingHoursDialog = ({
  open,
  onOpenChange,
  onSubmit,
  restaurantId
}: WorkingHoursDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dineIn");
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyTo, setCopyTo] = useState<{ takeaway: boolean; delivery: boolean }>({
    takeaway: true,
    delivery: true
  });

  // State for time slots organized by order type and day
  const [timeSlots, setTimeSlots] = useState<{
    dineIn: DaySlots[];
    takeaway: DaySlots[];
    delivery: DaySlots[];
  }>({
    dineIn: [],
    takeaway: [],
    delivery: []
  });

  // State to store original time slots for reset functionality
  const [originalTimeSlots, setOriginalTimeSlots] = useState<{
    dineIn: DaySlots[];
    takeaway: DaySlots[];
    delivery: DaySlots[];
  }>({
    dineIn: [],
    takeaway: [],
    delivery: []
  });

  // Order type mapping
  const ORDER_TYPES = {
    dineIn: 1,
    takeaway: 2,
    delivery: 3
  };

  // Validation function to check if all enabled days have valid time slots
  const validateTimeSlots = (slots: DaySlots[]): boolean => {
    return slots.every(daySlot => {
      // If day is disabled, no validation needed
      if (daySlot.status === 0) return true;
      
      // If day is enabled, check if all slots have valid start and end times
      return daySlot.slots.every(slot => {
        return slot.start_time.trim() !== '' && slot.end_time.trim() !== '';
      });
    });
  };

  // Check if all sections have valid time slots
  const isFormValid = (): boolean => {
    return Object.values(timeSlots).every(sectionSlots => 
      validateTimeSlots(sectionSlots)
    );
  };

  // Normalize time format to HH:MM (add leading zeros)
  const normalizeTime = (time: string): string => {
    if (!time) return "10:00";
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Initialize default slots for a day
  const createDefaultDaySlots = (dayOfWeek: number, orderTypeId: number): DaySlots => ({
    day_of_week: dayOfWeek,
    status: 1,
    slots: [{ start_time: "10:00", end_time: "23:00" }],
    order_type_id: orderTypeId
  });

  // Fetch existing time slots
  const fetchTimeSlots = async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    try {
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      const response = await fetch(
        `${apiBaseUrl}/restaurant-time-slots?restaurant_id=${restaurantId}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Timezone': 'Asia/Calcutta'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }

      const data = await response.json();
      transformApiDataToState(data.restaurant_time_slots || []);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to load opening hours",
        variant: "destructive"
      });
      // Initialize with default values
      initializeDefaultSlots();
    } finally {
      setIsLoading(false);
    }
  };

  // Transform API data to component state
  const transformApiDataToState = (apiData: any[]) => {
    const organized = {
      dineIn: [] as DaySlots[],
      takeaway: [] as DaySlots[],
      delivery: [] as DaySlots[]
    };

    // Group by order type
    const groupedByType = apiData.reduce((acc, slot) => {
      const orderType = slot.order_types?.id;
      if (!acc[orderType]) acc[orderType] = [];
      acc[orderType].push(slot);
      return acc;
    }, {});

    // Transform each order type
    Object.entries(ORDER_TYPES).forEach(([key, orderTypeId]) => {
      const typeSlots = groupedByType[orderTypeId] || [];
      
      for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
        const daySlot = typeSlots.find(slot => slot.day_of_week === dayIndex);
        
        if (daySlot) {
          organized[key as keyof typeof organized].push({
            id: daySlot.id,
            day_of_week: dayIndex,
            status: daySlot.status,
            slots: daySlot.restaurant_time_slot_hours.map((hour: any) => ({
              id: hour.id,
              start_time: normalizeTime(hour.start_time),
              end_time: normalizeTime(hour.end_time)
            })),
            order_type_id: orderTypeId
          });
        } else {
          // Create default if not exists
          organized[key as keyof typeof organized].push(
            createDefaultDaySlots(dayIndex, orderTypeId)
          );
        }
      }
    });

    setTimeSlots(organized);
    setOriginalTimeSlots(organized);
  };

  // Initialize with default slots
  const initializeDefaultSlots = () => {
    const defaultSlots = {
      dineIn: [] as DaySlots[],
      takeaway: [] as DaySlots[],
      delivery: [] as DaySlots[]
    };

    Object.entries(ORDER_TYPES).forEach(([key, orderTypeId]) => {
      for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
        defaultSlots[key as keyof typeof defaultSlots].push(
          createDefaultDaySlots(dayIndex, orderTypeId)
        );
      }
    });

    setTimeSlots(defaultSlots);
    setOriginalTimeSlots(defaultSlots);
  };

  // Fetch data when dialog opens
  useEffect(() => {
    if (open && restaurantId) {
      fetchTimeSlots();
    }
  }, [open, restaurantId]);

  // Toggle day status
  const handleToggleDay = (section: keyof typeof timeSlots, dayIndex: number, enabled: boolean) => {
    setTimeSlots(prev => ({
      ...prev,
      [section]: prev[section].map((day, index) => 
        index === dayIndex ? { ...day, status: enabled ? 1 : 0 } : day
      )
    }));
  };

  // Update time slot
  const handleTimeChange = (
    section: keyof typeof timeSlots,
    dayIndex: number,
    slotIndex: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setTimeSlots(prev => ({
      ...prev,
      [section]: prev[section].map((day, dIndex) => 
        dIndex === dayIndex ? {
          ...day,
          slots: day.slots.map((slot, sIndex) => 
            sIndex === slotIndex ? { ...slot, [field]: value } : slot
          )
        } : day
      )
    }));
  };

  // Add new time slot
  const handleAddTimeSlot = (section: keyof typeof timeSlots, dayIndex: number) => {
    setTimeSlots(prev => ({
      ...prev,
      [section]: prev[section].map((day, dIndex) => 
        dIndex === dayIndex ? {
          ...day,
          slots: [...day.slots, { start_time: "10:00", end_time: "23:00" }]
        } : day
      )
    }));
  };

  // Remove time slot
  const handleRemoveTimeSlot = (section: keyof typeof timeSlots, dayIndex: number, slotIndex: number) => {
    setTimeSlots(prev => ({
      ...prev,
      [section]: prev[section].map((day, dIndex) => 
        dIndex === dayIndex ? {
          ...day,
          slots: day.slots.filter((_, sIndex) => sIndex !== slotIndex)
        } : day
      )
    }));
  };

  // Copy slots functionality
  const handleCopyStoreClick = () => {
    setCopyTo({
      takeaway: activeTab !== 'takeaway',
      delivery: activeTab !== 'delivery'
    });
    setIsCopyDialogOpen(true);
  };

  const handleCopyConfirm = () => {
    const sourceSection = activeTab as keyof typeof timeSlots;
    const sourceSlots = timeSlots[sourceSection];

    setTimeSlots(prev => {
      const newSlots = { ...prev };
      
      if (copyTo.takeaway && activeTab !== 'takeaway') {
        newSlots.takeaway = sourceSlots.map(day => ({
          ...day,
          order_type_id: ORDER_TYPES.takeaway,
          id: undefined // Remove ID for new entries
        }));
      }
      
      if (copyTo.delivery && activeTab !== 'delivery') {
        newSlots.delivery = sourceSlots.map(day => ({
          ...day,
          order_type_id: ORDER_TYPES.delivery,
          id: undefined // Remove ID for new entries
        }));
      }
      
      return newSlots;
    });

    setIsCopyDialogOpen(false);
    toast({
      title: "Success",
      description: "Time slots copied successfully"
    });
  };

  // Submit changes
  const handleSubmit = async () => {
    if (!restaurantId) return;

    setIsSubmitting(true);
    try {
      const adminData = localStorage.getItem('Admin');
      let token = '';
      if (adminData) {
        try {
          token = JSON.parse(adminData).token;
        } catch {}
      }

      // Transform state to API format
      const apiData: any[] = [];
      
      Object.entries(timeSlots).forEach(([section, daySlots]) => {
        daySlots.forEach(day => {
          apiData.push({
            status: day.status,
            day_of_week: day.day_of_week,
            slots: day.slots.map(slot => ({
              start_time: slot.start_time,
              end_time: slot.end_time,
              ...(slot.id && { id: slot.id })
            })),
            ...(day.id && { id: day.id }),
            order_type_id: day.order_type_id,
            restaurant_id: restaurantId
          });
        });
      });

      const response = await fetch(
        `${apiBaseUrl}/restaurant_time_slots`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Timezone': 'Asia/Calcutta'
          },
          body: JSON.stringify(apiData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update time slots');
      }

      toast({
        title: "Success",
        description: "Opening hours updated successfully"
      });
      
      onSubmit();
      onOpenChange(false);
    } catch (error) {
      
      toast({
        title: "Error",
        description: "Failed to update opening hours",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Reset only the currently active tab's timings
    setTimeSlots(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(day => ({
        ...day,
        slots: day.slots.map(slot => ({
          ...slot,
          start_time: "",
          end_time: ""
        }))
      }))
    }));
    
    toast({
      title: "Reset Successful",
      description: `${getActiveTabName()} timings have been cleared. Please enter new timings.`
    });
  };

  const getActiveTabName = () => {
    if (activeTab === 'dineIn') return 'Dine In';
    if (activeTab === 'takeaway') return 'Takeaway';
    if (activeTab === 'delivery') return 'Delivery';
    return '';
  };

  const renderTimeSlots = (section: keyof typeof timeSlots) => {
    const sectionSlots = timeSlots[section];
    
    return (
      <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
        {sectionSlots.map((daySlot, dayIndex) => (
          <div key={daySlot.day_of_week} className="py-2 border-b last:border-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={daySlot.status === 1}
                  onCheckedChange={(checked) => handleToggleDay(section, dayIndex, checked)}
                />
                <Label className={daySlot.status === 1 ? 'font-medium' : 'text-gray-400'}>
                  {days[daySlot.day_of_week - 1]}
                </Label>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0"
                onClick={() => handleAddTimeSlot(section, dayIndex)}
                disabled={daySlot.status === 0}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            {daySlot.slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                  <Label className="text-sm text-gray-500 w-20 sm:w-auto sm:min-w-20">Start Time</Label>
                  <div className="relative flex-1">
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleTimeChange(section, dayIndex, slotIndex, 'start_time', e.target.value)}
                      disabled={daySlot.status === 0}
                      className="pl-10"
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                  <Label className="text-sm text-gray-500 w-20 sm:w-auto sm:min-w-20">End Time</Label>
                  <div className="relative flex-1">
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleTimeChange(section, dayIndex, slotIndex, 'end_time', e.target.value)}
                      disabled={daySlot.status === 0}
                      className="pl-10"
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {daySlot.slots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTimeSlot(section, dayIndex, slotIndex)}
                      className="text-red-500 hover:text-red-700 self-start sm:self-center mt-2 sm:mt-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[550px] p-0 overflow-hidden">
        <DialogHeader className="bg-primary text-white px-4 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              Edit Opening Hours
            </DialogTitle>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-primary-foreground/20 h-8 w-8 p-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        {isLoading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="dineIn" className="uppercase text-xs sm:text-sm">Dine In</TabsTrigger>
              <TabsTrigger value="takeaway" className="uppercase text-xs sm:text-sm">Takeaway</TabsTrigger>
              <TabsTrigger value="delivery" className="uppercase text-xs sm:text-sm">Delivery</TabsTrigger>
            </TabsList>
            
            <div className="flex justify-end p-2">
              <Button 
                type="button" 
                variant="link" 
                size="sm" 
                onClick={handleCopyStoreClick}
                className="text-blue-600 text-xs sm:text-sm"
              >
                Copy Slots
              </Button>
            </div>
            
            <TabsContent value="dineIn" className="mt-0">
              {renderTimeSlots('dineIn')}
            </TabsContent>
            
            <TabsContent value="takeaway" className="mt-0">
              {renderTimeSlots('takeaway')}
            </TabsContent>
            
            <TabsContent value="delivery" className="mt-0">
              {renderTimeSlots('delivery')}
            </TabsContent>
            
            <DialogFooter className="p-4 border-t border-gray-200">
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="text-xs sm:text-sm"
                >
                  RESET
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid()}
                  className="bg-primary text-white hover:bg-primary/90 text-xs sm:text-sm"
                >
                  {isSubmitting ? "SAVING..." : "SUBMIT"}
                </Button>
              </div>
            </DialogFooter>
          </Tabs>
        )}
      </DialogContent>
      
      {/* Copy Slots Dialog */}
      {isCopyDialogOpen && (
        <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[400px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 text-white rounded-full p-2">
                <Copy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base">Time Slots Will Be Copied From <span className="text-blue-600 font-medium">{getActiveTabName()}</span> To</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              {activeTab !== 'takeaway' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="takeaway" 
                    checked={copyTo.takeaway} 
                    onCheckedChange={(checked) => 
                      setCopyTo(prev => ({ ...prev, takeaway: checked === true }))
                    }
                    className="border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <label htmlFor="takeaway" className="text-sm sm:text-base">Takeaway</label>
                </div>
              )}
              
              {activeTab !== 'delivery' && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="delivery" 
                    checked={copyTo.delivery} 
                    onCheckedChange={(checked) => 
                      setCopyTo(prev => ({ ...prev, delivery: checked === true }))
                    }
                    className="border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <label htmlFor="delivery" className="text-sm sm:text-base">Delivery</label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCopyDialogOpen(false)}
                className="text-red-500 border-red-500 hover:bg-red-50 text-xs sm:text-sm"
              >
                CANCEL
              </Button>
              <Button 
                type="button" 
                onClick={handleCopyConfirm}
                className="bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm"
              >
                COPY
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default WorkingHoursDialog;
