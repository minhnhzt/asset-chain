/**
 * Dashboard Page with Real Data
 * Wraps SolarWindsDashboard với data từ backend API
 */

'use client';

import { useEffect, useState } from 'react';
import { SolarWindsDashboard } from '@/app/components/pages/SolarWindsDashboard';
import { useAssets } from '@/app/hooks/useAssets';

export default function DashboardWithData() {
  const { assets, loading, error } = useAssets();
  
  // Pass real data to dashboard if needed
  // For now, SolarWindsDashboard uses its own mock data for charts
  // We can enhance it later to accept real data props
  
  return <SolarWindsDashboard />;
}
