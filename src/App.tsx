
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Vendors from "./pages/Vendors";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import VendorDetail from "./pages/VendorDetail";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InviteAccept from "./pages/InviteAccept";
import GroupOrder from "./pages/GroupOrder";
import JoinGroupOrder from "./pages/JoinGroupOrder";
import OrderTracking from "./pages/OrderTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order/:id" element={<OrderDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/vendor/:id" element={<VendorDetail />} />
              <Route path="/vendor-dashboard" element={<VendorDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/invite" element={<InviteAccept />} />
              <Route path="/group-order/:id" element={<GroupOrder />} />
              <Route path="/join/:code" element={<JoinGroupOrder />} />
              <Route path="/orders/:orderId/track" element={<OrderTracking />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
