
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock cart items for demo
const initialCartItems = [
  {
    id: '101',
    name: 'Classic Beef Burger',
    price: 55.00,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2300&q=80',
    vendorId: '1',
    vendorName: 'Food Science Café'
  },
  {
    id: '102',
    name: 'Chicken Wrap',
    price: 45.00,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2369&q=80',
    vendorId: '1',
    vendorName: 'Food Science Café'
  }
];

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 15.00;
  const serviceFee = 10.00;
  const total = subtotal + deliveryFee + serviceFee;
  
  const handleUpdateQuantity = (id: string, change: number) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };
  
  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from cart");
  };
  
  const handlePlaceOrder = () => {
    if (!deliveryLocation) {
      toast.error("Please provide a delivery location");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call for order placement
    setTimeout(() => {
      setIsLoading(false);
      setOrderPlaced(true);
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }, 1500);
  };
  
  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col page-transition">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 text-brand-400">
              <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild className="bg-brand-500 hover:bg-brand-600">
              <Link to="/vendors">Browse Vendors</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col page-transition">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-16">
        <Link 
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-brand-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue Shopping
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="flex gap-4 p-4 border rounded-lg bg-white"
              >
                <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="flex-grow space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 border rounded-lg bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>R{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>R{serviceFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-brand-500 hover:bg-brand-600"
                onClick={() => setIsCheckoutDialogOpen(true)}
              >
                Proceed to Checkout
              </Button>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  Your order will be delivered by student delivery partners
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Provide your delivery details to complete your order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Delivery Location <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <div className="bg-muted flex items-center px-3 rounded-l-md border border-r-0">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="location"
                  placeholder="Building and room number (e.g., Jameson Hall, Room 203)"
                  className="rounded-l-none"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="instructions" className="text-sm font-medium">
                Special Instructions (Optional)
              </label>
              <Textarea
                id="instructions"
                placeholder="Any special instructions for the delivery person"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="font-medium mb-2">Order Summary</div>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fees</span>
                  <span>R{(deliveryFee + serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-1 mt-1 border-t">
                  <span>Total</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCheckoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-brand-500 hover:bg-brand-600"
              onClick={handlePlaceOrder}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Order Placed Dialog */}
      <Dialog open={orderPlaced} onOpenChange={setOrderPlaced}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been successfully placed. We'll have it delivered to you soon.
            </p>
            <Button 
              asChild 
              className="bg-brand-500 hover:bg-brand-600"
            >
              <Link to="/orders">Track Your Order</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Cart;
