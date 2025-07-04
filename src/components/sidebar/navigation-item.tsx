import { Link } from "react-router-dom";
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";

interface NavigationItemProps {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive: boolean;
  activeMenuItemStyle: string;
}

export function NavigationItem({ 
  title,
  url,
  icon: Icon,
  isActive,
  activeMenuItemStyle 
}: NavigationItemProps) {
  const { setOpenMobile, isMobile } = useSidebar();

  const handleClick = () => {
    // Close mobile drawer when navigation item is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenuItem key={title}>
      <SidebarMenuButton 
        asChild 
        tooltip={title}
        data-active={isActive}
        className={`text-base ${isActive ? activeMenuItemStyle : ""}`}
      >
        <Link to={url} className="flex items-center gap-3" onClick={handleClick}>
          <Icon className="w-6 h-6" />
          <span>{title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
