import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import VendorCard from '@/components/VendorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Search, Star, TrendingUp, Zap, Wallet, Users } from 'lucide-react';
import { useVendors } from '@/hooks/useVendors';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { data: vendors, isLoading } = useVendors();

  useEffect(() => {
    if (user && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);

  const filteredVendors = vendors?.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || vendor.location === selectedCampus;
    return matchesSearch && matchesCampus;
  }) || [];

  const featuredVendors = filteredVendors.filter(v => v.is_featured);
  const allLocations = vendors ? Array.from(new Set(vendors.map(v => v.location))) : [];

  const mapVendor = (v: any) => ({
    id: v.id,
    name: v.name,
    image: v.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    cuisineType: v.cuisine_type,
    rating: Number(v.rating) || 0,
    deliveryTime: `${v.delivery_time_min}-${v.delivery_time_max} min`,
    location: v.location,
    featured: v.is_featured || false,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />

        {/* Campus Selection and Search */}
        <section className="bg-gradient-to-b from-white to-muted/50 py-8">
          <div className="container mx-auto px-4">
            <div className="bg-card shadow-md rounded-xl p-6 -mt-16 relative z-10 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="campus" className="text-sm font-medium">Campus Location</Label>
                  <select id="campus" value={selectedCampus} onChange={e => setSelectedCampus(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="all">All Campuses</option>
                    {allLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium">Search for food or cuisine</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search for vendors, dishes, or cuisines..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vendors */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : (
              <>
                {/* Featured */}
                {featuredVendors.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="text-xl font-semibold">Featured</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredVendors.slice(0, 3).map(v => <VendorCard key={v.id} {...mapVendor(v)} />)}
                    </div>
                  </div>
                )}

                {/* All Vendors */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">All Vendors</h3>
                    <Button variant="outline" asChild><Link to="/vendors">View All</Link></Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.slice(0, 6).map(v => <VendorCard key={v.id} {...mapVendor(v)} />)}
                  </div>
                  {filteredVendors.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No vendors found. Check back soon!</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Index;
