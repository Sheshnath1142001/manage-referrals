import { useNavigate } from "react-router-dom";
import { SidebarRail, useSidebar } from "@/components/ui/sidebar";

export function SidebarLogo() {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <div className="flex h-16 items-center justify-center px-4">
        {isCollapsed ? (
          <div 
            className="flex items-center justify-center w-8 h-8 cursor-pointer"
            onClick={() => navigate("/")}
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
            onClick={() => navigate("/")}
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
              <span className="text-xl font-semibold">Pratham Admin</span>
            </div>
          </div>
        )}
      </div>
      <SidebarRail />
    </>
  );
}
