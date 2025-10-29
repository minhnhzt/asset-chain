import { useState } from "react";
import { 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  LogOut,
  LogIn,
  Package,
  Search
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const assetsData = [
  {
    id: "AST-001",
    name: "Dell Latitude 5520",
    category: "IT Equipment",
    status: "Available",
    assignedTo: "-",
    location: "Main Office",
    purchaseDate: "2024-01-15",
    value: "$1,299",
    image: "https://images.unsplash.com/photo-1609958740772-10b4c2322b95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBlcXVpcG1lbnQlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjEyMjk4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-002",
    name: "iPad Pro 12.9",
    category: "IT Equipment",
    status: "Checked Out",
    assignedTo: "Mike Chen",
    location: "Marketing Dept",
    purchaseDate: "2024-02-20",
    value: "$1,099",
    image: "https://images.unsplash.com/photo-1609958740772-10b4c2322b95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBlcXVpcG1lbnQlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjEyMjk4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-003",
    name: "Canon EOS R5",
    category: "Photography",
    status: "Available",
    assignedTo: "-",
    location: "Creative Studio",
    purchaseDate: "2023-11-10",
    value: "$3,899",
    image: "https://images.unsplash.com/photo-1512025316832-8658f04f8a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW1lcmElMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzYxMTYzNjA0fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-004",
    name: "Conference Room TV",
    category: "Office Equipment",
    status: "In Use",
    assignedTo: "Conference Room A",
    location: "Main Office",
    purchaseDate: "2023-08-05",
    value: "$2,499",
    image: "https://images.unsplash.com/photo-1736667245201-2eea25a07f55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWV0aW5nJTIwcm9vbSUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NjEyNDUxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-005",
    name: "Company Van #3",
    category: "Vehicles",
    status: "Maintenance",
    assignedTo: "-",
    location: "Garage",
    purchaseDate: "2022-03-15",
    value: "$35,000",
    image: "https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnl8ZW58MXx8fHwxNzYxMjE2OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-006",
    name: "Standing Desk Electric",
    category: "Furniture",
    status: "Available",
    assignedTo: "-",
    location: "Warehouse",
    purchaseDate: "2024-03-01",
    value: "$799",
    image: "https://images.unsplash.com/photo-1664382953403-fc1ac77073a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnl8ZW58MXx8fHwxNzYxMjE2OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-007",
    name: "Barcode Scanner",
    category: "Tools",
    status: "Checked Out",
    assignedTo: "Sarah Johnson",
    location: "Warehouse",
    purchaseDate: "2023-12-20",
    value: "$249",
    image: "https://images.unsplash.com/photo-1726255294277-57c46883bd94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjb2RlJTIwc2Nhbm5lcnxlbnwxfHx8fDE3NjEyMjQ0MTN8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: "AST-008",
    name: "MacBook Pro 16",
    category: "IT Equipment",
    status: "Checked Out",
    assignedTo: "Emily Davis",
    location: "Remote",
    purchaseDate: "2024-01-05",
    value: "$2,799",
    image: "https://images.unsplash.com/photo-1609958740772-10b4c2322b95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBlcXVpcG1lbnQlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjEyMjk4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
];

interface AssetsPageProps {
  onViewAsset: (assetId: string) => void;
}

export function AssetsPage({ onViewAsset }: AssetsPageProps) {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssets = assetsData.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(a => a.id));
    }
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Available":
        return "default";
      case "Checked Out":
        return "secondary";
      case "In Use":
        return "outline";
      case "Maintenance":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Assets</h1>
          <p className="text-muted-foreground">Manage and track all your assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="IT Equipment">IT Equipment</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Vehicles">Vehicles</SelectItem>
                <SelectItem value="Tools">Tools</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
                <SelectItem value="Office Equipment">Office Equipment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Checked Out">Checked Out</SelectItem>
                <SelectItem value="In Use">In Use</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Actions */}
      {selectedAssets.length > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span>{selectedAssets.length} asset(s) selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
                <Button variant="outline" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Check In
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Bulk Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assets Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedAssets.length === filteredAssets.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id} className="cursor-pointer hover:bg-secondary/50">
                <TableCell>
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => handleSelectAsset(asset.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell onClick={() => onViewAsset(asset.id)}>
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={asset.image}
                      alt={asset.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <div>{asset.name}</div>
                      <div className="text-muted-foreground">{asset.id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(asset.status)}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>{asset.assignedTo}</TableCell>
                <TableCell>{asset.location}</TableCell>
                <TableCell>{asset.value}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewAsset(asset.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        Check Out
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {filteredAssets.length} of {assetsData.length} assets
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
