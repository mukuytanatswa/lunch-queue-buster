import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          customer_name,
          order_items ( id ),
          vendors ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000,
  });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Delivered</Badge>;
    case 'picked_up':
      return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="w-3 h-3 mr-1" />Collected</Badge>;
    case 'ready':
      return <Badge className="bg-purple-500 hover:bg-purple-600"><CheckCircle className="w-3 h-3 mr-1" />Ready</Badge>;
    case 'preparing':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600"><RefreshCw className="w-3 h-3 mr-1" />Preparing</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-400 hover:bg-blue-500"><Clock className="w-3 h-3 mr-1" />Confirmed</Badge>;
    case 'pending':
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case 'cancelled':
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: orders = [], isLoading, error, refetch } = useAdminOrders();

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((order.vendors as any)?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const problemOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="picked_up">Collected</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problem Orders Alert */}
      {problemOrders.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              Orders Requiring Attention ({problemOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {problemOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()} — {(order.vendors as any)?.name ?? 'Unknown Vendor'}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_name ?? 'Customer'} · R{Number(order.total_amount).toFixed(2)} · {order.status}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">Contact Customer</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Recent Orders {!isLoading && <span className="text-sm font-normal text-muted-foreground">({filteredOrders.length})</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              <p>Failed to load orders. <button className="underline" onClick={() => refetch()}>Retry</button></p>
            </div>
          )}
          {!isLoading && !error && filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No orders found.</div>
          )}
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{order.customer_name ?? 'Customer'}</span>
                    {' → '}
                    <span>{(order.vendors as any)?.name ?? 'Unknown Vendor'}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(order.order_items as any[])?.length ?? 0} item(s)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">R{Number(order.total_amount).toFixed(2)}</span>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Analytics Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orders.length}</div>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
            </div>
            <p className="text-sm text-muted-foreground">In progress now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.length > 0
                ? `${((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100).toFixed(1)}%`
                : '—'}
            </div>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersManagement;
