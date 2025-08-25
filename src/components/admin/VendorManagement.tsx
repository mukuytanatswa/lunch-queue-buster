import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Store, 
  Search, 
  Filter, 
  Star, 
  DollarSign, 
  Clock, 
  Users,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const vendors = [
    {
      id: 'V001',
      name: 'Pizza Palace',
      owner: 'Mario Rossi',
      email: 'mario@pizzapalace.com',
      phone: '+27 123 456 789',
      status: 'active',
      rating: 4.8,
      orders: 247,
      revenue: 'R12,450',
      location: 'Main Campus',
      joined: '2023-08-15',
      commission: '15%',
      issues: 0
    },
    {
      id: 'V002',
      name: 'Burger Junction',
      owner: 'Sarah Lee',
      email: 'sarah@burgerjunction.com',
      phone: '+27 987 654 321',
      status: 'active',
      rating: 4.6,
      orders: 189,
      revenue: 'R8,920',
      location: 'Upper Campus',
      joined: '2023-09-22',
      commission: '12%',
      issues: 1
    },
    {
      id: 'V003',
      name: 'Sushi Express',
      owner: 'Kenji Tanaka',
      email: 'kenji@sushiexpress.com',
      phone: '+27 555 123 456',
      status: 'pending',
      rating: 0,
      orders: 0,
      revenue: 'R0',
      location: 'Rondebosch',
      joined: '2024-01-10',
      commission: '18%',
      issues: 0
    },
    {
      id: 'V004',
      name: 'Coffee Corner',
      owner: 'Emma Brown',
      email: 'emma@coffeecorner.com',
      phone: '+27 444 789 123',
      status: 'suspended',
      rating: 3.2,
      orders: 67,
      revenue: 'R2,340',
      location: 'Main Campus',
      joined: '2023-10-05',
      commission: '10%',
      issues: 3
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Vendor Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R45,230</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name, owner, or location..."
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
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Applications Alert */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5" />
            Pending Vendor Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
              <div>
                <p className="font-medium">Sushi Express - Kenji Tanaka</p>
                <p className="text-sm text-muted-foreground">Applied 3 days ago • Japanese cuisine • Rondebosch location</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                <Button size="sm" variant="destructive">Reject</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{vendor.name}</h4>
                      {getStatusBadge(vendor.status)}
                      {vendor.issues > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {vendor.issues} issue{vendor.issues > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {vendor.owner} • {vendor.email} • {vendor.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {vendor.orders} orders
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {vendor.revenue}
                      </span>
                      <span>Commission: {vendor.commission}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  {vendor.status === 'active' && (
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  )}
                  {vendor.status === 'suspended' && (
                    <Button variant="outline" size="sm" className="text-green-600">
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendor Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vendors.filter(v => v.status === 'active').slice(0, 3).map((vendor, index) => (
                <div key={vendor.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{vendor.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{vendor.revenue}</div>
                    <div className="text-sm text-muted-foreground">{vendor.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Coffee Corner - Quality Complaints</p>
                  <p className="text-sm text-muted-foreground">3 recent complaints about cold food</p>
                </div>
                <Button variant="outline" size="sm">Investigate</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Burger Junction - Delivery Delays</p>
                  <p className="text-sm text-muted-foreground">1 issue with preparation times</p>
                </div>
                <Button variant="outline" size="sm">Contact</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorManagement;