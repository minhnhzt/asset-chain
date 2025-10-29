import {
  LayoutDashboard,
  Package,
  MapPin,
  Users,
  FileText,
  BarChart3,
  Settings,
  ClipboardCheck,
  Archive,
  Wrench,
  X,
  Laptop,
  Shield,
  Lock,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';

interface SolarWindsSideNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const mainMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'assets', label: 'All Assets', icon: Package },
  { id: 'checkout', label: 'Check In/Out', icon: ClipboardCheck },
  { id: 'governance', label: 'Governance', icon: Shield },
  { id: 'lending', label: 'NFT Lending', icon: Lock },
  { id: 'arbitrators', label: 'Arbitrators', icon: Scale },
  { id: 'disputes', label: 'Disputes', icon: AlertTriangle },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'people', label: 'People', icon: Users },
];

const assetCategories = [
  { id: 'computers', label: 'Computers', icon: Laptop, count: 234 },
  { id: 'furniture', label: 'Furniture', icon: Archive, count: 156 },
  { id: 'equipment', label: 'Equipment', icon: Wrench, count: 89 },
];

const managementItems = [
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function SolarWindsSideNav({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}: SolarWindsSideNavProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-900 border-r border-gray-800 z-40 transform transition-transform duration-300 lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-4 lg:hidden">
          <span className="text-white">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] lg:h-screen">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <div className="text-xs text-gray-500 mb-2 px-3">MAIN MENU</div>
              <div className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        currentPage === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Asset Categories */}
            <div>
              <div className="text-xs text-gray-500 mb-2 px-3">ASSET CATEGORIES</div>
              <div className="space-y-1">
                {assetCategories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors',
                        currentPage === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <Badge variant="outline" className="border-gray-700 text-gray-400 text-xs">
                        {item.count}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Management */}
            <div>
              <div className="text-xs text-gray-500 mb-2 px-3">MANAGEMENT</div>
              <div className="space-y-1">
                {managementItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                        currentPage === item.id
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 mb-3">ASSET OVERVIEW</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Total Assets</span>
                  <span className="text-sm text-white">479</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Checked Out</span>
                  <span className="text-sm text-orange-500">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">In Maintenance</span>
                  <span className="text-sm text-yellow-500">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Available</span>
                  <span className="text-sm text-green-500">344</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
