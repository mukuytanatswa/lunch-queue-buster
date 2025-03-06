
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuItemCard from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Star, ArrowLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

// Temporary mock data
const vendors = [
  {
    id: '1',
    name: 'Food Science Café',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
    coverImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
    cuisineType: 'Fast Food & Coffee',
    rating: 4.8,
    deliveryTime: '10-15 min',
    location: 'Upper Campus, Food Science Building',
    phoneNumber: '+27 21 650 1234',
    description: 'Serving fresh and quick meals to students on the go. From sandwiches to hot meals, we have everything you need for a quick lunch between classes.',
    menu: {
      'Popular Items': [
        {
          id: '101',
          name: 'Classic Beef Burger',
          description: 'Juicy beef patty with lettuce, tomato, and special sauce',
          price: 55.00,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2300&q=80',
          popular: true
        },
        {
          id: '102',
          name: 'Chicken Wrap',
          description: 'Grilled chicken, fresh veggies, and sauce in a tortilla wrap',
          price: 45.00,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80',
          popular: true
        },
        {
          id: '103',
          name: 'Cappuccino',
          description: 'Rich espresso with steamed milk and foam',
          price: 30.00,
          image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          popular: true
        }
      ],
      'Mains': [
        {
          id: '104',
          name: 'Margherita Pizza',
          description: 'Classic tomato, mozzarella, and basil pizza',
          price: 65.00,
          image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          popular: false
        },
        {
          id: '105',
          name: 'Vegetable Pasta',
          description: 'Penne pasta with mixed vegetables in tomato sauce',
          price: 60.00,
          image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          popular: false
        },
        {
          id: '106',
          name: 'Chicken Schnitzel',
          description: 'Breaded chicken fillet served with fries and salad',
          price: 70.00,
          image: 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80',
          popular: false
        }
      ],
      'Sides': [
        {
          id: '107',
          name: 'French Fries',
          description: 'Crispy golden fries with salt',
          price: 25.00,
          image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          popular: false
        },
        {
          id: '108',
          name: 'Garden Salad',
          description: 'Fresh mixed greens with vinaigrette dressing',
          price: 35.00,
          image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2368&q=80',
          popular: false
        }
      ],
      'Beverages': [
        {
          id: '109',
          name: 'Fresh Orange Juice',
          description: 'Freshly squeezed orange juice',
          price: 25.00,
          image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          popular: false
        },
        {
          id: '110',
          name: 'Bottled Water',
          description: '500ml still water',
          price: 15.00,
          image: 'https://images.unsplash.com/photo-1564419320461-6870880221ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80',
          popular: false
        }
      ]
    }
  },
  // More vendors would be added here
];

const Vendor = () => {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<any | null>(null);
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      const foundVendor = vendors.find(v => v.id === id);
      setVendor(foundVendor || null);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleAddToCart = (itemId: string, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === itemId);
      if (existingItem) {
        return prev.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prev, { id: itemId, quantity }];
      }
    });
    
    toast.success("Item added to cart", {
      description: `${quantity} item(s) added to your order`
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-pulse-slow">Loading vendor details...</div>
      </div>
    );
  }
  
  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Vendor not found</h2>
        <Button asChild>
          <Link to="/vendors">Back to Vendors</Link>
        </Button>
      </div>
    );
  }

  const menuCategories = Object.keys(vendor.menu);
  
  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Vendor Hero Section */}
        <div className="relative h-[40vh] min-h-[300px]">
          <div className="absolute inset-0">
            <img 
              src={vendor.coverImage || vendor.image}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <Link 
              to="/vendors" 
              className="mb-auto mt-8 flex items-center text-white transition-colors hover:text-brand-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl overflow-hidden border-4 border-white bg-white shadow-md">
                <img 
                  src={vendor.image}
                  alt={vendor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-brand-500 hover:bg-brand-600">
                    {vendor.cuisineType}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{vendor.rating}</span>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{vendor.name}</h1>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 text-sm text-white/80">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{vendor.deliveryTime} delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{vendor.phoneNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vendor Menu Section */}
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground mb-8 max-w-2xl">
            {vendor.description}
          </p>
          
          <Tabs defaultValue={menuCategories[0]} className="w-full">
            <TabsList className="mb-6 flex flex-wrap">
              {menuCategories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {menuCategories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                {vendor.menu[category].map((item: any) => (
                  <MenuItemCard 
                    key={item.id}
                    {...item}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-40 animate-fade-in">
          <Button 
            asChild
            size="lg" 
            className="bg-brand-500 hover:bg-brand-600 shadow-lg px-6"
          >
            <Link to="/cart" className="flex items-center">
              <ShoppingBag className="mr-2 h-5 w-5" />
              <span>View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            </Link>
          </Button>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Vendor;
