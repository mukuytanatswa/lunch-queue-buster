
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ClockIcon, 
  Package2Icon,
  CheckCircleIcon
} from "lucide-react";

const Orders = () => {
  const orders = [
    {
      id: "ORD-001",
      vendor: "Food Science",
      items: ["Beef Burger", "Fries", "Coke"],
      total: "R75.00",
      status: "delivered",
      date: "Today, 12:30 PM",
    },
    {
      id: "ORD-002",
      vendor: "Engineering Eatery",
      items: ["Chicken Wrap", "Water"],
      total: "R55.00",
      status: "in-progress",
      date: "Today, 1:15 PM",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your current and past orders
            </p>
          </div>
          
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package2Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't placed any orders yet. Start ordering from your favorite campus vendors!
                </p>
                <Button asChild>
                  <a href="/vendors">Browse Vendors</a>
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-6 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">{order.date}</span>
                      <h3 className="text-lg font-medium">{order.vendor}</h3>
                      <p className="text-sm text-muted-foreground">Order #{order.id}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      {order.status === "delivered" ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span>Delivered</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-brand-600">
                          <ClockIcon className="h-5 w-5 mr-2" />
                          <span>In Progress</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <h4 className="font-medium mb-2">Items</h4>
                    <ul className="text-sm space-y-1">
                      {order.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">{order.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;
