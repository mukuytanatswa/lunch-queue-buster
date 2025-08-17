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
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Redirect to onboarding if user is logged in but hasn't completed onboarding
  useEffect(() => {
    if (user && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, profile, navigate]);
  
  // Mock data for featured vendors
  const vendors = [
    {
      id: '1',
      name: 'Food Science',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      cuisineType: 'Fast Food',
      rating: 4.5,
      deliveryTime: '15-25 min',
      location: 'Upper Campus',
      featured: true,
      quickBites: true,
      budget: false,
      trending: true,
      groupDeals: false
    },
    {
      id: '2',
      name: 'Health Sciences Cafe',
      image: 'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      cuisineType: 'Healthy',
      rating: 4.2,
      deliveryTime: '20-30 min',
      location: 'Medical Campus', 
      featured: false,
      quickBites: false,
      budget: true,
      trending: false,
      groupDeals: true
    },
    {
      id: '3',
      name: 'Engineering Eatery',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      cuisineType: 'Mixed',
      rating: 4.7,
      deliveryTime: '10-20 min',
      location: 'Upper Campus',
      featured: true,
      quickBites: true,
      budget: false,
      trending: true,
      groupDeals: false
    },
    {
      id: '4',
      name: 'Arts Cafe',
      image: 'https://images.unsplash.com/photo-1559948271-7d5c98d1e415?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      cuisineType: 'Cafe',
      rating: 4.0,
      deliveryTime: '15-25 min',
      location: 'Middle Campus',
      featured: false,
      quickBites: true,
      budget: true,
      trending: false,
      groupDeals: true
    },
    {
      id: '5',
      name: 'Commerce Canteen',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      cuisineType: 'Fast Food',
      rating: 4.3,
      deliveryTime: '15-20 min',
      location: 'Upper Campus',
      featured: true,
      quickBites: false,
      budget: true,
      trending: true,
      groupDeals: true
    },
    {
      id: '6',
      name: 'Law Lounge',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      cuisineType: 'Premium',
      rating: 4.8,
      deliveryTime: '25-35 min',
      location: 'Middle Campus',
      featured: false,
      quickBites: false,
      budget: false,
      trending: true,
      groupDeals: true
    }
  ];

  // Filter vendors based on search query and selected campus
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vendor.cuisineType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampus = selectedCampus === 'all' || vendor.location === selectedCampus;
    return matchesSearch && matchesCampus;
  });

  // Get vendors by category
  const getVendorsByCategory = (category) => {
    switch(category) {
      case 'quickBites':
        return vendors.filter(vendor => vendor.quickBites);
      case 'budget':
        return vendors.filter(vendor => vendor.budget);
      case 'trending':
        return vendors.filter(vendor => vendor.trending);
      case 'groupDeals':
        return vendors.filter(vendor => vendor.groupDeals);
      case 'featured':
        return vendors.filter(vendor => vendor.featured);
      default:
        return vendors;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Campus Selection and Search */}
        <section className="bg-gradient-to-b from-white to-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white shadow-md rounded-xl p-6 -mt-16 relative z-10 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="campus" className="text-sm font-medium">Campus Location</Label>
                  <select 
                    id="campus"
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Campuses</option>
                    <option value="Upper Campus">Upper Campus</option>
                    <option value="Middle Campus">Middle Campus</option>
                    <option value="Lower Campus">Lower Campus</option>
                    <option value="Medical Campus">Medical Campus</option>
                  </select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="search" className="text-sm font-medium">Search for food or cuisine</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search for vendors, dishes, or cuisines..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#003b71]">Explore by Category</h2>
                <TabsList className="bg-white/80 backdrop-blur-sm">
                  <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                  <TabsTrigger value="quickBites" className="text-sm">Quick Bites</TabsTrigger>
                  <TabsTrigger value="budget" className="text-sm">Budget Meals</TabsTrigger>
                  <TabsTrigger value="trending" className="text-sm">Trending</TabsTrigger>
                  <TabsTrigger value="groupDeals" className="text-sm">Group Deals</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-8">
                {/* Quick Bites Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-xl font-semibold">Quick Bites (15min or less)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getVendorsByCategory('quickBites').slice(0, 3).map(vendor => (
                      <VendorCard
                        key={vendor.id}
                        id={vendor.id}
                        name={vendor.name}
                        image={vendor.image}
                        cuisineType={vendor.cuisineType}
                        rating={vendor.rating}
                        deliveryTime={vendor.deliveryTime}
                        location={vendor.location}
                        featured={vendor.featured}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Budget Meals Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Wallet className="h-5 w-5 text-green-500" />
                    <h3 className="text-xl font-semibold">Budget Meals (Under R50)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getVendorsByCategory('budget').slice(0, 3).map(vendor => (
                      <VendorCard
                        key={vendor.id}
                        id={vendor.id}
                        name={vendor.name}
                        image={vendor.image}
                        cuisineType={vendor.cuisineType}
                        rating={vendor.rating}
                        deliveryTime={vendor.deliveryTime}
                        location={vendor.location}
                        featured={vendor.featured}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Trending Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    <h3 className="text-xl font-semibold">Trending on Campus</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getVendorsByCategory('trending').slice(0, 3).map(vendor => (
                      <VendorCard
                        key={vendor.id}
                        id={vendor.id}
                        name={vendor.name}
                        image={vendor.image}
                        cuisineType={vendor.cuisineType}
                        rating={vendor.rating}
                        deliveryTime={vendor.deliveryTime}
                        location={vendor.location}
                        featured={vendor.featured}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Group Deals Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-blue-500" />
                    <h3 className="text-xl font-semibold">Group Deals</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getVendorsByCategory('groupDeals').slice(0, 3).map(vendor => (
                      <VendorCard
                        key={vendor.id}
                        id={vendor.id}
                        name={vendor.name}
                        image={vendor.image}
                        cuisineType={vendor.cuisineType}
                        rating={vendor.rating}
                        deliveryTime={vendor.deliveryTime}
                        location={vendor.location}
                        featured={vendor.featured}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="quickBites">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVendorsByCategory('quickBites').map(vendor => (
                    <VendorCard
                      key={vendor.id}
                      id={vendor.id}
                      name={vendor.name}
                      image={vendor.image}
                      cuisineType={vendor.cuisineType}
                      rating={vendor.rating}
                      deliveryTime={vendor.deliveryTime}
                      location={vendor.location}
                      featured={vendor.featured}
                    />
                  ))}
                </div>
                {getVendorsByCategory('quickBites').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No vendors found in this category.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="budget">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVendorsByCategory('budget').map(vendor => (
                    <VendorCard
                      key={vendor.id}
                      id={vendor.id}
                      name={vendor.name}
                      image={vendor.image}
                      cuisineType={vendor.cuisineType}
                      rating={vendor.rating}
                      deliveryTime={vendor.deliveryTime}
                      location={vendor.location}
                      featured={vendor.featured}
                    />
                  ))}
                </div>
                {getVendorsByCategory('budget').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No vendors found in this category.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="trending">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVendorsByCategory('trending').map(vendor => (
                    <VendorCard
                      key={vendor.id}
                      id={vendor.id}
                      name={vendor.name}
                      image={vendor.image}
                      cuisineType={vendor.cuisineType}
                      rating={vendor.rating}
                      deliveryTime={vendor.deliveryTime}
                      location={vendor.location}
                      featured={vendor.featured}
                    />
                  ))}
                </div>
                {getVendorsByCategory('trending').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No vendors found in this category.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="groupDeals">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getVendorsByCategory('groupDeals').map(vendor => (
                    <VendorCard
                      key={vendor.id}
                      id={vendor.id}
                      name={vendor.name}
                      image={vendor.image}
                      cuisineType={vendor.cuisineType}
                      rating={vendor.rating}
                      deliveryTime={vendor.deliveryTime}
                      location={vendor.location}
                      featured={vendor.featured}
                    />
                  ))}
                </div>
                {getVendorsByCategory('groupDeals').length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No vendors found in this category.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* UCT Specific Features */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#003b71] mb-8">Why UCT Eats?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#003b71]/5 to-[#003b71]/10 p-6 rounded-xl border border-[#003b71]/10">
                <div className="h-12 w-12 bg-[#003b71] rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Save Time Between Classes</h3>
                <p className="text-muted-foreground">Skip the queue and get food delivered exactly when you need it, so you never miss the start of a lecture.</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#8b0000]/5 to-[#8b0000]/10 p-6 rounded-xl border border-[#8b0000]/10">
                <div className="h-12 w-12 bg-[#8b0000] rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Campus-Specific Delivery</h3>
                <p className="text-muted-foreground">We know UCT inside out - including all the shortcuts, meeting spots, and hidden corners of campus.</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#ffd700]/5 to-[#ffd700]/10 p-6 rounded-xl border border-[#ffd700]/30">
                <div className="h-12 w-12 bg-[#ffd700] rounded-full flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-[#003b71]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Student-Friendly Prices</h3>
                <p className="text-muted-foreground">Lower fees than mainstream delivery apps, plus exclusive student discounts and promotions.</p>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <Badge className="bg-[#a7c6ed] text-[#003b71] hover:bg-[#a7c6ed]/80 mb-2">Coming Soon</Badge>
              <h3 className="text-lg font-semibold mb-2">Group Ordering</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Coordinate lunch with your study group! Share a link, everyone picks and pays for their own food, and it all arrives together.
              </p>
              <Button variant="outline" className="border-[#003b71] text-[#003b71]">
                Join the Waitlist
              </Button>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-[#003b71] to-[#003b71]/90 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Become a UCT Eats Courier</h2>
            <p className="max-w-2xl mx-auto mb-8">
              Earn money between classes by delivering food to fellow students. Flexible hours that work around your schedule.
            </p>
            <Button className="bg-white text-[#003b71] hover:bg-white/90">Apply Now</Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
