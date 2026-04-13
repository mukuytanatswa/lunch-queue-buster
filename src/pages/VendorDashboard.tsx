import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVendorByUser } from '@/hooks/useVendorByUser';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { useVendorPayouts } from '@/hooks/useVendorPayouts';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { usePromotionsByVendor, useCreatePromotion } from '@/hooks/usePromotions';
import { useAllMenuItems, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from '@/hooks/useVendors';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Store, Users, DollarSign, Clock, Package, Plus, Settings, Tag, Pencil, Trash2, EyeOff, Eye, KeyRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function playOrderSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available, silently skip
  }
}

const statusFlow: Record<string, string | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
  cancelled: null,
};

const VendorDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const queryClient = useQueryClient();
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

  // Menu management state
  const { data: menuItems, isLoading: menuLoading } = useAllMenuItems(vendor?.id);
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<null | { id: string; vendor_id: string; name: string; price: number; description: string; category: string; image_url: string; is_available: boolean }>(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '', category: '', image_url: '', is_available: true });

  // Password setup (for invited vendors who haven't set a password yet)
  const needsPasswordSetup = profile?.needs_password_setup === true;
  const [setupPassword, setSetupPassword] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  const handleSetupPassword = async () => {
    if (!setupPassword || setupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSetupLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: setupPassword,
      data: { needs_password_setup: false },
    });
    setSetupLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      await supabase.from('profiles').update({ needs_password_setup: false }).eq('user_id', user!.id);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Password set! You can now sign in with your email and password.');
      setSetupPassword('');
    }
  };

  // Settings dialogs
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: '', description: '', location: '', phone_number: '', email: '', cuisine_type: '' });
  const [hoursForm, setHoursForm] = useState({ delivery_time_min: '', delivery_time_max: '' });

  const updateVendorInfo = useMutation({
    mutationFn: async (updates: { name: string; description: string; location: string; phone_number: string; email: string; cuisine_type: string }) => {
      const { error } = await supabase.from('vendors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vendor!.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendor_by_user'] }); toast.success('Restaurant info updated'); setInfoDialogOpen(false); },
    onError: () => toast.error('Failed to update info'),
  });

  const updateVendorHours = useMutation({
    mutationFn: async (updates: { delivery_time_min: number; delivery_time_max: number }) => {
      const { error } = await supabase.from('vendors').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', vendor!.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendor_by_user'] }); toast.success('Operating hours updated'); setHoursDialogOpen(false); },
    onError: () => toast.error('Failed to update hours'),
  });

  const openInfoDialog = () => {
    setInfoForm({
      name: vendor?.name ?? '',
      description: vendor?.description ?? '',
      location: vendor?.location ?? '',
      phone_number: vendor?.phone_number ?? '',
      email: vendor?.email ?? '',
      cuisine_type: vendor?.cuisine_type ?? '',
    });
    setInfoDialogOpen(true);
  };

  const openHoursDialog = () => {
    setHoursForm({
      delivery_time_min: String(vendor?.delivery_time_min ?? ''),
      delivery_time_max: String(vendor?.delivery_time_max ?? ''),
    });
    setHoursDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setMenuForm({ name: '', price: '', description: '', category: '', image_url: '', is_available: true });
    setMenuDialogOpen(true);
  };

  const openEditDialog = (item: typeof editingItem) => {
    setEditingItem(item);
    setMenuForm({
      name: item!.name,
      price: String(item!.price),
      description: item!.description || '',
      category: item!.category || '',
      image_url: item!.image_url || '',
      is_available: item!.is_available ?? true,
    });
    setMenuDialogOpen(true);
  };

  const handleMenuSave = async () => {
    if (!menuForm.name.trim() || !menuForm.price) { toast.error('Name and price are required'); return; }
    const price = parseFloat(menuForm.price);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    try {
      if (editingItem) {
        await updateMenuItem.mutateAsync({ id: editingItem.id, vendor_id: editingItem.vendor_id, name: menuForm.name.trim(), price, description: menuForm.description, category: menuForm.category, image_url: menuForm.image_url, is_available: menuForm.is_available });
        toast.success('Item updated');
      } else {
        await createMenuItem.mutateAsync({ vendor_id: vendor!.id, name: menuForm.name.trim(), price, description: menuForm.description, category: menuForm.category, image_url: menuForm.image_url || undefined, is_available: menuForm.is_available });
        toast.success('Item added');
      }
      setMenuDialogOpen(false);
    } catch (err: any) {
      console.error('Menu save error:', err);
      toast.error(err?.message || err?.details || err?.hint || JSON.stringify(err) || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string, vendorId: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem.mutateAsync({ id, vendor_id: vendorId });
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete item'); }
  };

  const handleToggleAvailability = async (item: { id: string; vendor_id: string; is_available: boolean | null }) => {
    try {
      await updateMenuItem.mutateAsync({ id: item.id, vendor_id: item.vendor_id, is_available: !item.is_available });
    } catch { toast.error('Failed to update availability'); }
  };

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'vendor')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  // Register service worker and subscribe to push notifications
  useEffect(() => {
    if (!vendor?.id) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const registerAndSubscribe = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) return;

        const existing = await reg.pushManager.getSubscription();
        const subscription = existing ?? await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        await supabase.from('push_subscriptions').upsert({
          vendor_id: vendor.id,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
        }, { onConflict: 'endpoint' });
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    };

    registerAndSubscribe();
  }, [vendor?.id]);

  // Live updates: when a student places an order for this vendor, refresh the orders list
  useEffect(() => {
    if (!vendor?.id) return;
    const channel = supabase
      .channel(`vendor-orders:${vendor.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `vendor_id=eq.${vendor.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['vendor_orders', vendor.id] });
        // Only alert immediately for cash orders — card orders alert on payment confirmation
        if (payload.new?.payment_method === 'cash') {
          playOrderSound();
          const amount = payload.new?.total_amount ? `R${Number(payload.new.total_amount).toFixed(2)}` : '';
          toast('New order received!', {
            description: amount ? `Order total: ${amount}. Check your Orders tab.` : 'Check your Orders tab.',
            duration: Infinity,
            action: { label: 'Dismiss', onClick: () => {} },
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `vendor_id=eq.${vendor.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['vendor_orders', vendor.id] });
        // Alert when a card payment is confirmed
        const justPaid = payload.new?.payment_status === 'paid' && payload.old?.payment_status !== 'paid';
        if (justPaid) {
          playOrderSound();
          const amount = payload.new?.total_amount ? `R${Number(payload.new.total_amount).toFixed(2)}` : '';
          toast('Payment confirmed! New order received!', {
            description: amount ? `Order total: ${amount}. Check your Orders tab.` : 'Check your Orders tab.',
            duration: Infinity,
            action: { label: 'Dismiss', onClick: () => {} },
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [vendor?.id, queryClient]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Blocking dialog for invited vendors who haven't set a password yet */}
      <Dialog open={needsPasswordSetup}>
        <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Set your password
            </DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              You need to set a password before you can use your account. You'll use this to sign in next time.
            </p>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="relative">
              <Input
                type={showSetupPassword ? 'text' : 'password'}
                placeholder="Choose a password (min. 6 characters)"
                value={setupPassword}
                onChange={e => setSetupPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetupPassword()}
              />
              <button
                type="button"
                onClick={() => setShowSetupPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSetupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSetupPassword} disabled={setupLoading} className="w-full">
              {setupLoading && <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              Set Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{vendor?.name ?? 'Your Restaurant'}</h1>
          <p className="text-muted-foreground">Manage your restaurant operations</p>
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
              {[...(vendorOrders || [])].sort((a: any, b: any) => {
                if (a.scheduled_for && !b.scheduled_for) return -1;
                if (!a.scheduled_for && b.scheduled_for) return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              }).map((order: any) => {
                const nextStatus = statusFlow[order.status];
                const itemsList = order.order_items?.map((i: any) => `${i.quantity}x ${i.menu_items?.name || 'Item'}`).join(', ') || '';
                return (
                  <Card key={order.id} className={order.scheduled_for ? 'border-amber-300 bg-amber-50/30' : ''}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">Order #{order.order_number}</h4>
                            {order.scheduled_for && (
                              <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50">
                                Pickup {format(new Date(order.scheduled_for), 'PPp')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{order.customer_name} • {order.order_items?.length || 0} items</p>
                          <p className="text-sm">{itemsList}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Placed {format(new Date(order.created_at), 'PPp')}
                            {order.scheduled_for ? ` • Pickup at ${format(new Date(order.scheduled_for), 'PPp')}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <Badge variant="secondary">{order.status}</Badge>
                          {order.payment_status !== 'paid' && (
                            <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-xs">Awaiting payment</Badge>
                          )}
                          <p className="text-sm font-semibold">R{Number(order.total_amount).toFixed(2)}</p>
                          {nextStatus && (
                            <Button size="sm" onClick={() => handleNextStatus(order.id, order.status)} disabled={updateStatus.isPending}>
                              Mark {nextStatus === 'preparing' ? 'Preparing' : nextStatus === 'ready' ? 'Ready for pickup' : 'Collected'}
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
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
            {menuLoading && <div className="animate-pulse h-32 rounded-lg bg-muted" />}
            {!menuLoading && (!menuItems || menuItems.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">No menu items yet. Add your first item to get started.</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems?.map((item) => (
                <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                  {item.image_url && (
                    <div className="h-40 overflow-hidden rounded-t-lg">
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge variant={item.is_available ? 'default' : 'secondary'}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    {item.category && <p className="text-xs text-muted-foreground mb-1">{item.category}</p>}
                    {item.description && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>}
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">R{Number(item.price).toFixed(2)}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title={item.is_available ? 'Mark unavailable' : 'Mark available'} onClick={() => handleToggleAvailability(item)}>
                          {item.is_available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog({ id: item.id, vendor_id: item.vendor_id, name: item.name, price: item.price, description: item.description || '', category: item.category || '', image_url: item.image_url || '', is_available: item.is_available ?? true })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item.id, item.vendor_id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add / Edit menu item dialog */}
            <Dialog open={menuDialogOpen} onOpenChange={setMenuDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label>Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Beef Burger" value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Price (R) <span className="text-destructive">*</span></Label>
                      <Input type="number" min="0" step="0.01" placeholder="25.00" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Category</Label>
                      <Input placeholder="e.g. Mains" value={menuForm.category} onChange={e => setMenuForm(f => ({ ...f, category: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea placeholder="Brief description..." value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Image URL (optional)</Label>
                    <Input placeholder="https://..." value={menuForm.image_url} onChange={e => setMenuForm(f => ({ ...f, image_url: e.target.value }))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="is_available" checked={menuForm.is_available} onChange={e => setMenuForm(f => ({ ...f, is_available: e.target.checked }))} className="h-4 w-4" />
                    <Label htmlFor="is_available" className="font-normal cursor-pointer">Available for ordering</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMenuDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleMenuSave} disabled={createMenuItem.isPending || updateMenuItem.isPending}>
                    {createMenuItem.isPending || updateMenuItem.isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h3 className="text-xl font-semibold">Analytics Overview</h3>
            {(() => {
              const completedOrders = (vendorOrders ?? []).filter((o: any) => ['delivered', 'picked_up'].includes(o.status));
              // Revenue by day (last 7 days)
              const today = startOfDay(new Date());
              const revenueByDay = Array.from({ length: 7 }, (_, i) => {
                const day = subDays(today, 6 - i);
                const dayStr = format(day, 'EEE');
                const revenue = completedOrders
                  .filter((o: any) => startOfDay(new Date(o.created_at)).getTime() === day.getTime())
                  .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
                return { day: dayStr, revenue: parseFloat(revenue.toFixed(2)) };
              });
              const weekTotal = revenueByDay.reduce((s, d) => s + d.revenue, 0);
              // Popular items
              const itemCounts: Record<string, number> = {};
              completedOrders.forEach((o: any) => {
                (o.order_items ?? []).forEach((item: any) => {
                  const name = item.menu_items?.name ?? item.name ?? 'Unknown';
                  itemCounts[name] = (itemCounts[name] ?? 0) + (item.quantity ?? 1);
                });
              });
              const popularItems = Object.entries(itemCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">R{weekTotal.toFixed(2)}</div>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip formatter={(v: number) => `R${v.toFixed(2)}`} />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {popularItems.length === 0
                        ? <p className="text-sm text-muted-foreground">No completed orders yet.</p>
                        : popularItems.map(([name, count]) => (
                          <div key={name} className="flex justify-between text-sm">
                            <span>{name}</span>
                            <span className="font-semibold">{count} sold</span>
                          </div>
                        ))
                      }
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
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
                  <Button variant="outline" onClick={openInfoDialog}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Information
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Operating Hours</CardTitle>
                  <CardDescription>
                    Set your estimated preparation time range (in minutes)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-3">
                    Current: {vendor?.delivery_time_min ?? '?'}–{vendor?.delivery_time_max ?? '?'} min prep time
                  </div>
                  <Button variant="outline" onClick={openHoursDialog}>
                    <Clock className="h-4 w-4 mr-2" />
                    Edit Hours
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Restaurant Info Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Restaurant Information</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Restaurant Name</Label>
                <Input value={infoForm.name} onChange={e => setInfoForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={infoForm.description} onChange={e => setInfoForm(f => ({ ...f, description: e.target.value }))} rows={3} />
              </div>
              <div className="space-y-1">
                <Label>Location</Label>
                <Input value={infoForm.location} onChange={e => setInfoForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Block A Cafeteria" />
              </div>
              <div className="space-y-1">
                <Label>Phone Number</Label>
                <Input value={infoForm.phone_number} onChange={e => setInfoForm(f => ({ ...f, phone_number: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={infoForm.email} onChange={e => setInfoForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Cuisine Type</Label>
                <Input value={infoForm.cuisine_type} onChange={e => setInfoForm(f => ({ ...f, cuisine_type: e.target.value }))} placeholder="e.g. Fast Food, Burgers" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInfoDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => updateVendorInfo.mutate(infoForm)}
                disabled={updateVendorInfo.isPending || !infoForm.name.trim() || !infoForm.location.trim()}
              >
                {updateVendorInfo.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Operating Hours Dialog */}
        <Dialog open={hoursDialogOpen} onOpenChange={setHoursDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Preparation Time</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">Set how long orders typically take to prepare (shown to students at checkout).</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Min (minutes)</Label>
                  <Input type="number" min={1} value={hoursForm.delivery_time_min} onChange={e => setHoursForm(f => ({ ...f, delivery_time_min: e.target.value }))} placeholder="e.g. 15" />
                </div>
                <div className="space-y-1">
                  <Label>Max (minutes)</Label>
                  <Input type="number" min={1} value={hoursForm.delivery_time_max} onChange={e => setHoursForm(f => ({ ...f, delivery_time_max: e.target.value }))} placeholder="e.g. 30" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHoursDialogOpen(false)}>Cancel</Button>
              <Button
                onClick={() => updateVendorHours.mutate({ delivery_time_min: Number(hoursForm.delivery_time_min), delivery_time_max: Number(hoursForm.delivery_time_max) })}
                disabled={updateVendorHours.isPending || !hoursForm.delivery_time_min || !hoursForm.delivery_time_max}
              >
                {updateVendorHours.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VendorDashboard;
