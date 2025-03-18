
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MenuItemCard from '@/components/MenuItemCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data for the vendor
const getVendorById = (id: string) => {
  const vendors = [
    {
      id: "1",
      name: "Food Science",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      cuisineType: "Fast Food",
      rating: 4.5,
      deliveryTime: "15-25 min",
      location: "Upper Campus",
      description: "Serving quick and delicious meals for students on the go. Our menu features a variety of burgers, wraps, and healthy options to fuel your day.",
      menu: [
        {
          id: "101",
          name: "Classic Beef Burger",
          description: "Juicy beef patty with lettuce, tomato, onion and our special sauce",
          price: 55.00,
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2300&q=80",
          tags: ["Popular", "Meat"]
        },
        {
          id: "102",
          name: "Chicken Wrap",
          description: "Grilled chicken, fresh vegetables and creamy sauce in a soft tortilla",
          price: 45.00,
          image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80",
          tags: ["Healthy"]
        },
        {
          id: "103",
          name: "Vegetarian Pasta",
          description: "Penne pasta with seasonal vegetables and rich tomato sauce",
          price: 50.00,
          image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80",
          tags: ["Vegetarian"]
        },
        {
          id: "104",
          name: "Greek Salad",
          description: "Fresh salad with feta cheese, olives, tomatoes and cucumber",
          price: 40.00,
          image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1684&q=80",
          tags: ["Vegetarian", "Healthy"]
        }
      ]
    },
    {
      id: "2",
      name: "Health Sciences Cafe",
      image: "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      cuisineType: "Healthy",
      rating: 4.2,
      deliveryTime: "20-30 min",
      location: "Medical Campus",
      description: "Nutritious meals made with fresh ingredients. Our menu is designed to provide balanced options for health-conscious students and staff.",
      menu: [
        {
          id: "201",
          name: "Protein Bowl",
          description: "Quinoa, grilled chicken, avocado, and mixed vegetables",
          price: 60.00,
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
          tags: ["High Protein", "Healthy"]
        },
        {
          id: "202",
          name: "Vegan Wrap",
          description: "Hummus, roasted vegetables and fresh greens in a whole wheat wrap",
          price: 45.00,
          image: "https://images.unsplash.com/photo-1635753022092-a7ebc8e6987b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1042&q=80",
          tags: ["Vegan", "Popular"]
        }
      ]
    },
    {
      id: "3",
      name: "Engineering Eatery",
      image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      cuisineType: "Mixed",
      rating: 4.7,
      deliveryTime: "10-20 min",
      location: "Upper Campus",
      description: "A diverse menu with something for everyone. From hearty comfort food to light snacks, we've got all your cravings covered.",
      menu: [
        {
          id: "301",
          name: "Loaded Nachos",
          description: "Corn chips topped with cheese, guacamole, sour cream and salsa",
          price: 50.00,
          image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80",
          tags: ["Sharing", "Popular"]
        },
        {
          id: "302",
          name: "Beef Lasagna",
          description: "Layers of pasta, beef mince, bechamel sauce and cheese",
          price: 65.00,
          image: "https://images.unsplash.com/photo-1619895092538-128341789043?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          tags: ["Hearty"]
        }
      ]
    },
    {
      id: "4",
      name: "Arts Cafe",
      image: "https://images.unsplash.com/photo-1559948271-7d5c98d1e415?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      cuisineType: "Cafe",
      rating: 4.0,
      deliveryTime: "15-25 min",
      location: "Middle Campus",
      description: "A creative space offering artisanal coffee and baked goods. The perfect spot to refuel during a study session or catch up with friends.",
      menu: [
        {
          id: "401",
          name: "Breakfast Bagel",
          description: "Toasted bagel with cream cheese, smoked salmon and capers",
          price: 55.00,
          image: "https://images.unsplash.com/photo-1592321675774-3de57f3ee0dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          tags: ["Breakfast"]
        },
        {
          id: "402",
          name: "Cappuccino",
          description: "Espresso with steamed milk and milk foam",
          price: 30.00,
          image: "https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          tags: ["Beverages", "Popular"]
        }
      ]
    }
  ];
  
  return vendors.find(vendor => vendor.id === id);
};

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
  const vendor = getVendorById(id || "");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vendor Not Found</h2>
            <p className="mb-6 text-muted-foreground">
              Sorry, we couldn't find the vendor you're looking for.
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
  
  const availableTags = Array.from(
    new Set(
      vendor.menu
        .flatMap(item => item.tags || [])
    )
  );
  
  const filteredMenu = filterTag 
    ? vendor.menu.filter(item => item.tags?.includes(filterTag))
    : vendor.menu;
    
  const handleAddToCart = (item: MenuItem) => {
    // In a real app, this would add to a cart context/state
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
            src={vendor.image}
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
                  {vendor.cuisineType}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>{vendor.rating}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{vendor.deliveryTime}</span>
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
            <p className="text-muted-foreground">{vendor.description}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    <span className="font-medium">R{item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  {item.tags && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button 
                    className="w-full bg-brand-500 hover:bg-brand-600"
                    onClick={() => handleAddToCart(item)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VendorDetail;
