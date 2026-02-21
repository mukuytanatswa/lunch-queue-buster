
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Star, Plus, Minus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useVendor, useMenuItems } from '@/hooks/useVendors';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendor, isLoading: vendorLoading } = useVendor(id || '');
  const { data: menuItems, isLoading: menuLoading } = useMenuItems(id || '');
  const { addItem } = useCart();
  const { user } = useAuth();
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [creatingGroup, setCreatingGroup] = useState(false);

  const categories = menuItems
    ? Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))
    : [];

  const filteredMenu = filterCategory
    ? menuItems?.filter(i => i.category === filterCategory)
    : menuItems;

  const handleAddToCart = (item: any) => {
    const qty = quantities[item.id] || 1;
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: qty,
      image: item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      vendorId: vendor!.id,
      vendorName: vendor!.name,
    });
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    toast.success(`${item.name} added to cart`);
  };

  const handleCreateGroupOrder = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setCreatingGroup(true);
    try {
      const { data, error } = await supabase
        .from('group_orders')
        .insert({
          creator_id: user.id,
          vendor_id: vendor!.id,
          name: `Group Order - ${vendor!.name}`,
        })
        .select()
        .single();

      if (error) throw error;

      // Join as member
      await supabase.from('group_order_members').insert({
        group_order_id: data.id,
        user_id: user.id,
      });

      navigate(`/group-order/${data.id}`);
      toast.success('Group order created! Share the link with friends.');
    } catch (err) {
      toast.error('Failed to create group order');
    } finally {
      setCreatingGroup(false);
    }
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vendor Not Found</h2>
            <p className="mb-6 text-muted-foreground">Sorry, we couldn't find the vendor.</p>
            <Button asChild><Link to="/vendors">Browse Vendors</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        {/* Hero */}
        <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img src={vendor.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200'} alt={vendor.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <div className="container mx-auto">
              <Link to="/vendors" className="inline-flex items-center text-white/80 hover:text-white mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Vendors
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30">{vendor.cuisine_type}</Badge>
                <div className="flex items-center"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" /><span>{Number(vendor.rating).toFixed(1)}</span></div>
                <div className="flex items-center"><Clock className="h-4 w-4 mr-1" /><span>{vendor.delivery_time_min}-{vendor.delivery_time_max} min</span></div>
                <div className="flex items-center"><MapPin className="h-4 w-4 mr-1" /><span>{vendor.location}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {vendor.description && <p className="text-muted-foreground mb-6">{vendor.description}</p>}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button variant="outline" onClick={handleCreateGroupOrder} disabled={creatingGroup}>
              <Users className="h-4 w-4 mr-2" />{creatingGroup ? 'Creating...' : 'Start Group Order'}
            </Button>
            <span className="text-sm text-muted-foreground">Min. order: R{Number(vendor.minimum_order).toFixed(2)} • Delivery: R{Number(vendor.delivery_fee).toFixed(2)}</span>
          </div>

          {/* Category Filters */}
          {categories.length > 0 && (
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex space-x-2">
                <Badge variant={!filterCategory ? "default" : "outline"} className="cursor-pointer py-1 px-3" onClick={() => setFilterCategory(null)}>All</Badge>
                {categories.map(cat => (
                  <Badge key={cat} variant={filterCategory === cat ? "default" : "outline"} className="cursor-pointer py-1 px-3" onClick={() => setFilterCategory(cat as string)}>{cat}</Badge>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4">Menu</h2>

          {menuLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu?.map(item => {
              const qty = quantities[item.id] || 0;
              return (
                <div key={item.id} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                  <div className="h-48 overflow-hidden">
                    <img src={item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="font-medium">R{Number(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                      {item.is_vegetarian && <Badge variant="secondary" className="text-xs">Vegetarian</Badge>}
                      {item.is_vegan && <Badge variant="secondary" className="text-xs">Vegan</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {qty > 0 ? (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantities(p => ({ ...p, [item.id]: Math.max(0, qty - 1) }))}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{qty}</span>
                          </>
                        ) : null}
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setQuantities(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {qty > 0 && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleAddToCart(item)}>
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredMenu?.length === 0 && !menuLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items available.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorDetail;
