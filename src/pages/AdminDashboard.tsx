import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import PlatformOverview from '@/components/admin/PlatformOverview';
import OrdersManagement from '@/components/admin/OrdersManagement';
import VendorManagement from '@/components/admin/VendorManagement';
import DriverManagement from '@/components/admin/DriverManagement';

const AdminDashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Re-enabled admin role check for security
  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {profile?.first_name || 'Admin'}! Complete operational control of QuickBite platform.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><PlatformOverview /></TabsContent>
          <TabsContent value="orders"><OrdersManagement /></TabsContent>
          <TabsContent value="vendors"><VendorManagement /></TabsContent>
          <TabsContent value="drivers"><DriverManagement /></TabsContent>
          <TabsContent value="customers">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Customer Management</h3>
              <p className="text-muted-foreground">Customer management features coming soon...</p>
            </div>
          </TabsContent>
          <TabsContent value="financial">
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Financial Management</h3>
              <p className="text-muted-foreground">Financial management features coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
