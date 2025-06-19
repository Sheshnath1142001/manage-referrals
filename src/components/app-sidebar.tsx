import { useState } from "react";
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
  promotionsManagementItems,
  helpSupportItems
} from "./sidebar/sidebar-items";

export function AppSidebar() {
  const location = useLocation();
  const activeMenuItemStyle = "bg-purple-700 text-white";
  const { state, setOpen, isMobile } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  const handleMouseEnter = () => {
    if (!isMobile && state === "collapsed") {
      setOpen(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isMobile && state === "expanded") {
      setOpen(false);
    }
  };

  const handleSectionToggle = (sectionTitle: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  };
  
  return (
    <div 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="h-full relative"
    >
      <Sidebar variant={isMobile ? "floating" : "sidebar"} collapsible={isMobile ? "offcanvas" : "icon"}>
        <SidebarHeader className="border-b p-0">
          <SidebarLogo />
        </SidebarHeader>
        <SidebarContent className="py-6 overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
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
                  isExpanded={expandedSections.has("Master Data Management")}
                  onToggle={() => handleSectionToggle("Master Data Management")}
                />

                <CollapsibleSection
                  title="Locations Management"
                  icon={MapPin}
                  items={locationsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                  isExpanded={expandedSections.has("Locations Management")}
                  onToggle={() => handleSectionToggle("Locations Management")}
                />
                
                <CollapsibleSection
                  title="Order Management"
                  icon={ShoppingCart}
                  items={orderManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                  isExpanded={expandedSections.has("Order Management")}
                  onToggle={() => handleSectionToggle("Order Management")}
                />
                
                <CollapsibleSection
                  title="User Management"
                  icon={Users}
                  items={userManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                  isExpanded={expandedSections.has("User Management")}
                  onToggle={() => handleSectionToggle("User Management")}
                />

                <CollapsibleSection
                  title="Promotions Management"
                  icon={Megaphone}
                  items={promotionsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                  isExpanded={expandedSections.has("Promotions Management")}
                  onToggle={() => handleSectionToggle("Promotions Management")}
                />

                <CollapsibleSection
                  title="Settings"
                  icon={Settings}
                  items={settingsManagementItems}
                  activeMenuItemStyle={activeMenuItemStyle}
                  isExpanded={expandedSections.has("Settings")}
                  onToggle={() => handleSectionToggle("Settings")}
                />

                {/* Help & Support at the bottom */}
                {helpSupportItems.map((item) => {
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
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
