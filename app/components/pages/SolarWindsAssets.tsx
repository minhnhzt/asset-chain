import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
}

const assets: Asset[] = [
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
  {
    id: 'AST-1556',
    name: 'iPad Pro 12.9"',
    category: 'Computers',
    status: 'checked-out',
    assignedTo: 'Emily Davis',
    location: 'Sales - Floor 1',
    purchaseDate: '2024-05-22',
    value: 1099,
    serialNumber: 'IPAD2024-1556',
  },
  {
    id: 'AST-1789',
    name: 'Surface Laptop 5',
    category: 'Computers',
    status: 'available',
    assignedTo: null,
    location: 'Warehouse',
    purchaseDate: '2024-09-05',
    value: 1299,
    serialNumber: 'SURF5-1789',
  },
  {
    id: 'AST-0234',
    name: 'Herman Miller Aeron Chair',
    category: 'Furniture',
    status: 'available',
    assignedTo: null,
    location: 'Warehouse',
    purchaseDate: '2023-06-12',
    value: 1395,
    serialNumber: 'HMA-0234',
  },
  {
    id: 'AST-0567',
    name: 'Standing Desk Electric',
    category: 'Furniture',
    status: 'checked-out',
    assignedTo: 'Mike Chen',
    location: 'Marketing - Floor 2',
    purchaseDate: '2023-09-18',
    value: 699,
    serialNumber: 'DESK-0567',
  },
  {
    id: 'AST-0923',
    name: 'Canon DSLR Camera',
    category: 'Equipment',
    status: 'available',
    assignedTo: null,
    location: 'Marketing - Floor 2',
    purchaseDate: '2024-01-30',
    value: 1849,
    serialNumber: 'CANON-0923',
  },
  {
    id: 'AST-1123',
    name: 'Lenovo ThinkPad X1',
    category: 'Computers',
    status: 'checked-out',
    assignedTo: 'David Lee',
    location: 'Finance - Floor 4',
    purchaseDate: '2024-04-10',
    value: 1699,
    serialNumber: 'THINK-1123',
  },
  {
    id: 'AST-0334',
    name: 'Conference Room Table',
    category: 'Furniture',
    status: 'available',
    assignedTo: null,
    location: 'Conference Room A',
    purchaseDate: '2023-03-25',
    value: 2200,
    serialNumber: 'CONF-0334',
  },
];

export function SolarWindsAssets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'available':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Available
          </Badge>
        );
      case 'checked-out':
        return (
          <Badge className="bg-orange-50 text-orange-700 border-orange-200">
            <Package className="h-3 w-3 mr-1" />
            Checked Out
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
      case 'retired':
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="h-3 w-3 mr-1" />
            Retired
          </Badge>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">All Assets</h1>
          <p className="text-sm text-gray-500">Manage and track all your organization's assets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="text-2xl text-gray-900 mb-1">{assets.length}</div>
          <div className="text-sm text-gray-600">Total Assets</div>
        </Card>
        <Card className="p-4 bg-white border-gray-200">
          <div className="text-2xl text-green-600 mb-1">
            {assets.filter((a) => a.status === 'available').length}
          </div>
          <div className="text-sm text-gray-600">Available</div>
        </Card>
        <Card className="p-4 bg-white border-gray-200">
          <div className="text-2xl text-orange-600 mb-1">
            {assets.filter((a) => a.status === 'checked-out').length}
          </div>
          <div className="text-sm text-gray-600">Checked Out</div>
        </Card>
        <Card className="p-4 bg-white border-gray-200">
          <div className="text-2xl text-yellow-600 mb-1">
            {assets.filter((a) => a.status === 'maintenance').length}
          </div>
          <div className="text-sm text-gray-600">In Maintenance</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Computers">Computers</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="checked-out">Checked Out</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Assets Table */}
      <Card className="bg-white border-gray-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Asset ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    No assets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm text-orange-600">{asset.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{asset.name}</div>
                          <div className="text-xs text-gray-500">{asset.serialNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300 text-gray-700">
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {asset.assignedTo || (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">{asset.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        ${asset.value.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Asset
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
