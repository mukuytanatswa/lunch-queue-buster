import { useState } from 'react';
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

const OrdersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = [
    {
      id: 'QB-2024-001234',
      customer: 'Sarah Johnson',
      vendor: 'Pizza Palace',
      driver: 'Mike Smith',
      amount: 'R45.50',
      status: 'completed',
      time: '2 hours ago',
      items: '2x Margherita Pizza, 1x Coke'
    },
    {
      id: 'QB-2024-001235',
      customer: 'John Doe',
      vendor: 'Burger King',
      driver: 'Lisa Brown',
      amount: 'R32.00',
      status: 'in_progress',
      time: '15 minutes ago',
      items: '1x Whopper Meal'
    },
    {
      id: 'QB-2024-001236',
      customer: 'Emily Davis',
      vendor: 'Sushi Express',
      driver: null,
      amount: 'R78.90',
      status: 'failed',
      time: '1 hour ago',
      items: '1x Salmon Roll Set, 1x Miso Soup'
    },
    {
      id: 'QB-2024-001237',
      customer: 'Alex Wilson',
      vendor: 'Coffee Shop',
      driver: 'Tom Johnson',
      amount: 'R24.50',
      status: 'preparing',
      time: '30 minutes ago',
      items: '2x Cappuccino, 1x Croissant'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><RefreshCw className="w-3 h-3 mr-1" />Preparing</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Problem Orders Alert */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            Orders Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
              <div>
                <p className="font-medium">QB-2024-001236 - Payment Failed</p>
                <p className="text-sm text-muted-foreground">Customer payment declined, order on hold</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Retry Payment</Button>
                <Button size="sm" variant="destructive">Cancel Order</Button>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div>
                <p className="font-medium">QB-2024-001238 - Delivery Delayed</p>
                <p className="text-sm text-muted-foreground">Driver unavailable, customer waiting 45+ minutes</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Reassign Driver</Button>
                <Button size="sm" variant="outline">Contact Customer</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{order.id}</span>
                    {getStatusBadge(order.status)}
                    <span className="text-sm text-muted-foreground">{order.time}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{order.customer}</span> → <span>{order.vendor}</span>
                    {order.driver && (
                      <span className="text-muted-foreground"> (Driver: {order.driver})</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{order.items}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{order.amount}</span>
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
            <CardTitle className="text-sm">Order Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96.8%</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R47.20</div>
            <p className="text-sm text-muted-foreground">+R3.50 vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Peak Order Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12:30 PM</div>
            <p className="text-sm text-muted-foreground">Lunch rush period</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersManagement;