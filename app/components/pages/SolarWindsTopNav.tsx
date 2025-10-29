import { Search, Bell, Plus, HelpCircle, Settings, Menu, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface SolarWindsTopNavProps {
  onMenuClick: () => void;
}

export function SolarWindsTopNav({ onMenuClick }: SolarWindsTopNavProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      {/* Left section */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-gray-600 hover:text-gray-900"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="6" fill="#F97316"/>
              <path d="M16 8L8 13V19L16 24L24 19V13L16 8Z" fill="white"/>
              <path d="M16 14L12 16.5V19.5L16 22L20 19.5V16.5L16 14Z" fill="#EA580C"/>
            </svg>
            <div className="hidden sm:block">
              <div className="text-lg tracking-tight text-gray-900">Solar Winds</div>
              <div className="text-xs text-gray-500 -mt-1">Asset Manager</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Button className="bg-orange-600 hover:bg-orange-700 text-white hidden md:flex">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-2xl mx-6 hidden lg:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets, locations, or people..."
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 relative hidden sm:flex"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            5
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 hidden sm:flex"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900 hidden sm:flex"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <div className="w-px h-6 bg-gray-200 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange-100 text-orange-600">JD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <div className="text-sm">John Doe</div>
                <div className="text-xs text-gray-500">Administrator</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Team Management</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
