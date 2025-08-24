import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Navigation,
  Package,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const DriverDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);
  const [currentDelivery, setCurrentDelivery] = useState(null);

  // Redirect if not driver
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'driver')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || profile?.role !== 'driver') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name}! Ready to make some deliveries?
          </p>
        </div>

        {/* Driver Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">+2 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$94</div>
              <p className="text-xs text-muted-foreground">+18% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.9</div>
              <p className="text-xs text-muted-foreground">Excellent rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5h</div>
              <p className="text-xs text-muted-foreground">Active today</p>
            </CardContent>
          </Card>
        </div>

        {/* Online Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Driver Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  You are currently {isOnline ? "available for deliveries" : "not accepting deliveries"}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsOnline(!isOnline)}
              >
                {isOnline ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Delivery */}
        {currentDelivery && (
          <Card className="mb-8 border-brand-200 bg-brand-50 dark:bg-brand-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-brand-600" />
                Current Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">Order #001</h4>
                    <p className="text-sm text-muted-foreground">Pizza Palace → Customer</p>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">123 Campus Drive</span>
                    </div>
                  </div>
                  <Badge variant="default">In Transit</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Call Customer
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Available Orders</h3>
              <Badge variant="outline">{isOnline ? "5 orders nearby" : "Go online to see orders"}</Badge>
            </div>
            {isOnline ? (
              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <Card key={order} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">Order #00{order}</h4>
                            <Badge variant="secondary">Ready for pickup</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>Pickup: Pizza Palace (0.3 mi)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              <span>Delivery: 123 Campus Drive (1.2 mi)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>Est. 15 min delivery</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-brand-600">$8.50</div>
                          <p className="text-xs text-muted-foreground">Including tip</p>
                          <Button className="mt-2" size="sm">
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">You're currently offline</h3>
                  <p className="text-muted-foreground mb-4">
                    Go online to start receiving delivery requests
                  </p>
                  <Button onClick={() => setIsOnline(true)}>Go Online</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Recent Deliveries</h3>
              <Button variant="outline">View All</Button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((delivery) => (
                <Card key={delivery}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Order #00{delivery + 10}</h4>
                        <p className="text-sm text-muted-foreground">
                          Pizza Palace → 123 Campus Drive
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Completed 2 hours ago
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$8.50</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">5.0</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-4">
            <h3 className="text-xl font-semibold">Earnings Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$94.00</div>
                  <p className="text-sm text-muted-foreground">8 deliveries</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$487.50</div>
                  <p className="text-sm text-muted-foreground">42 deliveries</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$1,847.25</div>
                  <p className="text-sm text-muted-foreground">156 deliveries</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-xl font-semibold">Driver Settings</h3>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                  <CardDescription>
                    Update your vehicle details and delivery preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Truck className="h-4 w-4 mr-2" />
                    Edit Vehicle Info
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Availability Schedule</CardTitle>
                  <CardDescription>
                    Set your preferred working hours and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Edit Schedule
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your profile and account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;