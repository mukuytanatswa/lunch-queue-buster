
import { Navigate, Link } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, Package2Icon, CheckCircleIcon, TruckIcon, XCircleIcon, ChefHat, Eye } from "lucide-react";
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import OrderTracking from '@/components/OrderTracking';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: ClockIcon, color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', icon: CheckCircleIcon, color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'bg-purple-100 text-purple-800' },
  ready: { label: 'Ready for Pickup', icon: Package2Icon, color: 'bg-indigo-100 text-indigo-800' },
  picked_up: { label: 'On the Way', icon: TruckIcon, color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Delivered', icon: CheckCircleIcon, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', icon: XCircleIcon, color: 'bg-red-100 text-red-800' },
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const activeOrders = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status)) || [];
  const pastOrders = orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)) || [];

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
              <Button asChild><Link to="/vendors">Browse Vendors</Link></Button>
            </div>
          )}

          {/* Active Orders */}
          {activeOrders.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
              <div className="space-y-6">
                {activeOrders.map(order => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div key={order.id} className="border-2 border-primary/20 rounded-lg p-6 bg-card">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                        <div>
                          <span className="text-sm text-muted-foreground">{format(new Date(order.created_at!), 'PPp')}</span>
                          <h3 className="text-lg font-medium">{(order as any).vendors?.name || 'Restaurant'}</h3>
                          <p className="text-sm text-muted-foreground">Order #{order.order_number}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                          <Badge className={`${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />{status.label}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/order/${order.id}`}><Eye className="h-4 w-4 mr-1" />Track</Link>
                          </Button>
                        </div>
                      </div>
                      <OrderTracking status={order.status} deliveredTime={order.delivered_time} pickupTime={order.pickup_time} />
                      <div className="flex justify-between items-center border-t pt-3 mt-2">
                        <div className="text-sm text-muted-foreground">
                          {(order as any).order_items?.length || 0} items • {order.delivery_address}
                        </div>
                        <span className="font-semibold">R{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Orders */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Past Orders</h2>
              <div className="space-y-4">
                {pastOrders.map(order => {
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
                        <div className="flex items-center gap-3 mt-2 md:mt-0">
                          <Badge className={`${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />{status.label}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/order/${order.id}`}><Eye className="h-4 w-4 mr-1" />Details</Link>
                          </Button>
                        </div>
                      </div>
                      <div className="border-t pt-4 mb-4">
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
                        <div className="text-sm text-muted-foreground">{order.delivery_address}</div>
                        <span className="font-semibold">R{Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;
