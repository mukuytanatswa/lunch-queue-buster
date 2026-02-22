import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDriverProfile, useUpdateDriverStatus, useUnassignedReadyOrders, useDriverAssignedOrders, useAssignDriverToOrder, useUpdateDriverLocation } from '@/hooks/useDrivers';
import { useUpdateOrderStatus, useSetProofOfDelivery } from '@/hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Navigation,
  Package,
  CheckCircle,
  AlertCircle,
  Settings,
  Phone,
  MessageSquare,
  Camera,
  Filter,
  Target,
  Shield,
  Zap,
  Route,
  Timer,
  Activity,
  PiggyBank,
  User,
  Car,
  Bike,
  KeyRound
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast: toastUi } = useToast();
  const { data: driverProfile } = useDriverProfile(user?.id);
  const updateDriverStatus = useUpdateDriverStatus(user?.id);
  const { data: availableOrders } = useUnassignedReadyOrders();
  const { data: myOrders } = useDriverAssignedOrders(user?.id);
  const assignDriver = useAssignDriverToOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const setProofOfDelivery = useSetProofOfDelivery();
  const updateLocation = useUpdateDriverLocation(user?.id);

  const isOnline = !!driverProfile?.is_online;
  const currentDelivery = myOrders?.[0]; // First active order
  const [deliveryPinInput, setDeliveryPinInput] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'driver')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const handleGoOnline = async () => {
    try {
      await updateDriverStatus.mutateAsync(true);
      toastUi({ title: "You're now online!", description: "You'll start receiving delivery requests." });
    } catch {
      toast.error('Failed to go online');
    }
  };

  const handleGoOffline = async () => {
    try {
      await updateDriverStatus.mutateAsync(false);
      toastUi({ title: "You're now offline", description: "You won't receive new delivery requests." });
    } catch {
      toast.error('Failed to go offline');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await assignDriver.mutateAsync({ orderId, driverId: user!.id });
      toast.success('Order accepted! Head to the vendor.');
    } catch {
      toast.error('Failed to accept order');
    }
  };

  const handlePickedUp = async () => {
    if (!currentDelivery) return;
    try {
      await updateOrderStatus.mutateAsync({ orderId: currentDelivery.id, status: 'picked_up' });
      toast.success('Order picked up. Head to customer.');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCompleteDelivery = async () => {
    if (!currentDelivery) return;
    const pin = (currentDelivery as any).delivery_pin;
    if (pin && deliveryPinInput !== pin) {
      toast.error('Delivery PIN does not match. Ask customer for the correct PIN.');
      return;
    }
    try {
      if (proofPhotoUrl) {
        await setProofOfDelivery.mutateAsync({ orderId: currentDelivery.id, photoUrl: proofPhotoUrl });
      } else {
        await updateOrderStatus.mutateAsync({ orderId: currentDelivery.id, status: 'delivered' });
      }
      toast.success('Delivery completed!');
      setDeliveryPinInput('');
      setProofPhotoUrl('');
    } catch {
      toast.error('Failed to complete delivery');
    }
  };

  const getStatusDisplay = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready for pickup',
      picked_up: 'Out for delivery',
      delivered: 'Delivered',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      ready: 'bg-indigo-100 text-indigo-800',
      picked_up: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const driverStats = {
    todayDeliveries: myOrders?.filter((o: any) => o.status === 'delivered').length ?? 0,
    todayHours: '–',
    rating: Number(driverProfile?.rating) || 4.8,
    acceptanceRate: 85,
    completionRate: 98,
    onTimeRate: 92,
    totalDeliveries: Number(driverProfile?.total_deliveries) || 0,
  };
  const todayEarnings = { total: Number(driverProfile?.total_earnings) || 0 };
  const filters = { maxDistance: '5km', minPayout: 'R5+', deliveryType: 'all' };
  const setFilters = () => {};

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
            Welcome back, {profile?.first_name}! Ready to earn some money today?
          </p>
        </div>

        {/* Status Control Panel */}
        <Card className="mb-8 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6" />
              Driver Status Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Online/Offline Toggle */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
                  isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
                <Button 
                  className="mt-3 w-full" 
                  size="lg"
                  variant={isOnline ? "destructive" : "default"}
                  onClick={isOnline ? handleGoOffline : handleGoOnline}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </Button>
              </div>
              
              {/* Current Location */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Location</div>
                <div className="font-semibold text-lg">{currentLocation}</div>
                <Badge variant="outline" className="mt-2">
                  {isOnline ? 'Available for deliveries' : 'Not accepting orders'}
                </Badge>
              </div>
              
              {/* Today's Earnings */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Today's Earnings</div>
                <div className="text-2xl font-bold text-green-600">R{todayEarnings.total.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">{driverStats.todayDeliveries} deliveries</div>
              </div>
              
              {/* Online Time */}
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Online Time Today</div>
                <div className="text-xl font-bold">{driverStats.todayHours}</div>
                <div className="text-sm text-muted-foreground">Active time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{driverStats.todayDeliveries}</div>
              <div className="text-sm text-muted-foreground">Deliveries Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{driverStats.rating}</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{driverStats.acceptanceRate}%</div>
              <div className="text-sm text-muted-foreground">Acceptance Rate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{driverStats.onTimeRate}%</div>
              <div className="text-sm text-muted-foreground">On-Time Rate</div>
            </CardContent>
          </Card>
        </div>


        {/* Current Delivery - real order from myOrders */}
        {currentDelivery && (currentDelivery as any).status !== 'delivered' && (
          <Card className="mb-8 border-primary border-2 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Navigation className="h-6 w-6 text-primary" />
                  Active Delivery – Order #{(currentDelivery as any).order_number}
                </CardTitle>
                <Badge className={getStatusColor((currentDelivery as any).status)}>
                  {getStatusDisplay((currentDelivery as any).status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Order Details</h4>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {(currentDelivery as any).order_items?.map((item: any) => (
                          <div key={item.id}>{item.quantity}x {item.menu_items?.name}</div>
                        ))}
                      </div>
                      <div className="font-semibold">Total: R{Number((currentDelivery as any).total_amount).toFixed(2)}</div>
                      <div className="text-green-600 font-semibold">Your fee: R{Number((currentDelivery as any).delivery_fee).toFixed(2)}</div>
                      {(currentDelivery as any).delivery_pin && (
                        <div className="flex items-center gap-2 text-sm">
                          <KeyRound className="h-4 w-4" /> Customer PIN: <span className="font-mono font-semibold">{(currentDelivery as any).delivery_pin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-3">Locations</h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="font-medium">📍 Pickup</div>
                        <div className="text-sm">{(currentDelivery as any).vendors?.name}</div>
                        <div className="text-sm text-muted-foreground">{(currentDelivery as any).vendors?.location}</div>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="font-medium">🏠 Delivery</div>
                        <div className="text-sm">{(currentDelivery as any).customer_name}</div>
                        <div className="text-sm text-muted-foreground">{(currentDelivery as any).delivery_address}</div>
                        <div className="text-sm text-blue-600">{(currentDelivery as any).customer_phone}</div>
                        {(currentDelivery as any).delivery_instructions && (
                          <div className="text-sm text-orange-600 mt-1">📝 {(currentDelivery as any).delivery_instructions}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button size="lg" className="flex items-center gap-2" asChild>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent((currentDelivery as any).delivery_address)}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4" />Navigate
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center gap-2" asChild>
                    <a href={`tel:${(currentDelivery as any).customer_phone}`}><Phone className="h-4 w-4" />Call Customer</a>
                  </Button>
                  <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={() => {
                    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        updateLocation.mutateAsync({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        toast.success('Location shared with customer');
                      },
                      () => toast.error('Could not get location')
                    );
                  }} disabled={updateLocation.isPending}>
                    <MapPin className="h-4 w-4" />Share my location
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">Update Status</h5>
                  <div className="flex flex-wrap gap-2">
                    {['confirmed', 'ready'].includes((currentDelivery as any).status) && (
                      <Button onClick={handlePickedUp} disabled={updateOrderStatus.isPending}>📦 Order Picked Up – Heading to customer</Button>
                    )}
                    {(currentDelivery as any).status === 'picked_up' && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Label>Delivery PIN (from customer)</Label>
                          <Input type="text" placeholder="4-digit PIN" value={deliveryPinInput} onChange={e => setDeliveryPinInput(e.target.value)} className="w-24 font-mono" />
                        </div>
                        <Input placeholder="Proof of delivery photo URL (optional)" value={proofPhotoUrl} onChange={e => setProofPhotoUrl(e.target.value)} />
                        <Button onClick={handleCompleteDelivery} className="bg-green-600 hover:bg-green-700" disabled={updateOrderStatus.isPending}>
                          ✅ Complete delivery
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {/* Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Delivery Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="distance">Max Distance</Label>
                    <Select value={filters.maxDistance} onValueChange={(value) => setFilters(prev => ({...prev, maxDistance: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1km">Within 1km</SelectItem>
                        <SelectItem value="2km">Within 2km</SelectItem>
                        <SelectItem value="5km">Within 5km</SelectItem>
                        <SelectItem value="all">Any distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="payout">Minimum Payout</Label>
                    <Select value={filters.minPayout} onValueChange={(value) => setFilters(prev => ({...prev, minPayout: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R5+">R5+</SelectItem>
                        <SelectItem value="R10+">R10+</SelectItem>
                        <SelectItem value="R15+">R15+</SelectItem>
                        <SelectItem value="R20+">R20+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Delivery Type</Label>
                    <Select value={filters.deliveryType} onValueChange={(value) => setFilters(prev => ({...prev, deliveryType: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All orders</SelectItem>
                        <SelectItem value="food">Food only</SelectItem>
                        <SelectItem value="drinks">Drinks included</SelectItem>
                        <SelectItem value="large">Large orders</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Available Deliveries</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {isOnline ? `${availableOrders?.length ?? 0} orders nearby` : "Go online to see orders"}
              </Badge>
            </div>
            
            {isOnline ? (
              <div className="space-y-4">
                {!availableOrders?.length && <p className="text-muted-foreground">No orders available right now. Orders appear when vendors mark them ready.</p>}
                {availableOrders?.map((order: any) => (
                  <Card key={order.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-bold text-lg">{order.vendors?.name}</h4>
                            <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span><strong>Pickup:</strong> {order.vendors?.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-blue-600" />
                                <span><strong>Delivery:</strong> {order.delivery_address}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center lg:text-right space-y-3">
                          <div>
                            <div className="text-3xl font-bold text-green-600">R{Number(order.delivery_fee).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">Order: R{Number(order.total_amount).toFixed(2)}</div>
                          </div>
                          <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3" onClick={() => handleAcceptOrder(order.id)} disabled={assignDriver.isPending}>
                            Accept Delivery
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="mb-6">
                      <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-10 w-10 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">You're currently offline</h3>
                    <p className="text-muted-foreground mb-6 text-lg">
                      Go online to start receiving delivery requests and earn money!
                    </p>
                    <Button size="lg" onClick={handleGoOnline} className="text-lg px-8 py-3">
                      <Zap className="h-5 w-5 mr-2" />
                      Go Online Now
                    </Button>
                  </div>
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
                        <div className="font-semibold">R8.50</div>
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

          <TabsContent value="earnings" className="space-y-6">
            <h3 className="text-2xl font-bold">Earnings Dashboard</h3>
            
            {/* Today's Earnings Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Today's Earnings Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Base Fees</div>
                    <div className="text-xl font-bold text-blue-600">R{todayEarnings.baseFees.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Distance Bonuses</div>
                    <div className="text-xl font-bold text-purple-600">R{todayEarnings.distanceBonuses.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Tips Received</div>
                    <div className="text-xl font-bold text-green-600">R{todayEarnings.tips.toFixed(2)}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Peak Hour Bonuses</div>
                    <div className="text-xl font-bold text-orange-600">R{todayEarnings.peakHourBonuses.toFixed(2)}</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Total Today</div>
                  <div className="text-4xl font-bold text-green-600">R{todayEarnings.total.toFixed(2)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly & Monthly Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Today</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600">R{todayEarnings.total.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">{driverStats.todayDeliveries} deliveries</p>
                  <p className="text-xs text-muted-foreground">{driverStats.todayHours} online</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">This Week</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-blue-600">R487.50</div>
                  <p className="text-sm text-muted-foreground">42 deliveries</p>
                  <p className="text-xs text-muted-foreground">28h 15min online</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">This Month</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600">R1,847.25</div>
                  <p className="text-sm text-muted-foreground">156 deliveries</p>
                  <p className="text-xs text-muted-foreground">96h 45min online</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { time: '2:45 PM', restaurant: 'UCT Cafeteria', earnings: 8.50, rating: 5.0 },
                    { time: '1:20 PM', restaurant: 'Pizza Perfect', earnings: 12.00, rating: 4.8 },
                    { time: '12:05 PM', restaurant: 'Healthy Bites', earnings: 15.00, rating: 5.0 },
                    { time: '11:30 AM', restaurant: 'Coffee Corner', earnings: 6.50, rating: 4.9 }
                  ].map((delivery, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{delivery.restaurant}</div>
                        <div className="text-sm text-muted-foreground">{delivery.time}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">R{delivery.earnings.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{delivery.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <h3 className="text-2xl font-bold">Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-blue-600">{driverStats.acceptanceRate}%</div>
                  <div className="text-sm text-muted-foreground">Acceptance Rate</div>
                  <Badge variant="outline" className="mt-2">Excellent</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-green-600">{driverStats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                  <Badge variant="outline" className="mt-2">Outstanding</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Timer className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-purple-600">{driverStats.onTimeRate}%</div>
                  <div className="text-sm text-muted-foreground">On-Time Rate</div>
                  <Badge variant="outline" className="mt-2">Great</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-yellow-600">{driverStats.rating}</div>
                  <div className="text-sm text-muted-foreground">Customer Rating</div>
                  <Badge variant="outline" className="mt-2">Superb</Badge>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Career Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{driverStats.totalDeliveries}</div>
                    <div className="text-sm text-muted-foreground">Total Deliveries Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600">R2,847</div>
                    <div className="text-sm text-muted-foreground">Total Earnings This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600">156h</div>
                    <div className="text-sm text-muted-foreground">Total Hours This Month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <h3 className="text-2xl font-bold">Driver Settings</h3>
            
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
                <CardDescription>
                  Update your vehicle details and delivery preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select defaultValue="bicycle">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bicycle">
                          <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Bicycle
                          </div>
                        </SelectItem>
                        <SelectItem value="scooter">
                          <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Scooter
                          </div>
                        </SelectItem>
                        <SelectItem value="car">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Car
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input id="licensePlate" placeholder="CA 123-456" />
                  </div>
                </div>
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Upload Vehicle Photo
                </Button>
              </CardContent>
            </Card>

            {/* Availability Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability Settings
                </CardTitle>
                <CardDescription>
                  Set your working hours and delivery preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxDistance">Maximum Delivery Distance</Label>
                    <Select defaultValue="5km">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2km">Up to 2km</SelectItem>
                        <SelectItem value="5km">Up to 5km</SelectItem>
                        <SelectItem value="10km">Up to 10km</SelectItem>
                        <SelectItem value="unlimited">No limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workingAreas">Available Zones</Label>
                    <Select defaultValue="uct">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uct">UCT Campus Only</SelectItem>
                        <SelectItem value="uct-rondebosch">UCT + Rondebosch</SelectItem>
                        <SelectItem value="all-areas">All Areas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="breakMode" />
                  <Label htmlFor="breakMode">Break Mode (Temporarily unavailable)</Label>
                </div>
              </CardContent>
            </Card>

            {/* Banking & Payments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="h-5 w-5" />
                  Banking & Payments
                </CardTitle>
                <CardDescription>
                  Manage your payout settings and banking details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccount">Bank Account Number</Label>
                    <Input id="bankAccount" placeholder="1234567890" type="password" />
                  </div>
                  <div>
                    <Label htmlFor="payoutSchedule">Payout Schedule</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline">View Payment History</Button>
              </CardContent>
            </Card>

            {/* Emergency & Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency & Support
                </CardTitle>
                <CardDescription>
                  Emergency contacts and safety features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-12">
                    <Phone className="h-4 w-4 mr-2" />
                    Campus Security: 021-650-2222
                  </Button>
                  <Button variant="outline" className="h-12">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    QuickBite Support
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="shareLocation" defaultChecked />
                  <Label htmlFor="shareLocation">Share live location with emergency contact</Label>
                </div>
                <Button variant="destructive" className="w-full">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Emergency
                </Button>
              </CardContent>
            </Card>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={profile?.first_name || ''} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={profile?.last_name || ''} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={profile?.phone || ''} />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input id="emergencyContact" placeholder="Emergency contact number" />
                  </div>
                </div>
                <Button>Save Profile Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;