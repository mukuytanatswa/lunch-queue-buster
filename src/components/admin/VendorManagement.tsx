import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Store,
  Search,
  Star,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  Ban,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const useAllVendors = () =>
  useQuery({
    queryKey: ['admin-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, profiles(first_name, last_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

const useVendorOrderStats = () =>
  useQuery({
    queryKey: ['admin-vendor-order-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('vendor_id, total_amount, status');
      if (error) throw error;
      const stats: Record<string, { orders: number; revenue: number }> = {};
      for (const o of data ?? []) {
        if (!stats[o.vendor_id]) stats[o.vendor_id] = { orders: 0, revenue: 0 };
        stats[o.vendor_id].orders++;
        if (o.status === 'completed') stats[o.vendor_id].revenue += Number(o.total_amount);
      }
      return stats;
    },
  });

const getStatusBadge = (isActive: boolean, isOpen: boolean) => {
  if (!isActive) return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Inactive</Badge>;
  if (isOpen) return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Open</Badge>;
  return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Closed</Badge>;
};

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '' });
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useAllVendors();
  const { data: orderStats = {} } = useVendorOrderStats();

  const handleInviteVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    const { data, error } = await supabase.functions.invoke('invite-vendor', {
      body: { email: inviteForm.email, firstName: inviteForm.firstName, lastName: inviteForm.lastName },
    });
    setInviting(false);
    if (error || data?.error) {
      toast.error(data?.error ?? 'Failed to invite vendor');
    } else {
      toast.success(`Invite sent to ${inviteForm.email}`);
      setInviteForm({ firstName: '', lastName: '', email: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    }
  };

  const filtered = vendors.filter(v => {
    const matchesSearch = searchTerm === '' ||
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && v.is_active && v.is_open) ||
      (statusFilter === 'closed' && v.is_active && !v.is_open) ||
      (statusFilter === 'inactive' && !v.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = Object.values(orderStats).reduce((sum, s) => sum + s.revenue, 0);
  const avgRating = vendors.length > 0
    ? vendors.reduce((sum, v) => sum + (Number(v.rating) || 0), 0) / vendors.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Invite Vendor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Invite Vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteVendor} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <Label>First Name</Label>
              <Input placeholder="Jane" value={inviteForm.firstName} onChange={e => setInviteForm(p => ({ ...p, firstName: e.target.value }))} required />
            </div>
            <div className="flex-1 space-y-1">
              <Label>Last Name</Label>
              <Input placeholder="Doe" value={inviteForm.lastName} onChange={e => setInviteForm(p => ({ ...p, lastName: e.target.value }))} required />
            </div>
            <div className="flex-1 space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="vendor@email.com" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={inviting}>{inviting ? 'Sending...' : 'Send Invite'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : vendors.length}</div>
            <p className="text-xs text-muted-foreground">{vendors.filter(v => v.is_active).length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Open</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : vendors.filter(v => v.is_open).length}</div>
            <p className="text-xs text-muted-foreground">Accepting orders now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">All time from completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="active">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading vendors...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm">No vendors found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map(vendor => {
                const stats = orderStats[vendor.id] ?? { orders: 0, revenue: 0 };
                return (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {vendor.image_url
                          ? <img src={vendor.image_url} alt={vendor.name} className="w-full h-full object-cover" />
                          : <Store className="h-6 w-6" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{vendor.name}</h4>
                          {getStatusBadge(vendor.is_active, vendor.is_open)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.email} {vendor.location ? `• ${vendor.location}` : ''}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {vendor.rating ? Number(vendor.rating).toFixed(1) : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stats.orders} orders
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            R{stats.revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorManagement;
