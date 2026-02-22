import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyVendor, useVendorOrders, useVendorMenuItems, useUpdateOrderStatus, useAddMenuItem, useUpdateMenuItem } from '@/hooks/useVendorOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Store, DollarSign, Clock, Package, Plus, Settings, CheckCircle, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const VendorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { data: vendor } = useMyVendor();
  const { data: orders } = useVendorOrders(vendor?.id || '');
  const { data: menuItems } = useVendorMenuItems(vendor?.id || '');
  const updateStatus = useUpdateOrderStatus();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();

  const [isOpen, setIsOpen] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '', image_url: '' });

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'vendor')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!user || profile?.role !== 'vendor') return null;

  const todayOrders = orders?.filter(o => {
    const d = new Date(o.created_at!);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }) || [];

  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)) || [];

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus });
      toast.success(`Order updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update order');
    }
  };

  const handleAddItem = async () => {
    if (!vendor || !newItem.name || !newItem.price) { toast.error('Name and price are required'); return; }
    try {
      await addMenuItem.mutateAsync({
        vendor_id: vendor.id,
        name: newItem.name,
        description: newItem.description || undefined,
        price: parseFloat(newItem.price),
        category: newItem.category || undefined,
        image_url: newItem.image_url || undefined,
      });
      setShowAddItem(false);
      setNewItem({ name: '', description: '', price: '', category: '', image_url: '' });
      toast.success('Menu item added!');
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleToggleAvailability = async (itemId: string, available: boolean) => {
    try {
      await updateMenuItem.mutateAsync({ id: itemId, is_available: available });
      toast.success(available ? 'Item is now available' : 'Item marked unavailable');
    } catch {
      toast.error('Failed to update item');
    }
  };

  const getNextStatus = (status: string) => {
    const flow: Record<string, string> = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready' };
    return flow[status];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { pending: 'Confirm', confirmed: 'Start Preparing', preparing: 'Mark Ready' };
    return labels[status] || status;
  };

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 max-w-2xl mx-auto text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Restaurant Found</h2>
          <p className="text-muted-foreground mb-6">You don't have a restaurant registered yet. Contact an admin to set up your restaurant profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-muted-foreground">Manage your restaurant operations</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{todayOrders.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">R{todayRevenue.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingOrders.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{menuItems?.length || 0}</div></CardContent>
          </Card>
        </div>

        {/* Restaurant Status */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
                <span className="text-sm text-muted-foreground">{isOpen ? "Accepting orders" : "Not accepting orders"}</span>
              </div>
              <Button variant="outline" onClick={() => setIsOpen(!isOpen)}>{isOpen ? "Close" : "Open"} Restaurant</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="menu">Menu ({menuItems?.length || 0})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {pendingOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No pending orders right now.</div>
            ) : (
              pendingOrders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">Order #{order.order_number}</h4>
                        <p className="text-sm text-muted-foreground">{order.customer_name} • {format(new Date(order.created_at!), 'HH:mm')}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="capitalize">{order.status}</Badge>
                        <p className="text-sm font-semibold mt-1">R{Number(order.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 mb-3">
                      {(order as any).order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.menu_items?.name}</span>
                          <span>R{Number(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {order.delivery_instructions && (
                      <p className="text-sm text-muted-foreground mb-3">📝 {order.delivery_instructions}</p>
                    )}
                    <div className="flex gap-2">
                      {getNextStatus(order.status) && (
                        <Button size="sm" onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}>
                          <CheckCircle className="h-4 w-4 mr-1" />{getStatusLabel(order.status)}
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(order.id, 'cancelled')}>Cancel</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Menu Management</h3>
              <Button onClick={() => setShowAddItem(true)}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems?.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-md mb-3" />}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge variant={item.is_available ? "default" : "secondary"}>{item.is_available ? 'Available' : 'Unavailable'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">R{Number(item.price).toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`avail-${item.id}`} className="text-xs">Available</Label>
                        <Switch
                          id={`avail-${item.id}`}
                          checked={item.is_available ?? true}
                          onCheckedChange={v => handleToggleAvailability(item.id, v)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No completed orders yet.</div>
            ) : (
              orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)).map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Order #{order.order_number}</h4>
                        <p className="text-sm text-muted-foreground">{order.customer_name} • {format(new Date(order.created_at!), 'PP')}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === 'delivered' ? 'default' : 'destructive'} className="capitalize">{order.status}</Badge>
                        <p className="font-semibold">R{Number(order.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Menu Item</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Name *</Label><Input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Description</Label><Textarea value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (R) *</Label><Input type="number" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} /></div>
              <div><Label>Category</Label><Input value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} /></div>
            </div>
            <div><Label>Image URL</Label><Input value={newItem.image_url} onChange={e => setNewItem(p => ({ ...p, image_url: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={addMenuItem.isPending}>{addMenuItem.isPending ? 'Adding...' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;
