import { useParams, Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrderById } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ClockIcon, Package2Icon, CheckCircleIcon, TruckIcon, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

const statusSteps = [
  { key: 'pending', label: 'Order placed', icon: ClockIcon },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircleIcon },
  { key: 'preparing', label: 'Preparing', icon: Package2Icon },
  { key: 'ready', label: 'Ready for pickup', icon: Package2Icon },
  { key: 'picked_up', label: 'Out for delivery', icon: TruckIcon },
  { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { data: order, isLoading } = useOrderById(orderId);

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

  const currentIndex = statusSteps.findIndex(s => s.key === order.status);
  const vendorName = (order as any).vendors?.name || 'Vendor';

  const { data: driverProfile } = useQuery({
    queryKey: ['profile', order.driver_id],
    queryFn: async () => {
      if (!order.driver_id) return null;
      const { data } = await supabase.from('profiles').select('phone, first_name, last_name').eq('user_id', order.driver_id).single();
      return data;
    },
    enabled: !!order.driver_id,
  });
  const { data: driverLocation } = useQuery({
    queryKey: ['driver_location', order.driver_id],
    queryFn: async () => {
      if (!order.driver_id) return null;
      const { data } = await supabase.from('driver_profiles').select('current_location').eq('user_id', order.driver_id).single();
      return data?.current_location as { lat?: number; lng?: number } | null;
    },
    enabled: !!order.driver_id && !!['picked_up', 'ready'].includes(order.status),
    refetchInterval: 10000, // Poll every 10s for live driver position
  });
  const driverPhone = driverProfile?.phone;
  const driverLat = driverLocation && typeof driverLocation === 'object' && 'lat' in driverLocation ? (driverLocation as any).lat : null;
  const driverLng = driverLocation && typeof driverLocation === 'object' && 'lng' in driverLocation ? (driverLocation as any).lng : null;
  const hasDriverLocation = driverLat != null && driverLng != null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">← Back to Orders</Link>
          <h1 className="text-2xl font-bold mb-2">Live order status</h1>
          <p className="text-muted-foreground mb-6">Order #{order.order_number} • {vendorName}</p>

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
                    {step.key === order.status && (
                      <Badge variant="secondary" className="mt-1">Current</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery PIN */}
          {order.delivery_pin && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="rounded-lg border bg-muted/50 p-4 mb-6">
              <p className="text-sm font-medium text-muted-foreground">Delivery PIN (give to driver to receive your meal)</p>
              <p className="text-2xl font-mono font-bold mt-1">{order.delivery_pin}</p>
            </div>
          )}

          {/* Delivery address & map link */}
          <div className="rounded-lg border p-4 mb-6">
            <p className="text-sm font-medium text-muted-foreground">Delivery address</p>
            <p className="font-medium">{order.delivery_address}</p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_address)}`} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4 mr-2" />Open in Maps
              </a>
            </Button>
          </div>

          {/* GPS map tracking – driver location when out for delivery */}
          {order.driver_id && order.status === 'picked_up' && (
            <div className="rounded-lg border p-4 mb-6">
              <p className="text-sm font-medium text-muted-foreground">Courier location</p>
              {hasDriverLocation ? (
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href={`https://www.google.com/maps?q=${driverLat},${driverLng}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4 mr-2" />View courier on map
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Driver location will appear when they share it from their app.</p>
              )}
            </div>
          )}

          {/* Contact driver - show when driver assigned */}
          {order.driver_id && (
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium text-muted-foreground">Contact driver</p>
              {driverPhone ? (
                <Button variant="outline" asChild>
                  <a href={`tel:${driverPhone}`}>
                    <Phone className="h-4 w-4 mr-2" />Call driver
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Driver contact not available</p>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-6">Placed {format(new Date(order.created_at!), 'PPp')}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
