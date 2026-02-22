import { useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, Package2Icon, CheckCircleIcon, TruckIcon, XCircleIcon, RotateCcw, MapPin, KeyRound } from "lucide-react";
import { useOrders, useCancelOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', icon: CheckCircleIcon, color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', icon: Package2Icon, color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Ready for Pickup', icon: Package2Icon, color: 'bg-indigo-100 text-indigo-800' },
  picked_up: { label: 'On the Way', icon: TruckIcon, color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', icon: CheckCircleIcon, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', icon: XCircleIcon, color: 'bg-red-100 text-red-800' },
};

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const cancelOrder = useCancelOrder();
  const { addItem } = useCart();

  // Live order status updates via Supabase realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const canCancel = (order: any) => {
    if (!['pending', 'confirmed'].includes(order.status)) return false;
    const deadline = order.cancellation_deadline ? new Date(order.cancellation_deadline) : null;
    return deadline && new Date() < deadline;
  };

  const handleReorder = (order: any) => {
    const vendorId = order.vendor_id;
    const vendorName = (order as any).vendors?.name || 'Vendor';
    (order as any).order_items?.forEach((item: any) => {
      addItem({
        menuItemId: item.menu_item_id,
        name: item.menu_items?.name || 'Item',
        price: Number(item.unit_price),
        quantity: item.quantity,
        image: item.menu_items?.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        vendorId,
        vendorName,
      });
    });
    toast.success('Items added to cart');
    navigate(`/vendor/${vendorId}`);
  };

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success('Order cancelled');
    } catch {
      toast.error('Failed to cancel');
    }
  };

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
            <p className="text-muted-foreground">Track and manage your current and past orders</p>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
            </div>
          )}

          {orders && orders.length === 0 && (
            <div className="text-center py-12">
              <Package2Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start ordering from your favorite campus vendors!</p>
              <Button asChild><a href="/vendors">Browse Vendors</a></Button>
            </div>
          )}

          <div className="space-y-6">
            {orders?.map(order => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order.id} className="border rounded-lg p-6 bg-card">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">{format(new Date(order.created_at!), 'PPp')}</span>
                      <h3 className="text-lg font-medium">{(order as any).vendors?.name || 'Restaurant'}</h3>
                      <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
                    </div>
                    <Badge className={`${status.color} mt-2 md:mt-0`}>
                      <StatusIcon className="h-4 w-4 mr-1" />{status.label}
                    </Badge>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium mb-2">Items</h4>
                    <ul className="text-sm space-y-1">
                      {(order as any).order_items?.map((item: any) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.quantity}x {item.menu_items?.name || 'Item'}</span>
                          <span>R{Number(item.total_price).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Delivery to: {order.delivery_address}
                    </div>
                    <span className="font-semibold">R{Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  {order.delivery_pin && order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Delivery PIN: <span className="font-mono font-semibold">{order.delivery_pin}</span></span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/orders/${order.id}/track`}><MapPin className="h-4 w-4 mr-1" />Track</Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                      <RotateCcw className="h-4 w-4 mr-1" />Reorder
                    </Button>
                    {canCancel(order) && (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleCancel(order.id)} disabled={cancelOrder.isPending}>
                        Cancel order
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
