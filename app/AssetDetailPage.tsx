import { useState } from "react";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download, 
  LogOut,
  LogIn,
  QrCode,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Package,
  FileText,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface AssetDetailPageProps {
  assetId: string;
  onBack: () => void;
}

const assetDetails = {
  id: "AST-001",
  name: "Dell Latitude 5520",
  category: "IT Equipment",
  status: "Available",
  assignedTo: "-",
  location: "Main Office",
  purchaseDate: "2024-01-15",
  value: "$1,299",
  serialNumber: "DL5520-2024-001",
  manufacturer: "Dell Inc.",
  model: "Latitude 5520",
  condition: "Excellent",
  warranty: "2026-01-15",
  lastMaintenance: "2024-08-15",
  nextMaintenance: "2025-02-15",
  description: "15.6-inch business laptop with Intel Core i7 processor, 16GB RAM, and 512GB SSD storage. Includes original charger and carrying case.",
  image: "https://images.unsplash.com/photo-1609958740772-10b4c2322b95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBlcXVpcG1lbnQlMjBjb21wdXRlcnxlbnwxfHx8fDE3NjEyMjk4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
};

const checkoutHistory = [
  {
    id: 1,
    user: "Sarah Johnson",
    checkOutDate: "2024-03-15",
    checkInDate: "2024-04-01",
    purpose: "Business trip to NYC",
    duration: "17 days"
  },
  {
    id: 2,
    user: "Mike Chen",
    checkOutDate: "2024-05-20",
    checkInDate: "2024-06-05",
    purpose: "Remote work setup",
    duration: "16 days"
  },
  {
    id: 3,
    user: "Emily Davis",
    checkOutDate: "2024-08-10",
    checkInDate: "2024-09-01",
    purpose: "Conference presentation",
    duration: "22 days"
  },
];

const maintenanceHistory = [
  {
    id: 1,
    date: "2024-08-15",
    type: "Preventive Maintenance",
    description: "System update, hardware check, cleaning",
    technician: "IT Support Team",
    cost: "$50"
  },
  {
    id: 2,
    date: "2024-05-10",
    type: "Repair",
    description: "Battery replacement",
    technician: "Dell Service Center",
    cost: "$120"
  },
];

const documents = [
  { id: 1, name: "Purchase Receipt.pdf", uploadDate: "2024-01-15", size: "245 KB" },
  { id: 2, name: "Warranty Certificate.pdf", uploadDate: "2024-01-15", size: "180 KB" },
  { id: 3, name: "User Manual.pdf", uploadDate: "2024-01-16", size: "2.3 MB" },
];

const customFields = [
  { label: "Department", value: "IT Department" },
  { label: "Cost Center", value: "CC-2024-IT-001" },
  { label: "Insurance", value: "Yes" },
  { label: "Insurance Policy", value: "POL-2024-001" },
  { label: "Depreciation Rate", value: "20% per year" },
];

export function AssetDetailPage({ assetId, onBack }: AssetDetailPageProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1>{assetDetails.name}</h1>
              <Badge>{assetDetails.status}</Badge>
            </div>
            <p className="text-muted-foreground">{assetDetails.id} • {assetDetails.category}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button>
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image & Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <ImageWithFallback
                src={assetDetails.image}
                alt={assetDetails.name}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">Asset Value</p>
                    <p>{assetDetails.value}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">Location</p>
                    <p>{assetDetails.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">Assigned To</p>
                    <p>{assetDetails.assignedTo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground">Purchase Date</p>
                    <p>{assetDetails.purchaseDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Last Maintenance</p>
                  <p>{assetDetails.lastMaintenance}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-chart-3" />
                <div className="flex-1">
                  <p className="text-muted-foreground">Next Maintenance</p>
                  <p>{assetDetails.nextMaintenance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                  <CardDescription>Basic details about this asset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground">Serial Number</p>
                      <p>{assetDetails.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Manufacturer</p>
                      <p>{assetDetails.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p>{assetDetails.model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Condition</p>
                      <p>{assetDetails.condition}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Warranty Until</p>
                      <p>{assetDetails.warranty}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p>{assetDetails.category}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-muted-foreground mb-2">Description</p>
                    <p>{assetDetails.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                  <CardDescription>Additional information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {customFields.map((field, index) => (
                      <div key={index}>
                        <p className="text-muted-foreground">{field.label}</p>
                        <p>{field.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Check-Out History</CardTitle>
                  <CardDescription>All check-out and check-in records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {checkoutHistory.map((record) => (
                      <div key={record.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p>{record.user}</p>
                            <p className="text-muted-foreground">{record.purpose}</p>
                          </div>
                          <Badge variant="outline">{record.duration}</Badge>
                        </div>
                        <div className="flex gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <LogOut className="h-3 w-3" />
                            <span>Out: {record.checkOutDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <LogIn className="h-3 w-3" />
                            <span>In: {record.checkInDate}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                  <CardDescription>All maintenance and repair records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceHistory.map((record) => (
                      <div key={record.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p>{record.type}</p>
                              <Badge variant="outline">{record.cost}</Badge>
                            </div>
                            <p className="text-muted-foreground">{record.date}</p>
                          </div>
                        </div>
                        <p className="mb-2">{record.description}</p>
                        <p className="text-muted-foreground">Technician: {record.technician}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Attached files and documents</CardDescription>
                    </div>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 cursor-pointer">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p>{doc.name}</p>
                          <p className="text-muted-foreground">{doc.size} • {doc.uploadDate}</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
