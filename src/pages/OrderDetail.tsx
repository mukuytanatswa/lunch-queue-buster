import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderTracking from '@/components/OrderTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order_detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*, menu_items (name, image_url)),
          vendors (name, image_url, phone_number)
        `)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
    refetchInterval: 10000,
  });

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <Button asChild><Link to="/orders">View Orders</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Orders
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
              <p className="text-muted-foreground">
                {format(new Date(order.created_at!), 'PPp')} • {(order as any).vendors?.name}
              </p>
            </div>
            <Badge className="text-sm capitalize">{order.status.replace('_', ' ')}</Badge>
          </div>

          {/* Tracking */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTracking
                status={order.status}
                estimatedTime={order.estimated_delivery_time}
                deliveredTime={order.delivered_time}
                pickupTime={order.pickup_time}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(order as any).order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.menu_items?.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80'}
                        alt={item.menu_items?.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.quantity}x {item.menu_items?.name || 'Item'}</p>
                      </div>
                      <span className="text-sm font-medium">R{Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R{Number(order.subtotal).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span>R{Number(order.delivery_fee).toFixed(2)}</span></div>
                  {Number(order.tip_amount) > 0 && (
                    <div className="flex justify-between"><span className="text-muted-foreground">Tip</span><span>R{Number(order.tip_amount).toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t"><span>Total</span><span>R{Number(order.total_amount).toFixed(2)}</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info + Chat */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Delivery Address</p>
                    <p className="font-medium">{order.delivery_address}</p>
                  </div>
                  {order.delivery_instructions && (
                    <div>
                      <p className="text-muted-foreground">Instructions</p>
                      <p>{order.delivery_instructions}</p>
                    </div>
                  )}
                  {(order as any).vendors?.phone_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{(order as any).vendors.phone_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetail;
