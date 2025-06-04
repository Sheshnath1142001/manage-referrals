import React, { useState, useEffect } from "react";
import {
  Download,
  PrinterIcon,
  RefreshCw,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { reportsApi } from "@/services/api/reports";
import { ReportType } from "@/types/reports";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";

// Type definition for the API response
interface ModifierReportItem {
  total_orders: string;
  modifier_sale: string;
  modifier_total_sold_quantity: string;
  modifier: string;
  product_id: string;
  product_name: string;
  modifier_id: string;
  modifier_category_id: number;
  modifier_category: string;
  category_name: string;
  group_clause: string;
}

// Type for structured data format
interface ModifierData {
  item_name: string;
  category_name: string;
  modifierCategories: {
    [categoryId: string]: {
      name: string;
      modifiers: {
        [modifierId: string]: {
          name: string;
          sales: { [date: string]: number };
          quantities: { [date: string]: number };
        }
      }
    }
  }
}

const ModifierSalesReport = () => {
  const { toast } = useToast();
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");
  const [salesData, setSalesData] = useState<ModifierData[]>([]);

  // Get current week's Sunday and Saturday
  const getCurrentWeekDates = () => {
    const now = new Date();
    const sunday = startOfWeek(now, { weekStartsOn: 0 });
    const saturday = endOfWeek(now, { weekStartsOn: 0 });
    return { sunday, saturday };
  };

  const { sunday, saturday } = getCurrentWeekDates();
  
  // Generate array of dates for the week
  const weekDates = Array.from({ length: 7 }, (_, i) => 
    addDays(sunday, i)
  );

  // Function to transform nested API data to a structured format
  const transformApiData = (apiData: any): ModifierData[] => {
    console.log("Raw API data:", apiData);
    if (!apiData || !apiData.data) return [];
    
    const structuredData: Record<string, ModifierData> = {};
    
    try {
      // Process each product
      Object.entries(apiData.data).forEach(([productId, productData]: [string, any]) => {
        let itemName = '';
        let categoryName = '';
        
        // Get or create the product entry
        if (!structuredData[productId]) {
          structuredData[productId] = {
            item_name: '',
            category_name: '',
            modifierCategories: {}
          };
        }
        
        // Process each modifier category
        Object.entries(productData).forEach(([categoryId, categoryData]: [string, any]) => {
          
          // Create category if it doesn't exist
          if (!structuredData[productId].modifierCategories[categoryId]) {
            structuredData[productId].modifierCategories[categoryId] = {
              name: '',
              modifiers: {}
            };
          }
          
          // Process each modifier
          Object.entries(categoryData).forEach(([modifierId, modifierData]: [string, any]) => {
            
            // Create modifier if it doesn't exist
            if (!structuredData[productId].modifierCategories[categoryId].modifiers[modifierId]) {
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId] = {
                name: '',
                sales: {},
                quantities: {}
              };
            }
            
            // Process each date
            Object.entries(modifierData).forEach(([date, dateData]: [string, any]) => {
              const data = dateData as ModifierReportItem;
              
              // Set names if not already set
              itemName = data.product_name;
              categoryName = data.category_name;
              structuredData[productId].item_name = data.product_name;
              structuredData[productId].category_name = data.category_name;
              structuredData[productId].modifierCategories[categoryId].name = data.modifier_category;
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].name = data.modifier;
              
              // Set sales and quantities
              const saleAmount = parseFloat(data.modifier_sale) || 0;
              const quantity = parseInt(data.modifier_total_sold_quantity) || 0;
              
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].sales[date] = saleAmount;
              structuredData[productId].modifierCategories[categoryId].modifiers[modifierId].quantities[date] = quantity;
            });
          });
        });
      });
      
      console.log("Transformed data:", Object.values(structuredData));
      return Object.values(structuredData);
    } catch (error) {
      console.error("Error transforming API data:", error);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await reportsApi.getModifierSalesReport({
        report_type: ReportType.Week,
        start_date: format(sunday, "yyyy-MM-dd"),
        end_date: format(saturday, "yyyy-MM-dd"),
        restaurant_id: parseInt(selectedLocation)
      });

      if (response) {
        // Transform the nested API response to a structured format
        const structuredData = transformApiData(response);
        setSalesData(structuredData);
      } else {
        setSalesData([]);
      }
    } catch (error) {
      console.error("Error fetching modifier sales data:", error);
      toast({
        title: "Error",
        description: "Failed to load modifier sales data.",
        variant: "destructive"
      });
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const calculateTotals = React.useMemo(() => {
    const daySales = weekDates.map(date => ({ 
      sales: 0, 
      quantity: 0 
    }));
    
    const totalSales = { sales: 0, quantity: 0 };
    
    // Process each item
    salesData.forEach(item => {
      // Process each modifier category
      Object.values(item.modifierCategories).forEach(category => {
        // Process each modifier
        Object.values(category.modifiers).forEach(modifier => {
          // Process each date
          weekDates.forEach((date, dateIndex) => {
            const formattedDate = format(date, "yyyy-MM-dd");
            const sales = modifier.sales[formattedDate] || 0;
            const quantity = modifier.quantities[formattedDate] || 0;
            
            daySales[dateIndex].sales += sales;
            daySales[dateIndex].quantity += quantity;
            
            totalSales.sales += sales;
            totalSales.quantity += quantity;
          });
        });
      });
    });
    
    return { daySales, totalSales };
  }, [salesData, weekDates]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchData();
  }, [selectedLocation]);

  // Filter sales data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return salesData;
    
    return salesData.filter(item => {
      // Check if item name matches
      if (item.item_name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return true;
      }
      
      // Check if any modifier category or modifier name matches
      return Object.values(item.modifierCategories).some(category => {
        // Check category name
        if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true;
        }
        
        // Check modifier names
        return Object.values(category.modifiers).some(modifier =>
          modifier.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    });
  }, [salesData, searchQuery]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Modifier Sales Report</h1>
        <div className="text-sm text-[#9b87f5] font-medium flex items-center gap-2">
          ADMIN
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by item or modifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select
          value={selectedLocation}
          onValueChange={handleLocationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All Locations</SelectItem>
            {!isLoadingRestaurants && restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-2 col-span-2">
          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9b87f5]" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table className="border-collapse">
            <TableHeader className="bg-[#0F172A]">
              <TableRow>
                <TableHead className="text-white font-medium">Item</TableHead>
                <TableHead className="text-white font-medium">Modifier Category</TableHead>
                <TableHead className="text-white font-medium">Modifier</TableHead>
                <TableHead className="text-white font-medium">Attributes</TableHead>
                {weekDates.map((date) => (
                  <TableHead 
                    key={date.toISOString()} 
                    className="text-white font-medium text-center whitespace-nowrap px-2 py-1"
                  >
                    {format(date, "yyyy-MM-dd")}
                  </TableHead>
                ))}
                <TableHead className="text-white font-medium text-center px-2 py-1">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {filteredData.length > 0 ? (
                <>
                  {filteredData.map((item, itemIndex) => {
                    // Get all categories for this item
                    const categories = Object.values(item.modifierCategories);
                    const rowSpanForItem = categories.reduce((total, category) => 
                      total + (Object.keys(category.modifiers).length * 2), 0);
                    
                    return (
                      <React.Fragment key={`item-${itemIndex}`}>
                        {categories.map((category, categoryIndex) => {
                          // Get all modifiers for this category
                          const modifiers = Object.values(category.modifiers);
                          const rowSpanForCategory = modifiers.length * 2;
                          
                          return (
                            <React.Fragment key={`category-${categoryIndex}`}>
                              {modifiers.map((modifier, modifierIndex) => {
                                // Calculate modifier totals
                                let totalSales = 0;
                                let totalQuantity = 0;
                                
                                weekDates.forEach(date => {
                                  const formattedDate = format(date, "yyyy-MM-dd");
                                  totalSales += modifier.sales[formattedDate] || 0;
                                  totalQuantity += modifier.quantities[formattedDate] || 0;
                                });
                                
                                return (
                                  <React.Fragment key={`modifier-${modifierIndex}`}>
                                    {/* Sale row */}
                                    <TableRow className="border-b border-gray-200">
                                      {modifierIndex === 0 && categoryIndex === 0 ? (
                                        <TableCell 
                                          rowSpan={rowSpanForItem} 
                                          className="px-2 py-1 border-r border-gray-200"
                                        >
                                          {item.item_name}
                                        </TableCell>
                                      ) : null}
                                      
                                      {modifierIndex === 0 ? (
                                        <TableCell 
                                          rowSpan={rowSpanForCategory} 
                                          className="px-2 py-1 border-r border-gray-200"
                                        >
                                          {category.name}
                                        </TableCell>
                                      ) : null}
                                      
                                      <TableCell className="px-2 py-1 border-r border-gray-200" rowSpan={2}>
                                        {modifier.name}
                                      </TableCell>
                                      
                                      <TableCell className="px-2 py-1 border-r border-gray-200 text-blue-600">
                                        Sale
                                      </TableCell>
                                      
                                      {weekDates.map((date, dateIndex) => {
                                        const formattedDate = format(date, "yyyy-MM-dd");
                                        const sale = modifier.sales[formattedDate] || 0;
                                        
                                        return (
                                          <TableCell key={dateIndex} className="text-center px-2 py-1 border-r border-gray-200">
                                            $ {sale}
                                          </TableCell>
                                        );
                                      })}
                                      
                                      <TableCell className="text-center font-medium px-2 py-1">
                                        $ {totalSales.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    
                                    {/* Quantity row */}
                                    <TableRow className={
                                      modifierIndex === modifiers.length - 1 && categoryIndex < categories.length - 1
                                        ? "border-b-2 border-gray-300" // thicker border for category separation
                                        : "border-b border-gray-200"
                                    }>
                                      <TableCell className="px-2 py-1 border-r border-gray-200">
                                        Quantity
                                      </TableCell>
                                      
                                      {weekDates.map((date, dateIndex) => {
                                        const formattedDate = format(date, "yyyy-MM-dd");
                                        const quantity = modifier.quantities[formattedDate] || 0;
                                        
                                        return (
                                          <TableCell key={dateIndex} className="text-center px-2 py-1 border-r border-gray-200">
                                            {quantity}
                                          </TableCell>
                                        );
                                      })}
                                      
                                      <TableCell className="text-center font-medium px-2 py-1">
                                        {totalQuantity}
                                      </TableCell>
                                    </TableRow>
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Totals rows */}
                  <TableRow className="border-b border-gray-200 font-medium bg-gray-50">
                    <TableCell className="px-2 py-1">Total</TableCell>
                    <TableCell className="px-2 py-1">-</TableCell>
                    <TableCell className="px-2 py-1">-</TableCell>
                    <TableCell className="px-2 py-1 text-blue-600">Sale</TableCell>
                    {calculateTotals.daySales.map((dayTotal, index) => (
                      <TableCell key={index} className="text-center px-2 py-1">
                        $ {dayTotal.sales.toFixed(2)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center px-2 py-1">
                      $ {calculateTotals.totalSales.sales.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-medium bg-gray-50">
                    <TableCell className="px-2 py-1">Total</TableCell>
                    <TableCell className="px-2 py-1">-</TableCell>
                    <TableCell className="px-2 py-1">-</TableCell>
                    <TableCell className="px-2 py-1">Quantity</TableCell>
                    {calculateTotals.daySales.map((dayTotal, index) => (
                      <TableCell key={index} className="text-center px-2 py-1">
                        {dayTotal.quantity}
                      </TableCell>
                    ))}
                    <TableCell className="text-center px-2 py-1">
                      {calculateTotals.totalSales.quantity}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-4">
                    No data available. Select a location and date range to view modifier sales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ModifierSalesReport;
