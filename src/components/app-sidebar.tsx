
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar
} from "@/components/ui/sidebar";
import { Database, MapPin, Settings, ShoppingCart, Users, Megaphone } from "lucide-react";
import { SidebarLogo } from "./sidebar/sidebar-logo";
import { NavigationItem } from "./sidebar/navigation-item";
import { CollapsibleSection } from "./sidebar/collapsible-section";
import { 
  navigationItems, 
  masterDataItems, 
  locationsManagementItems, 
  orderManagementItems,
  userManagementItems,
  settingsManagementItems,
  promotionsManagementItems
} from "./sidebar/sidebar-items";

export function AppSidebar() {
  const location = useLocation();
  const activeMenuItemStyle = "bg-purple-700 text-white";
  const { state, setOpen } = useSidebar();
  
  const handleMouseEnter = () => {
    if (state === "collapsed") {
      setOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (state === "expanded") {
      setOpen(false);
    }
  };
  
  return (
    <div 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="h-full"
    >
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b p-0">
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="py-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  
                  return (
                    <NavigationItem
                      key={item.title}
                      title={item.title}
                      url={item.url}
                      icon={item.icon}
                      isActive={isActive}
                      activeMenuItemStyle={activeMenuItemStyle}
                    />
                  );
                })}

                <CollapsibleSection
                  title="Master Data Management"
                  icon={Database}
                  items={masterDataItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />

                <CollapsibleSection
                  title="Locations Management"
                  icon={MapPin}
                  items={locationsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />
                
                <CollapsibleSection
                  title="Order Management"
                  icon={ShoppingCart}
                  items={orderManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />
                
                <CollapsibleSection
                  title="User Management"
                  icon={Users}
                  items={userManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />

                <CollapsibleSection
                  title="Promotions Management"
                  icon={Megaphone}
                  items={promotionsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />

                <CollapsibleSection
                  title="Settings"
                  icon={Settings}
                  items={settingsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
