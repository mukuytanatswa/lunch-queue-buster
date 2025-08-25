import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  Search, 
  Filter, 
  Star, 
  DollarSign, 
  Clock, 
  MapPin,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';

const DriverManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const drivers = [
    {
      id: 'D001',
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+27 123 456 789',
      status: 'online',
      rating: 4.9,
      deliveries: 247,
      earnings: 'R3,245',
      vehicle: 'Bicycle',
      location: 'Main Campus',
      joined: '2023-07-20',
      completionRate: 98,
      onTimeRate: 95,
      issues: 0
    },
    {
      id: 'D002',
      name: 'Sarah Williams',
      email: 'sarah.w@email.com',
      phone: '+27 987 654 321',
      status: 'online',
      rating: 4.8,
      deliveries: 189,
      earnings: 'R2,890',
      vehicle: 'Scooter',
      location: 'Upper Campus',
      joined: '2023-08-15',
      completionRate: 96,
      onTimeRate: 92,
      issues: 1
    },
    {
      id: 'D003',
      name: 'David Chen',
      email: 'david.c@email.com',
      phone: '+27 555 123 456',
      status: 'offline',
      rating: 4.7,
      deliveries: 156,
      earnings: 'R2,120',
      vehicle: 'Car',
      location: 'Rondebosch',
      joined: '2023-09-10',
      completionRate: 94,
      onTimeRate: 88,
      issues: 0
    },
    {
      id: 'D004',
      name: 'Lisa Brown',
      email: 'lisa.b@email.com',
      phone: '+27 444 789 123',
      status: 'suspended',
      rating: 3.8,
      deliveries: 67,
      earnings: 'R890',
      vehicle: 'Bicycle',
      location: 'Main Campus',
      joined: '2023-11-05',
      completionRate: 85,
      onTimeRate: 78,
      issues: 3
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 hover:bg-green-600"><Activity className="w-3 h-3 mr-1" />Online</Badge>;
      case 'offline':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Offline</Badge>;
      case 'suspended':
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getVehicleBadge = (vehicle: string) => {
    const color = vehicle === 'Car' ? 'bg-blue-500' : vehicle === 'Scooter' ? 'bg-purple-500' : 'bg-green-500';
    return <Badge className={`${color} hover:${color}`}>{vehicle}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Driver Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+7 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Now</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Available for deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">Across all drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R28,450</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers by name, email, or location..."
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
                <SelectItem value="all">All Drivers</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
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

      {/* Driver Issues Alert */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
            Driver Issues Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
              <div>
                <p className="font-medium">Lisa Brown - Multiple Customer Complaints</p>
                <p className="text-sm text-muted-foreground">3 complaints about late deliveries and attitude</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
                <Button size="sm" variant="destructive">Take Action</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{driver.name}</h4>
                      {getStatusBadge(driver.status)}
                      {getVehicleBadge(driver.vehicle)}
                      {driver.issues > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {driver.issues} issue{driver.issues > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {driver.email} • {driver.phone}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {driver.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {driver.deliveries} deliveries
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {driver.earnings}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {driver.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Completion: {driver.completionRate}%</span>
                      <span>On-time: {driver.onTimeRate}%</span>
                      <span>Joined: {new Date(driver.joined).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  {driver.status === 'online' && (
                    <Button variant="outline" size="sm">
                      Message
                    </Button>
                  )}
                  {driver.status === 'suspended' && (
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

      {/* Driver Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drivers.filter(d => d.status !== 'suspended').slice(0, 3).map((driver, index) => (
                <div key={driver.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium">{driver.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{driver.earnings}</div>
                    <div className="text-sm text-muted-foreground">{driver.deliveries} deliveries</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Peak Hour Coverage</span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Response Time</span>
                <span className="font-semibold">3.2 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Driver Retention Rate</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverManagement;