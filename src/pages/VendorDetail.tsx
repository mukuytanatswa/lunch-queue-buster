
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVendor } from '@/hooks/useVendors';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useCart } from '@/hooks/useCart';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Star, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags?: string[];
}

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { vendor, loading: vendorLoading, error: vendorError } = useVendor(id || '');
  const { menuItems, loading: menuLoading } = useMenuItems(id);
  const { addItem } = useCart();
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  const loading = vendorLoading || menuLoading;
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vendor Not Found</h2>
            <p className="mb-6 text-muted-foreground">
              {vendorError || 'Sorry, we couldn\'t find the vendor you\'re looking for.'}
            </p>
            <Button asChild>
              <Link to="/vendors">Browse Vendors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Transform menu items for compatibility
  const transformedMenuItems = menuItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price),
    image: item.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    tags: [
      ...(item.is_vegetarian ? ['Vegetarian'] : []),
      ...(item.is_vegan ? ['Vegan'] : []),
      ...(item.category ? [item.category] : [])
    ].filter(Boolean)
  }));
  
  const availableTags = Array.from(
    new Set(
      transformedMenuItems
        .flatMap(item => item.tags || [])
    )
  );
  
  const filteredMenu = filterTag 
    ? transformedMenuItems.filter(item => item.tags?.includes(filterTag))
    : transformedMenuItems;
    
  const handleAddToCart = (item: any) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      vendorId: vendor.id,
      vendorName: vendor.name
    });
    toast.success(`${item.name} added to cart`);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section with Vendor Image */}
        <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src={vendor.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80'}
            alt={vendor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <div className="container mx-auto">
              <Link 
                to="/vendors"
                className="inline-flex items-center text-white/80 hover:text-white mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Vendors
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                  {vendor.cuisine_type}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{vendor.rating || 0}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{vendor.delivery_time_min}-{vendor.delivery_time_max} min</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{vendor.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {/* Vendor Description */}
          <div className="mb-8">
            <p className="text-muted-foreground">{vendor.description || 'Delicious food delivered fresh to your location on campus.'}</p>
          </div>
          
          {/* Menu Category Filters */}
          <div className="mb-6 overflow-x-auto pb-2">
            <div className="flex space-x-2">
              <Badge 
                variant={!filterTag ? "default" : "outline"}
                className="cursor-pointer py-1 px-3"
                onClick={() => setFilterTag(null)}
              >
                All
              </Badge>
              {availableTags.map(tag => (
                <Badge 
                  key={tag}
                  variant={filterTag === tag ? "default" : "outline"}
                  className="cursor-pointer py-1 px-3"
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Menu Items */}
          <h2 className="text-2xl font-bold mb-4">Menu</h2>
          {filteredMenu.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenu.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <span className="font-medium text-primary">R{item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button 
                      className="w-full"
                      onClick={() => handleAddToCart(item)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDetail;
