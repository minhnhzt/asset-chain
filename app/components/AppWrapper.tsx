/**
 * Main App Wrapper Component
 * Wraps all pages with navigation from Figma design
 */

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SolarWindsTopNav } from './pages/SolarWindsTopNav';
import { SolarWindsSideNav } from './pages/SolarWindsSideNav';
import { Toaster } from './ui/sonner';

interface AppWrapperProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: AppWrapperProps) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Map pathname to page identifier for navigation
  const getCurrentPage = () => {
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/assets')) return 'assets';
    if (pathname.startsWith('/maintenance')) return 'checkout';
    if (pathname.startsWith('/governance')) return 'governance';
    if (pathname.startsWith('/lending')) return 'lending';
    if (pathname.startsWith('/arbitrators')) return 'arbitrators';
    if (pathname.startsWith('/disputes')) return 'disputes';
    return 'dashboard';
  };

  const handleNavigate = (page: string) => {
    setSideNavOpen(false);
    
    // Map page identifier to route
    const routes: { [key: string]: string } = {
      'dashboard': '/dashboard',
      'assets': '/assets',
      'checkout': '/maintenance',
      'governance': '/governance',
      'lending': '/lending',
      'arbitrators': '/arbitrators',
      'disputes': '/disputes',
    };

    const route = routes[page] || '/dashboard';
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SolarWindsTopNav onMenuClick={() => setSideNavOpen(!sideNavOpen)} />

      <div className="flex">
        <SolarWindsSideNav
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          isOpen={sideNavOpen}
          onClose={() => setSideNavOpen(false)}
        />

        <main className="flex-1 lg:ml-0">{children}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
