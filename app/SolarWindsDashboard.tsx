import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const assetsByCategory = [
  { name: 'Computers', value: 234, color: '#3b82f6' },
  { name: 'Furniture', value: 156, color: '#8b5cf6' },
  { name: 'Equipment', value: 89, color: '#f59e0b' },
];

const assetValueData = [
  { month: 'Jan', value: 485000 },
  { month: 'Feb', value: 492000 },
  { month: 'Mar', value: 505000 },
  { month: 'Apr', value: 518000 },
  { month: 'May', value: 535000 },
  { month: 'Jun', value: 548000 },
];

const checkoutTrends = [
  { month: 'Jan', checkouts: 45, checkins: 38 },
  { month: 'Feb', checkouts: 52, checkins: 48 },
  { month: 'Mar', checkouts: 48, checkins: 44 },
  { month: 'Apr', checkouts: 61, checkins: 55 },
  { month: 'May', checkouts: 58, checkins: 52 },
  { month: 'Jun', checkouts: 65, checkins: 59 },
];

const recentActivity = [
  {
    id: 1,
    type: 'checkout',
    asset: 'MacBook Pro 16" - #AST-1247',
    user: 'Sarah Johnson',
    time: '5 minutes ago',
    location: 'Engineering - Floor 3',
  },
  {
    id: 2,
    type: 'checkin',
    asset: 'Dell Monitor 27" - #AST-0892',
    user: 'Mike Chen',
    time: '18 minutes ago',
    location: 'Marketing - Floor 2',
  },
  {
    id: 3,
    type: 'maintenance',
    asset: 'HP Printer LaserJet - #AST-0445',
    user: 'IT Support',
    time: '1 hour ago',
    location: 'IT Department',
  },
  {
    id: 4,
    type: 'checkout',
    asset: 'iPad Pro 12.9" - #AST-1556',
    user: 'Emily Davis',
    time: '2 hours ago',
    location: 'Sales - Floor 1',
  },
  {
    id: 5,
    type: 'new',
    asset: 'Surface Laptop 5 - #AST-1789',
    user: 'System Admin',
    time: '3 hours ago',
    location: 'Warehouse',
  },
];

const upcomingMaintenance = [
  { asset: 'Xerox Printer', type: 'Scheduled Maintenance', dueDate: 'Oct 28, 2025', priority: 'high' },
  { asset: 'HVAC System', type: 'Inspection', dueDate: 'Oct 30, 2025', priority: 'medium' },
  { asset: 'Conference Room AV', type: 'Calibration', dueDate: 'Nov 2, 2025', priority: 'low' },
  { asset: 'Server Rack Cooling', type: 'Service Check', dueDate: 'Nov 5, 2025', priority: 'medium' },
];

const topLocations = [
  { name: 'Engineering - Floor 3', assets: 145, utilization: 85 },
  { name: 'Sales - Floor 1', assets: 98, utilization: 72 },
  { name: 'Marketing - Floor 2', assets: 87, utilization: 68 },
  { name: 'IT Department', assets: 65, utilization: 92 },
  { name: 'Executive Suite', assets: 42, utilization: 55 },
];

export function SolarWindsDashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Asset Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Here's your asset overview.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl text-gray-900 mb-1">479</div>
          <div className="text-sm text-gray-600 mb-2">Total Assets</div>
          <div className="text-xs text-green-600">+12 this month</div>
        </Card>

        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl text-gray-900 mb-1">127</div>
          <div className="text-sm text-gray-600 mb-2">Checked Out</div>
          <div className="text-xs text-green-600">-5 from yesterday</div>
        </Card>

        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-3xl text-gray-900 mb-1">8</div>
          <div className="text-sm text-gray-600 mb-2">In Maintenance</div>
          <div className="text-xs text-yellow-600">+3 scheduled</div>
        </Card>

        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl text-gray-900 mb-1">$548K</div>
          <div className="text-sm text-gray-600 mb-2">Total Value</div>
          <div className="text-xs text-green-600">+2.4% this quarter</div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Distribution */}
        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Asset Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={assetsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {assetsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {assetsByCategory.map((item) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
                <div className="text-sm text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Asset Value Trend */}
        <Card className="p-5 bg-white border-gray-200 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-900">Total Asset Value</h3>
              <p className="text-xs text-gray-500">Last 6 months</p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              +13% Growth
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={assetValueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Check-in/Check-out Trends */}
      <Card className="p-5 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900">Check-in/Check-out Trends</h3>
            <p className="text-xs text-gray-500">Monthly activity over last 6 months</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={checkoutTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="checkouts" fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="checkins" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-5 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`mt-1 p-2 rounded-lg ${
                    activity.type === 'checkout'
                      ? 'bg-orange-100'
                      : activity.type === 'checkin'
                      ? 'bg-green-100'
                      : activity.type === 'maintenance'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                  }`}
                >
                  {activity.type === 'checkout' && <Package className="h-4 w-4 text-orange-600" />}
                  {activity.type === 'checkin' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {activity.type === 'maintenance' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  {activity.type === 'new' && <Package className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 mb-1">{activity.asset}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Maintenance & Top Locations */}
        <div className="space-y-6">
          {/* Upcoming Maintenance */}
          <Card className="p-5 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Upcoming Maintenance</h3>
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingMaintenance.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-900 mb-1">{item.asset}</div>
                    <div className="text-xs text-gray-500">{item.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{item.dueDate}</span>
                    </div>
                    <Badge
                      className={
                        item.priority === 'high'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : item.priority === 'medium'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Locations */}
          <Card className="p-5 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Top Locations</h3>
            </div>
            <div className="space-y-3">
              {topLocations.map((location, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{location.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{location.assets} assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={location.utilization} className="h-2 flex-1" />
                    <span className="text-xs text-gray-500 min-w-[3rem] text-right">
                      {location.utilization}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
