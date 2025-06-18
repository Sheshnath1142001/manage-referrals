import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/styles/calendar.css";

// Import pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Index";
import Reports from "@/pages/Reports";
import SalesReport from "@/pages/reports/SalesReport";
import EntitySalesReport from "@/pages/reports/EntitySalesReport";
import ModifierSalesReport from "@/pages/reports/ModifierSalesReport";
import LoginReport from "@/pages/reports/LoginReport";
import CashCardReport from "@/pages/reports/CashCardReport";
import HourlySalesReport from "@/pages/reports/HourlySalesReport";
import TopPerformersReport from "@/pages/reports/TopPerformersReport";
import RefundReport from "@/pages/reports/RefundReport";
import EverydaySalesReport from "@/pages/reports/EverydaySalesReport";
import AdvanceCashReport from "@/pages/reports/AdvanceCashReport";
import CashupReport from "@/pages/reports/CashupReport";
import Staff from "@/pages/staff/Staff";
import Customers from "@/pages/Customers";
import GuestCustomers from "@/pages/GuestCustomers";
import CustomerGroups from "@/pages/CustomerGroups";
import Categories from "@/pages/Categories";
import Items from "@/pages/Items";
import ProductAttributes from "@/pages/ProductAttributes";
import ModifiersCategories from "@/pages/ModifiersCategories";
import ModifiersScreen from "@/pages/ModifiersScreen";
import Location from "@/pages/Location";
import LocationItems from "@/pages/LocationItems";
import DeliveryZones from "@/pages/DeliveryZones";
import Deals from "@/pages/Deals";
import Orders from "@/pages/Orders";
import OrderStatus from "@/pages/OrderStatus";
import Promotions from "@/pages/Promotions";
import CategorySalesReport from "@/pages/reports/CategorySalesReport";
import TableTypes from "@/pages/TableTypes";
import PaymentMethods from "@/pages/PaymentMethods";
import CloudPrinting from "@/pages/CloudPrinting";
import QuantityUnits from "@/pages/QuantityUnits";
import OrderRefunds from "@/pages/OrderRefunds";
import CustomerEdit from "@/pages/CustomerEdit";
import Tags from "@/pages/Tags";
import CustomerDisplay from "@/pages/CustomerDisplay"; 
import PromotionalGroups from "@/pages/PromotionalGroups"; 
import AttendanceReport from "@/pages/reports/AttendanceReport";
import RestaurantProducts from "@/pages/RestaurantProducts";
import Profile from "@/pages/Profile";
import OnlinePromotions from "@/pages/OnlinePromotions";
import SelfCheckoutDisplay from "@/pages/SelfCheckoutDisplay";
import HelpSupport from "@/pages/HelpSupport";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Always fetch fresh data - no caching
      refetchOnMount: true, // Always refetch when component mounts
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Home />} />
              
              {/* Reports */}
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/sales" element={<SalesReport />} />
              <Route path="/reports/entity-sales" element={<EntitySalesReport />} />
              <Route path="/reports/modifier-sales" element={<ModifierSalesReport />} />
              <Route path="/reports/login" element={<LoginReport />} />
              <Route path="/reports/cash-card" element={<CashCardReport />} />
              <Route path="/reports/hourly-sales" element={<HourlySalesReport />} />
              <Route path="/reports/top-performers" element={<TopPerformersReport />} />
              <Route path="/reports/refund" element={<RefundReport />} />
              <Route path="/reports/everyday-sales" element={<EverydaySalesReport />} />
              <Route path="/reports/cashup" element={<CashupReport />} />
              <Route path="/reports/advance-cash" element={<AdvanceCashReport />} />
              <Route path="/reports/category-sales" element={<CategorySalesReport />} />
              <Route path="/reports/attendance" element={<AttendanceReport />} />
              
              {/* Staff */}
              <Route path="/staff" element={<Staff />} />

              {/* Customers */}
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id/edit" element={<CustomerEdit />} />
              <Route path="/customers/:id" element={<CustomerEdit />} />

              {/* Guest Customers */}
              <Route path="/guest-customers" element={<GuestCustomers />} />

              {/* Customer Groups */}
              <Route path="/customer-groups" element={<CustomerGroups />} />

              {/* Master Data */}
              <Route path="/categories" element={<Categories />} />
              <Route path="/items" element={<Items />} />
              <Route path="/product-attributes" element={<ProductAttributes />} />
              <Route path="/modifiers-categories" element={<ModifiersCategories />} />
              <Route path="/modifiers-screen" element={<ModifiersScreen />} />

              {/* Locations Management */}
              <Route path="/location" element={<Location />} />
              <Route path="/location-items" element={<LocationItems />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/delivery-zones" element={<DeliveryZones />} />

              {/* Order Management */}
              <Route path="/transactions" element={<Orders />} />
              <Route path="/order-refunds" element={<OrderRefunds />} />
              <Route path="/order-status" element={<OrderStatus />} />
              
              {/* Promotions */}
              <Route path="/promotions" element={<Promotions />} />
              <Route path="/online-promotions" element={<OnlinePromotions />} />
              <Route path="/promotional-groups" element={<PromotionalGroups />} />
              <Route path="/customer-display" element={<CustomerDisplay />} />
              <Route path="/self-checkout-display" element={<SelfCheckoutDisplay />} />
              
              {/* Settings */}
              <Route path="/table-types" element={<TableTypes />} />
              <Route path="/quantity-units" element={<QuantityUnits />} />
              <Route path="/payment-methods" element={<PaymentMethods />} />
              <Route path="/cloud-printing" element={<CloudPrinting />} />
              <Route path="/tags" element={<Tags />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Help & Support */}
              <Route path="/help-support" element={<HelpSupport />} />
              
              <Route path="/restaurant-products" element={<RestaurantProducts />} />
              
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
