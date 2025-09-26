
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorCard from "@/components/VendorCard";

const vendors = [
  {
    id: "1",
    name: "Food Science",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    cuisineType: "Fast Food",
    rating: 4.5,
    deliveryTime: "15-25 min",
    location: "Upper Campus"
  },
  {
    id: "2",
    name: "Health Sciences Cafe",
    image: "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    cuisineType: "Healthy",
    rating: 4.2,
    deliveryTime: "20-30 min",
    location: "Medical Campus",
    featured: true
  },
  {
    id: "3",
    name: "Engineering Eatery",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    cuisineType: "Mixed",
    rating: 4.7,
    deliveryTime: "10-20 min",
    location: "Upper Campus"
  },
  {
    id: "4",
    name: "Arts Cafe",
    image: "https://images.unsplash.com/photo-1559948271-7d5c98d1e415?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    cuisineType: "Cafe",
    rating: 4.0,
    deliveryTime: "15-25 min",
    location: "Middle Campus"
  }
];

const Vendors = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Campus Vendors</h1>
            <p className="text-muted-foreground">
              Order from your favorite food spots across UCT campus
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} {...vendor} />
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Vendors;
