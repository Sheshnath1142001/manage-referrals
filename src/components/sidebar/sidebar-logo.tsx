import { useNavigate } from "react-router-dom";
import { SidebarRail, useSidebar } from "@/components/ui/sidebar";

export function SidebarLogo() {
  const navigate = useNavigate();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  const handleLogoClick = () => {
    navigate("/");
    // Close mobile drawer when logo is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <div className="flex h-16 items-center px-4 border-b border-border/40">
        {isCollapsed ? (
          <div 
            className="flex items-center justify-center w-8 h-8 cursor-pointer"
            onClick={handleLogoClick}
          >
            <img 
              src="/logo.png" 
              alt="Pratham Logo" 
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'block';
              }}
            />
            <span style={{ display: 'none' }}>P</span>
          </div>
        ) : (
          <div 
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Pratham Logo" 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-semibold text-foreground">Pratham Admin</span>
            </div>
          </div>
        )}
      </div>
      {!isMobile && <SidebarRail />}
    </>
  );
}
