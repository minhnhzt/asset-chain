import { useState } from "react";
import { SolarWindsTopNav } from "./SolarWindsTopNav";
import { SolarWindsSideNav } from "./SolarWindsSideNav";
import { SolarWindsDashboard } from "./SolarWindsDashboard";
import { SolarWindsAssets } from "./SolarWindsAssets";
import { SolarWindsCheckout } from "./SolarWindsCheckout";
import { GovernancePage } from "./GovernancePage";
import { LendingPage } from "./LendingPage";
import { ArbitratorsPage } from "./ArbitratorsPage";
import { DisputesPage } from "./DisputesPage";
import { AddAssetPage } from "./AddAssetPage";
import { Toaster } from "./components/ui/sonner";
import { useAssetsAPI } from "./hooks/useAssetsAPI";

interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'checked-out' | 'maintenance' | 'retired';
  assignedTo: string | null;
  location: string;
  purchaseDate: string;
  value: number;
  serialNumber: string;
  image?: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiry?: string;
  mintAddress?: string;
  ipfsHash?: string;
}

const initialAssets: Asset[] = [
  {
    id: 'AST-1247',
    name: 'MacBook Pro 16"',
    category: 'Computers',
    status: 'checked-out',
    assignedTo: 'Sarah Johnson',
    location: 'Engineering - Floor 3',
    purchaseDate: '2024-03-15',
    value: 2499,
    serialNumber: 'MPRO2024-1247',
  },
  {
    id: 'AST-0892',
    name: 'Dell Monitor 27"',
    category: 'Equipment',
    status: 'available',
    assignedTo: null,
    location: 'Warehouse',
    purchaseDate: '2023-11-20',
    value: 329,
    serialNumber: 'DELL27-0892',
  },
  {
    id: 'AST-0445',
    name: 'HP Printer LaserJet',
    category: 'Equipment',
    status: 'maintenance',
    assignedTo: null,
    location: 'IT Department',
    purchaseDate: '2022-08-10',
    value: 449,
    serialNumber: 'HPLJ-0445',
  },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState("assets");
  const [sideNavOpen, setSideNavOpen] = useState(false);
  
  // Use API hook instead of local state
  const {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshAssets,
  } = useAssetsAPI();

  const handleAddAsset = async (newAsset: Asset) => {
    await addAsset(newAsset);
    setCurrentPage("assets");
  };

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    await updateAsset(updatedAsset);
  };

  const handleDeleteAsset = async (assetId: string) => {
    await deleteAsset(assetId);
  };

  const renderPage = () => {
    // Show loading state
    if (loading && currentPage === "assets") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assets from blockchain...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (error && currentPage === "assets") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Assets</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refreshAssets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard":
        return <SolarWindsDashboard />;
      case "assets":
        return (
          <SolarWindsAssets
            assets={assets}
            onAddAsset={() => setCurrentPage("add-asset")}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        );
      case "checkout":
        return <SolarWindsCheckout />;
      case "governance":
        return <GovernancePage />;
      case "lending":
        return <LendingPage />;
      case "arbitrators":
        return <ArbitratorsPage />;
      case "disputes":
        return <DisputesPage />;
      case "add-asset":
        return (
          <AddAssetPage
            onBack={() => setCurrentPage("assets")}
            onAssetAdded={handleAddAsset}
          />
        );
      case "computers":
      case "furniture":
      case "equipment":
        return (
          <SolarWindsAssets
            assets={assets}
            onAddAsset={() => setCurrentPage("add-asset")}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        );
      default:
        return <SolarWindsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SolarWindsTopNav
        onMenuClick={() => setSideNavOpen(!sideNavOpen)}
        onAddAsset={() => setCurrentPage("add-asset")}
      />

      <div className="flex">
        <SolarWindsSideNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={sideNavOpen}
          onClose={() => setSideNavOpen(false)}
        />

        <main className="flex-1 lg:ml-0">{renderPage()}</main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}