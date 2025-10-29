import { 
  LayoutDashboard, 
  Package, 
  Users, 
  MapPin, 
  ClipboardList,
  BarChart3,
  FileText,
  Settings,
  ChevronRight
} from "lucide-react";
import { cn } from "./ui/utils";

interface SideNavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assets", label: "Assets", icon: Package },
  { id: "people", label: "People", icon: Users },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function SideNavigation({ currentPage, onNavigate }: SideNavigationProps) {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-[calc(100vh-57px)] sticky top-[57px]">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
