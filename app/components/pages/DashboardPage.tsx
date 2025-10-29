import { 
  Package, 
  Users, 
  MapPin, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const statsData = [
  {
    title: "Total Assets",
    value: "1,247",
    change: "+12.5%",
    trend: "up",
    icon: Package,
    color: "text-primary"
  },
  {
    title: "Active Users",
    value: "89",
    change: "+4.3%",
    trend: "up",
    icon: Users,
    color: "text-chart-2"
  },
  {
    title: "Locations",
    value: "24",
    change: "-2.1%",
    trend: "down",
    icon: MapPin,
    color: "text-chart-3"
  },
  {
    title: "Asset Value",
    value: "$847K",
    change: "+8.2%",
    trend: "up",
    icon: TrendingUp,
    color: "text-chart-4"
  },
];

const assetsByCategory = [
  { name: "IT Equipment", value: 485, color: "#00A99D" },
  { name: "Furniture", value: 312, color: "#6610f2" },
  { name: "Vehicles", value: 198, color: "#fd7e14" },
  { name: "Tools", value: 152, color: "#20c997" },
  { name: "Other", value: 100, color: "#6c757d" },
];

const monthlyData = [
  { month: "Jan", assets: 1050 },
  { month: "Feb", assets: 1098 },
  { month: "Mar", assets: 1145 },
  { month: "Apr", assets: 1189 },
  { month: "May", assets: 1210 },
  { month: "Jun", assets: 1247 },
];

const recentActivity = [
  {
    id: 1,
    action: "Asset Added",
    asset: "Dell Latitude 5520",
    user: "Sarah Johnson",
    time: "5 minutes ago",
    type: "new"
  },
  {
    id: 2,
    action: "Check-Out",
    asset: "iPad Pro 12.9",
    user: "Mike Chen",
    time: "23 minutes ago",
    type: "checkout"
  },
  {
    id: 3,
    action: "Check-In",
    asset: "Canon EOS R5",
    user: "Emily Davis",
    time: "1 hour ago",
    type: "checkin"
  },
  {
    id: 4,
    action: "Asset Updated",
    asset: "Conference Room TV",
    user: "Admin",
    time: "2 hours ago",
    type: "update"
  },
  {
    id: 5,
    action: "Maintenance",
    asset: "Company Van #3",
    user: "Maintenance Team",
    time: "3 hours ago",
    type: "maintenance"
  },
];

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, John! Here's what's happening with your assets.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl">{stat.value}</p>
                    <div className={cn(
                      "flex items-center gap-1",
                      stat.trend === "up" ? "text-chart-4" : "text-destructive"
                    )}>
                      <TrendIcon className="h-4 w-4" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-lg bg-secondary", stat.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assets Over Time</CardTitle>
            <CardDescription>Total assets registered per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
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
                <Bar dataKey="assets" fill="#00A99D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assets by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Assets by Category</CardTitle>
            <CardDescription>Distribution of asset types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {assetsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
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

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  activity.type === "new" && "bg-chart-4/10 text-chart-4",
                  activity.type === "checkout" && "bg-chart-3/10 text-chart-3",
                  activity.type === "checkin" && "bg-primary/10 text-primary",
                  activity.type === "update" && "bg-chart-2/10 text-chart-2",
                  activity.type === "maintenance" && "bg-chart-5/10 text-chart-5"
                )}>
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{activity.action}</span>
                    <Badge variant="outline" className="text-xs">{activity.asset}</Badge>
                  </div>
                  <p className="text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-muted-foreground">{activity.time}</span>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
