import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Store,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const [usersRes, vendorsRes, ordersRes, activeOrdersRes, cancelledRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('vendors').select('id, is_open', { count: 'exact' }).eq('is_active', true),
        supabase.from('orders').select('total_amount').eq('status', 'completed').gte('created_at', todayIso),
        supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'preparing', 'ready']),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'cancelled').gte('created_at', todayIso),
      ]);

      const totalUsers = usersRes.count ?? 0;
      const vendors = vendorsRes.data ?? [];
      const totalVendors = vendorsRes.count ?? 0;
      const openVendors = vendors.filter(v => v.is_open).length;
      const todayOrders = ordersRes.data ?? [];
      const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const activeOrders = activeOrdersRes.count ?? 0;
      const cancelledToday = cancelledRes.count ?? 0;

      return { totalUsers, totalVendors, openVendors, todayRevenue, completedToday: todayOrders.length, activeOrders, cancelledToday };
    },
    refetchInterval: 60_000,
  });
};

const PlatformOverview = () => {
  const { data: stats, isLoading } = useAdminStats();

  const fmt = (n: number) => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Platform Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              All Systems Operational
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats?.totalVendors}</div>
            <p className="text-xs text-muted-foreground">{isLoading ? '' : `${stats?.openVendors} currently open`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : `R${fmt(stats?.todayRevenue ?? 0)}`}</div>
            <p className="text-xs text-muted-foreground">From completed orders today</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats?.completedToday}</div>
            <p className="text-xs text-muted-foreground">Orders fulfilled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats?.activeOrders}</div>
            <p className="text-xs text-muted-foreground">In progress now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats?.cancelledToday}</div>
            <p className="text-xs text-muted-foreground">Cancelled orders today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformOverview;
