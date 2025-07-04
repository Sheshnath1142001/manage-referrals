import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon, ChevronDown, ChevronRight } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
  activeMenuItemStyle: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CollapsibleSection({ 
  title, 
  icon: SectionIcon,
  items,
  activeMenuItemStyle,
  isExpanded,
  onToggle
}: CollapsibleSectionProps) {
  const location = useLocation();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const isActive = items.some(item => location.pathname === item.url);

  // Auto-expand if current route matches any item in this section
  useEffect(() => {
    if (isActive && !isExpanded && !isCollapsed) {
      onToggle();
    }
  }, [isActive, isExpanded, onToggle, isCollapsed]);

  const handleClick = () => {
    if (!isCollapsed || isMobile) {
      onToggle();
    }
  };

  const handleSubItemClick = () => {
    // Close mobile drawer when sub-navigation item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        onClick={handleClick}
        data-active={isActive}
        tooltip={title}
        className={`flex items-center justify-between whitespace-nowrap text-base ${isActive ? activeMenuItemStyle : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <SectionIcon className="w-6 h-6 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        {(!isCollapsed || isMobile) && (
          isExpanded ? 
            <ChevronDown className="h-5 w-5 opacity-50 flex-shrink-0 ml-1" /> : 
            <ChevronRight className="h-5 w-5 opacity-50 flex-shrink-0 ml-1" />
        )}
      </SidebarMenuButton>
      
      {isExpanded && (!isCollapsed || isMobile) && (
        <SidebarMenuSub className="space-y-2 mt-1 ml-1">
          {items.map(item => {
            const isItemActive = location.pathname === item.url || 
                              (item.url === "/transactions" && location.pathname === "/orders");
            const Icon = item.icon;
            return (
              <SidebarMenuSubItem key={item.title} className="py-1">
                <SidebarMenuSubButton
                  asChild
                  isActive={isItemActive}
                  className={`text-base ${isItemActive ? "bg-primary text-white" : ""}`}
                >
                  <Link to={item.url} className="flex items-center gap-3" onClick={handleSubItemClick}>
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
