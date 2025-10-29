import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  MapPin
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const assetsByLocation = [
  { name: "Main Office", count: 487 },
  { name: "Warehouse", count: 312 },
  { name: "Remote", count: 198 },
  { name: "Branch A", count: 152 },
  { name: "Branch B", count: 98 },
];

const assetValueByCategory = [
  { name: "IT Equipment", value: 425000, color: "#00A99D" },
  { name: "Vehicles", value: 380000, color: "#6610f2" },
  { name: "Furniture", value: 125000, color: "#fd7e14" },
  { name: "Tools", value: 78000, color: "#20c997" },
  { name: "Other", value: 42000, color: "#6c757d" },
];

const utilizationData = [
  { month: "Jan", utilized: 82, available: 18 },
  { month: "Feb", utilized: 79, available: 21 },
  { month: "Mar", utilized: 85, available: 15 },
  { month: "Apr", utilized: 88, available: 12 },
  { month: "May", utilized: 86, available: 14 },
  { month: "Jun", utilized: 91, available: 9 },
];

const maintenanceCosts = [
  { month: "Jan", cost: 12500 },
  { month: "Feb", cost: 15200 },
  { month: "Mar", cost: 11800 },
  { month: "Apr", cost: 18900 },
  { month: "May", cost: 14300 },
  { month: "Jun", cost: 16700 },
];

const reportTemplates = [
  {
    id: 1,
    name: "Asset Inventory Report",
    description: "Complete list of all assets with current status",
    icon: Package,
    color: "text-primary"
  },
  {
    id: 2,
    name: "Asset Value Report",
    description: "Financial overview of asset values and depreciation",
    icon: DollarSign,
    color: "text-chart-4"
  },
  {
    id: 3,
    name: "Maintenance Report",
    description: "Scheduled and completed maintenance activities",
    icon: Clock,
    color: "text-chart-3"
  },
  {
    id: 4,
    name: "Location Report",
    description: "Asset distribution across all locations",
    icon: MapPin,
    color: "text-chart-2"
  },
  {
    id: 5,
    name: "Utilization Report",
    description: "Asset usage and check-out statistics",
    icon: TrendingUp,
    color: "text-chart-5"
  },
  {
    id: 6,
    name: "Custom Report",
    description: "Create a custom report with selected fields",
    icon: FileText,
    color: "text-muted-foreground"
  },
];

export function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">View insights and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assets by Location</CardTitle>
                <CardDescription>Distribution of assets across locations</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assetsByLocation}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="name" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #dee2e6',
                        borderRadius: '6px' 
                      }} 
                    />
                    <Bar dataKey="count" fill="#00A99D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Value by Category</CardTitle>
                <CardDescription>Total value distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetValueByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `$${(entry.value / 1000).toFixed(0)}K`}
                    >
                      {assetValueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #dee2e6',
                        borderRadius: '6px' 
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Utilization Rate</CardTitle>
                <CardDescription>Percentage of assets in use vs available</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #dee2e6',
                        borderRadius: '6px' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="utilized" stackId="a" fill="#00A99D" radius={[0, 0, 0, 0]} name="In Use (%)" />
                    <Bar dataKey="available" stackId="a" fill="#e9ecef" radius={[4, 4, 0, 0]} name="Available (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs</CardTitle>
                <CardDescription>Monthly maintenance spending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={maintenanceCosts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis dataKey="month" stroke="#6c757d" />
                    <YAxis stroke="#6c757d" />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #dee2e6',
                        borderRadius: '6px' 
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke="#fd7e14" 
                      strokeWidth={3}
                      dot={{ fill: '#fd7e14', r: 4 }}
                      name="Cost ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Value</p>
                    <p className="text-2xl">$1.05M</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-chart-4/10">
                    <TrendingUp className="h-6 w-6 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Utilization</p>
                    <p className="text-2xl">85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-chart-3/10">
                    <Clock className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Maint. Cost</p>
                    <p className="text-2xl">$89K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-chart-2/10">
                    <MapPin className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Locations</p>
                    <p className="text-2xl">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Choose a template to generate a report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className={`p-3 rounded-lg bg-secondary w-fit ${template.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="mb-1">{template.name}</h3>
                            <p className="text-muted-foreground">{template.description}</p>
                          </div>
                          <Button className="w-full" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
