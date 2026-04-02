import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderById } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { ClockIcon, Package2Icon, CheckCircleIcon, ShoppingBagIcon, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';

const statusSteps = [
  { key: 'pending', label: 'Order placed', icon: ClockIcon },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
  { key: 'preparing', label: 'Preparing your order', icon: Package2Icon },
  { key: 'ready', label: 'Ready for pickup', icon: ShoppingBagIcon },
  { key: 'delivered', label: 'Collected', icon: CheckCircleIcon },
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrderById(orderId);
  const queryClient = useQueryClient();

  // Live status updates
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-tracking:${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId, queryClient]);

  if (!user) return <Navigate to="/auth" replace />;
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
        <Footer />
      </div>
    );
  }
  if (!order || order.customer_id !== user.id) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Order not found</h2>
            <Button asChild><Link to="/orders">Back to Orders</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const vendorName = (order as any).vendors?.name || 'Vendor';
  // Map picked_up → delivered index so existing DB rows still render correctly
  const effectiveStatus = order.status === 'picked_up' ? 'delivered' : order.status;
  const currentIndex = statusSteps.findIndex(s => s.key === effectiveStatus);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">← Back to Orders</Link>
          <h1 className="text-2xl font-bold mb-1">Order status</h1>
          <p className="text-muted-foreground mb-6">Order #{order.order_number} • {vendorName} • Pickup order</p>

          {/* Scheduled pickup time banner */}
          {(order as any).scheduled_for && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start gap-3">
              <CalendarClock className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Pickup scheduled for</p>
                <p className="font-semibold text-amber-900">{format(new Date((order as any).scheduled_for), 'PPPp')}</p>
              </div>
            </div>
          )}

          {/* Progress steps */}
          <div className="space-y-4 mb-8">
            {statusSteps.map((step, i) => {
              const StepIcon = step.icon;
              const done = currentIndex >= i;
              const current = currentIndex === i;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${current ? 'text-primary' : ''}`}>{step.label}</p>
                    {step.key === effectiveStatus && (
                      <Badge variant="secondary" className="mt-1">Current</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vendor location */}
          {(order as any).vendors?.location && (
            <div className="rounded-lg border p-4 mb-6">
              <p className="text-sm font-medium text-muted-foreground">Vendor location</p>
              <p className="font-medium">{(order as any).vendors.location}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-6">Placed {format(new Date(order.created_at!), 'PPp')}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
