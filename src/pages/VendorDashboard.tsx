import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendorByUser } from '@/hooks/useVendorByUser';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { usePromotionsByVendor, useCreatePromotion } from '@/hooks/usePromotions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Users, DollarSign, Clock, Package, Plus, Settings, Tag, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusFlow: Record<string, string | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
  picked_up: null,
  delivered: null,
  cancelled: null,
};

const VendorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const { data: vendor } = useVendorByUser(user?.id);
  const { data: vendorOrders, isLoading: ordersLoading } = useVendorOrders(vendor?.id);
  const updateStatus = useUpdateOrderStatus();
  const { data: promotions } = usePromotionsByVendor(vendor?.id);
  const createPromotion = useCreatePromotion(vendor?.id || '');
  const { data: payouts } = useVendorPayouts(vendor?.id);
  const [promoCode, setPromoCode] = useState('');
  const [promoType, setPromoType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [promoValue, setPromoValue] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'vendor')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const todayOrders = vendorOrders?.filter(o => {
    const d = new Date(o.created_at!);
    const today = new Date();
    return d.toDateString() === today.toDateString() && o.status !== 'cancelled';
  }) || [];
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  const handleNextStatus = async (orderId: string, current: string) => {
    const next = statusFlow[current];
    if (!next) return;
    try {
      await updateStatus.mutateAsync({ orderId, status: next });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || profile?.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.first_name}! Manage your restaurant operations.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayOrders.length}</div>
              <p className="text-xs text-muted-foreground">Order tracking below</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{todayRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {todayOrders.length} orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendorOrders?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promotions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotions?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active offers</p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={isOpen ? "default" : "secondary"}>
                  {isOpen ? "Open" : "Closed"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Your restaurant is currently {isOpen ? "accepting orders" : "closed for orders"}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Order tracking</h3>
            </div>
            <p className="text-sm text-muted-foreground">Track and update status for each order. Customers see live updates.</p>
            {ordersLoading && <div className="animate-pulse h-32 rounded-lg bg-muted" />}
            {!ordersLoading && (!vendorOrders || vendorOrders.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">No orders yet. Orders will appear here when customers place them.</div>
            )}
            <div className="space-y-4">
              {vendorOrders?.map((order: any) => {
                const nextStatus = statusFlow[order.status];
                const itemsList = order.order_items?.map((i: any) => `${i.quantity}x ${i.menu_items?.name || 'Item'}`).join(', ') || '';
                return (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <h4 className="font-semibold">Order #{order.order_number}</h4>
                          <p className="text-sm text-muted-foreground">{order.customer_name} • {order.order_items?.length || 0} items</p>
                          <p className="text-sm">{itemsList}</p>
                          <p className="text-xs text-muted-foreground mt-1">{format(new Date(order.created_at), 'PPp')}{order.scheduled_for ? ` • Scheduled: ${format(new Date(order.scheduled_for), 'PPp')}` : ''}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge variant="secondary">{order.status}</Badge>
                          <p className="text-sm font-semibold">R{Number(order.total_amount).toFixed(2)}</p>
                          {nextStatus && (
                            <Button size="sm" onClick={() => handleNextStatus(order.id, order.status)} disabled={updateStatus.isPending}>
                              Mark {nextStatus === 'confirmed' ? 'Confirmed' : nextStatus === 'preparing' ? 'Preparing' : nextStatus === 'ready' ? 'Ready for pickup' : 'Picked up'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="promotions" className="space-y-4">
            <h3 className="text-xl font-semibold">Promotion creation tool</h3>
            <p className="text-sm text-muted-foreground">Create discounts and time-limited offers for customers.</p>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" />New promotion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Code (optional)</Label>
                    <Input placeholder="e.g. LUNCH20" value={promoCode} onChange={e => setPromoCode(e.target.value)} />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <select className="w-full rounded-md border px-3 py-2" value={promoType} onChange={e => setPromoType(e.target.value as 'percentage' | 'fixed_amount')}>
                      <option value="percentage">Percentage off</option>
                      <option value="fixed_amount">Fixed amount off</option>
                    </select>
                  </div>
                  <div>
                    <Label>Value {promoType === 'percentage' ? '(%)' : '(R)'}</Label>
                    <Input type="number" placeholder={promoType === 'percentage' ? '20' : '15'} value={promoValue} onChange={e => setPromoValue(e.target.value)} />
                  </div>
                  <div>
                    <Label>Valid until</Label>
                    <Input type="datetime-local" value={promoValidUntil} onChange={e => setPromoValidUntil(e.target.value)} />
                  </div>
                </div>
                <Button onClick={async () => {
                  if (!promoValue || !promoValidUntil) { toast.error('Value and valid until required'); return; }
                  try {
                    await createPromotion.mutateAsync({ code: promoCode || undefined, type: promoType, value: Number(promoValue), valid_until: new Date(promoValidUntil).toISOString() });
                    toast.success('Promotion created');
                    setPromoCode(''); setPromoValue(''); setPromoValidUntil('');
                  } catch { toast.error('Failed to create'); }
                }} disabled={createPromotion.isPending}>Create promotion</Button>
              </CardContent>
            </Card>
            <div>
              <h4 className="font-medium mb-2">Active promotions</h4>
              {promotions?.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
              <ul className="space-y-2">
                {promotions?.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center border rounded p-2">
                    <span>{p.code || 'No code'} – {p.type === 'percentage' ? `${p.value}%` : `R${p.value}`} off until {format(new Date(p.valid_until), 'PP')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Menu Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Burger Deluxe</h4>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Juicy beef patty with fresh vegetables
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">$12.99</span>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h3 className="text-xl font-semibold">Analytics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$2,847</div>
                  <p className="text-sm text-muted-foreground">+15% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Burger Deluxe</span>
                    <span className="font-semibold">47 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pizza Margherita</span>
                    <span className="font-semibold">32 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Caesar Salad</span>
                    <span className="font-semibold">28 orders</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h3 className="text-xl font-semibold">Restaurant Settings</h3>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout system</CardTitle>
                  <CardDescription>
                    Earnings are automatically transferred to your registered bank account. Payouts run weekly for completed orders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payouts?.length === 0 && <p className="text-sm text-muted-foreground">No payouts yet. Complete orders to accumulate earnings.</p>}
                    <ul className="text-sm space-y-1">
                      {payouts?.slice(0, 5).map((p: any) => (
                        <li key={p.id} className="flex justify-between">
                          <span>R{Number(p.amount).toFixed(2)} – {p.status}</span>
                          <span className="text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : 'Pending'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                  <CardDescription>
                    Update your restaurant details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Information
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Operating Hours</CardTitle>
                  <CardDescription>
                    Set your restaurant&apos;s operating hours and availability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Edit Hours
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

export default VendorDashboard;