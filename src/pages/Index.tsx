
import { useState, useEffect } from 'react';
import HeroSection from '@/components/HeroSection';
import VendorCard from '@/components/VendorCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Utensils, ShoppingBag, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// Temporary mock data
const vendors = [
  {
    id: '1',
    name: 'Food Science Café',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
    cuisineType: 'Fast Food & Coffee',
    rating: 4.8,
    deliveryTime: '10-15 min',
    location: 'Upper Campus',
    featured: true
  },
  {
    id: '2',
    name: 'Arts Block Deli',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2371&q=80',
    cuisineType: 'Sandwiches & Salads',
    rating: 4.5,
    deliveryTime: '15-20 min',
    location: 'Upper Campus',
    featured: false
  },
  {
    id: '3',
    name: 'Medical School Canteen',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2374&q=80',
    cuisineType: 'Hearty Meals',
    rating: 4.3,
    deliveryTime: '15-25 min',
    location: 'Health Sciences',
    featured: false
  },
  {
    id: '4',
    name: 'Student Union Grill',
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
    cuisineType: 'Burgers & Grills',
    rating: 4.7,
    deliveryTime: '12-18 min',
    location: 'Middle Campus',
    featured: true
  }
];

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // For scroll animations
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Featured Vendors Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Vendors</h2>
                <p className="text-muted-foreground">Order from our most popular campus vendors</p>
              </div>
              <Button asChild variant="outline" className="mt-4 md:mt-0 group">
                <Link to="/vendors" className="flex items-center">
                  View All Vendors
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendors.map((vendor, index) => (
                <VendorCard
                  key={vendor.id}
                  {...vendor}
                  className={`fade-in stagger-${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-16 px-4 bg-brand-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Skip the long lunch queues and get your food delivered in three simple steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: <Utensils className="h-8 w-8 text-brand-500" />,
                  title: "Choose Your Food",
                  description: "Browse vendors across campus and select your favorite meals"
                },
                {
                  icon: <ShoppingBag className="h-8 w-8 text-brand-500" />,
                  title: "Place Your Order",
                  description: "Add items to your cart and checkout securely"
                },
                {
                  icon: <Check className="h-8 w-8 text-brand-500" />,
                  title: "Get It Delivered",
                  description: "Our delivery partner will bring your order right to you"
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm fade-in"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="h-16 w-16 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
              {[
                { value: "10+", label: "Campus Vendors" },
                { value: "15-25", label: "Minutes Delivery" },
                { value: "500+", label: "Daily Orders" },
                { value: "30+", label: "Minutes Saved" }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 bg-brand-50 rounded-xl fade-in"
                  style={{ animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="text-4xl font-bold text-brand-600 mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
              Ready to skip the queue and make the most of your lunch break?
            </h2>
            <p className="mb-8 text-white/80 max-w-xl mx-auto">
              Join hundreds of UCT students and staff who are saving time every day.
            </p>
            <Button asChild size="lg" className="bg-white text-brand-600 hover:bg-white/90">
              <Link to="/vendors">Order Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
