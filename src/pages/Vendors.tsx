
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";
import { useVendors } from "@/hooks/useVendors";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const Vendors = () => {
  const { data: vendors, isLoading, error } = useVendors();
  const [search, setSearch] = useState('');

  const filtered = vendors?.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.cuisine_type.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Campus Vendors</h1>
            <p className="text-muted-foreground mb-4">
              Order from your favorite food spots across UCT campus
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors, cuisines..."
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load vendors</p>
              <p className="text-muted-foreground text-sm">Please try again later</p>
            </div>
          )}

          {filtered && filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vendors found matching your search.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((vendor) => (
              <VendorCard
                key={vendor.id}
                id={vendor.id}
                name={vendor.name}
                image={vendor.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'}
                cuisineType={vendor.cuisine_type}
                rating={Number(vendor.rating) || 0}
                deliveryTime={`${vendor.delivery_time_min}-${vendor.delivery_time_max} min`}
                location={vendor.location}
                featured={vendor.is_featured || false}
              />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vendors;
