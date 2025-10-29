import { useState } from 'react';
import {
  Package,
  User,
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

// API Configuration - Replace with your actual API endpoint
const API_BASE_URL = 'https://api.solarwinds.example.com/v1';

interface CheckoutFormData {
  assetId: string;
  userId: string;
  checkoutDate: string;
  dueDate: string;
  location: string;
  notes: string;
}

interface CheckinFormData {
  assetId: string;
  checkinDate: string;
  condition: string;
  notes: string;
}

interface RecentCheckout {
  id: number;
  asset: string;
  user: string;
  date: string;
  dueDate: string | null;
  location: string;
  status: string;
}

interface RecentCheckin {
  id: number;
  asset: string;
  user: string;
  checkoutDate: string;
  checkinDate: string;
  condition: string;
}

export function SolarWindsCheckout() {
  const [activeTab, setActiveTab] = useState('checkout');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [recentCheckouts, setRecentCheckouts] = useState<RecentCheckout[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([]);

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>({
    assetId: '',
    userId: '',
    checkoutDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    location: '',
    notes: '',
  });

  // Checkin Form State
  const [checkinForm, setCheckinForm] = useState<CheckinFormData>({
    assetId: '',
    checkinDate: new Date().toISOString().split('T')[0],
    condition: '',
    notes: '',
  });

  // Handle Checkout Submit
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!checkoutForm.assetId || !checkoutForm.userId || !checkoutForm.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCheckoutLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assets/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Add your auth token
        },
        body: JSON.stringify({
          asset_id: checkoutForm.assetId,
          user_id: checkoutForm.userId,
          checkout_date: checkoutForm.checkoutDate,
          due_date: checkoutForm.dueDate || null,
          location: checkoutForm.location,
          notes: checkoutForm.notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check out asset');
      }

      const data = await response.json();

      // Show success message
      toast.success('Asset checked out successfully!', {
        description: `${checkoutForm.assetId} assigned to user`,
      });

      // Reset form
      setCheckoutForm({
        assetId: '',
        userId: '',
        checkoutDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        location: '',
        notes: '',
      });

      // Refresh recent checkouts list
      fetchRecentCheckouts();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to check out asset', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Handle Checkin Submit
  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!checkinForm.assetId || !checkinForm.condition) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCheckinLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/assets/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          asset_id: checkinForm.assetId,
          checkin_date: checkinForm.checkinDate,
          condition: checkinForm.condition,
          notes: checkinForm.notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to check in asset');
      }

      const data = await response.json();

      // Show success message
      toast.success('Asset checked in successfully!', {
        description: 'Asset is now available',
      });

      // Reset form
      setCheckinForm({
        assetId: '',
        checkinDate: new Date().toISOString().split('T')[0],
        condition: '',
        notes: '',
      });

      // Refresh recent checkins list
      fetchRecentCheckins();
    } catch (error) {
      console.error('Checkin error:', error);
      toast.error('Failed to check in asset', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsCheckinLoading(false);
    }
  };

  // Fetch Recent Checkouts
  const fetchRecentCheckouts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/checkouts/recent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentCheckouts(data.checkouts || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent checkouts:', error);
    }
  };

  // Fetch Recent Checkins
  const fetchRecentCheckins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/checkins/recent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentCheckins(data.checkins || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent checkins:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1">Check In/Check Out</h1>
          <p className="text-sm text-gray-500">Manage asset lending and returns</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">127</div>
              <div className="text-sm text-gray-600">Checked Out</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">89</div>
              <div className="text-sm text-gray-600">Checked In Today</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">12</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl text-gray-900">45</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="checkout">Check Out</TabsTrigger>
          <TabsTrigger value="checkin">Check In</TabsTrigger>
        </TabsList>

        {/* Check Out Form */}
        <TabsContent value="checkout" className="space-y-6">
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Check Out Asset</h3>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">
                    Select Asset <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="asset"
                      placeholder="Search by asset name or ID..."
                      className="pl-10"
                      value={checkoutForm.assetId}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, assetId: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">
                    Assign To <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="user"
                      placeholder="Search employee name or ID..."
                      className="pl-10"
                      value={checkoutForm.userId}
                      onChange={(e) =>
                        setCheckoutForm({ ...checkoutForm, userId: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkout-date">Check Out Date</Label>
                  <Input
                    id="checkout-date"
                    type="date"
                    value={checkoutForm.checkoutDate}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, checkoutDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Expected Return Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={checkoutForm.dueDate}
                    onChange={(e) =>
                      setCheckoutForm({ ...checkoutForm, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={checkoutForm.location}
                  onValueChange={(value) =>
                    setCheckoutForm({ ...checkoutForm, location: value })
                  }
                  required
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eng-3">Engineering - Floor 3</SelectItem>
                    <SelectItem value="sales-1">Sales - Floor 1</SelectItem>
                    <SelectItem value="marketing-2">Marketing - Floor 2</SelectItem>
                    <SelectItem value="finance-4">Finance - Floor 4</SelectItem>
                    <SelectItem value="it">IT Department</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional information..."
                  rows={3}
                  value={checkoutForm.notes}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCheckoutForm({
                      assetId: '',
                      userId: '',
                      checkoutDate: new Date().toISOString().split('T')[0],
                      dueDate: '',
                      location: '',
                      notes: '',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Check Out Asset
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Checkouts */}
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Recent Check Outs</h3>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {recentCheckouts.length > 0 ? (
              <div className="space-y-3">
                {recentCheckouts.map((checkout) => (
                  <div
                    key={checkout.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">{checkout.asset}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{checkout.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{checkout.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{checkout.date}</span>
                        </div>
                      </div>
                    </div>
                    {checkout.dueDate && (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">
                        Due: {checkout.dueDate}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent checkouts
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Check In Form */}
        <TabsContent value="checkin" className="space-y-6">
          <Card className="p-6 bg-white border-gray-200">
            <h3 className="text-lg text-gray-900 mb-4">Check In Asset</h3>
            <form onSubmit={handleCheckin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="asset-checkin">
                  Select Asset to Check In <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="asset-checkin"
                    placeholder="Search by asset name or ID..."
                    className="pl-10"
                    value={checkinForm.assetId}
                    onChange={(e) =>
                      setCheckinForm({ ...checkinForm, assetId: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkin-date">Check In Date</Label>
                <Input
                  id="checkin-date"
                  type="date"
                  value={checkinForm.checkinDate}
                  onChange={(e) =>
                    setCheckinForm({ ...checkinForm, checkinDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">
                  Asset Condition <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={checkinForm.condition}
                  onValueChange={(value) =>
                    setCheckinForm({ ...checkinForm, condition: value })
                  }
                  required
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - Like New</SelectItem>
                    <SelectItem value="good">Good - Normal Wear</SelectItem>
                    <SelectItem value="fair">Fair - Visible Wear</SelectItem>
                    <SelectItem value="poor">Poor - Needs Repair</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkin-notes">Inspection Notes</Label>
                <Textarea
                  id="checkin-notes"
                  placeholder="Document any damage, issues, or observations..."
                  rows={4}
                  value={checkinForm.notes}
                  onChange={(e) =>
                    setCheckinForm({ ...checkinForm, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="p-2 bg-blue-100 rounded">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-900">
                  Asset will be marked as available after check-in
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setCheckinForm({
                      assetId: '',
                      checkinDate: new Date().toISOString().split('T')[0],
                      condition: '',
                      notes: '',
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isCheckinLoading}
                >
                  {isCheckinLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check In Asset
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Recent Check-ins */}
          <Card className="p-6 bg-white border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Recent Check Ins</h3>
              <Button variant="ghost" size="sm" className="text-orange-600">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            {recentCheckins.length > 0 ? (
              <div className="space-y-3">
                {recentCheckins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-gray-900 mb-1">{checkin.asset}</div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{checkin.user}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Out: {checkin.checkoutDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>In: {checkin.checkinDate}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        checkin.condition === 'good'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : checkin.condition === 'excellent'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }
                    >
                      {checkin.condition}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent check-ins
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
