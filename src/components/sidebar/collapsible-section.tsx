
import { useState } from "react";
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
}

export function CollapsibleSection({ 
  title, 
  icon: SectionIcon,
  items,
  activeMenuItemStyle
}: CollapsibleSectionProps) {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isActive = items.some(item => location.pathname === item.url);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SidebarMenuItem className="mb-3">
      <SidebarMenuButton 
        onClick={toggleExpanded}
        data-active={isActive}
        tooltip={title}
        className={`flex items-center justify-between whitespace-nowrap text-base ${isActive ? activeMenuItemStyle : ""}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <SectionIcon className="w-6 h-6 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        {!isCollapsed && (
          isExpanded ? 
            <ChevronDown className="h-5 w-5 opacity-50 flex-shrink-0 ml-1" /> : 
            <ChevronRight className="h-5 w-5 opacity-50 flex-shrink-0 ml-1" />
        )}
      </SidebarMenuButton>
      
      {isExpanded && (
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
                  <Link to={item.url} className="flex items-center gap-3">
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
