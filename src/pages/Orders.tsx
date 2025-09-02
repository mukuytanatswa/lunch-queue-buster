
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ClockIcon, 
  Package2Icon,
  CheckCircleIcon,
  ArrowLeft,
  RefreshCw,
  MapPin,
  Clock
} from "lucide-react";
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'preparing':
      return 'bg-orange-100 text-orange-800';
    case 'ready':
      return 'bg-purple-100 text-purple-800';
    case 'picked_up':
      return 'bg-indigo-100 text-indigo-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'preparing':
      return 'Preparing';
    case 'ready':
      return 'Ready for Pickup';
    case 'picked_up':
      return 'Picked Up';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const Orders = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const { orders: allOrders, loading, error, refetch } = useOrders();
  
  const filteredOrders = selectedTab === 'all' 
    ? allOrders 
    : allOrders.filter(order => {
        switch (selectedTab) {
          case 'active':
            return !['delivered', 'cancelled'].includes(order.status.toLowerCase());
          case 'completed':
            return ['delivered', 'cancelled'].includes(order.status.toLowerCase());
          default:
            return true;
        }
      });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Orders</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Link 
              to="/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-16">
                  <Package2Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    {selectedTab === 'all' 
                      ? 'No orders yet' 
                      : selectedTab === 'active' 
                      ? 'No active orders' 
                      : 'No completed orders'}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {selectedTab === 'all'
                      ? 'When you place your first order, it will appear here.'
                      : selectedTab === 'active'
                      ? 'You don\'t have any orders in progress.'
                      : 'Your completed orders will appear here.'}
                  </p>
                  {selectedTab !== 'completed' && (
                    <Button asChild>
                      <Link to="/vendors">Browse Vendors</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.order_number}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'PPp')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="font-medium">R{Number(order.total_amount).toFixed(2)}</span>
                          </div>
                          
                          {order.delivery_address && (
                            <div className="flex items-start space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{order.delivery_address}</span>
                            </div>
                          )}
                          
                          {order.estimated_delivery_time && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Estimated delivery: {format(new Date(order.estimated_delivery_time), 'p')}
                              </span>
                            </div>
                          )}
                          
                          {order.delivered_time && (
                            <div className="flex items-center space-x-2 text-sm">
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">
                                Delivered: {format(new Date(order.delivered_time), 'PPp')}
                              </span>
                            </div>
                          )}
                          
                          {order.delivery_instructions && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Instructions: </span>
                              <span className="italic">{order.delivery_instructions}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;
