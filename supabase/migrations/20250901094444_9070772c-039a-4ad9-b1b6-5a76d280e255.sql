-- =============================================
-- QuickBite Launch-Ready Database Schema
-- Phase 1b: Additional Tables (skipping profiles)
-- =============================================

-- Create vendors table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  delivery_time_min INTEGER DEFAULT 20,
  delivery_time_max INTEGER DEFAULT 35,
  delivery_fee DECIMAL(10,2) DEFAULT 5.00,
  minimum_order DECIMAL(10,2) DEFAULT 20.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 10,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  allergens TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')),
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  tip_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Delivery details
  delivery_address TEXT NOT NULL,
  delivery_instructions TEXT,
  customer_phone TEXT,
  customer_name TEXT NOT NULL,
  
  -- Timing
  estimated_delivery_time TIMESTAMPTZ,
  pickup_time TIMESTAMPTZ,
  delivered_time TIMESTAMPTZ,
  
  -- Payment
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create driver_profiles table
CREATE TABLE IF NOT EXISTS public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('bicycle', 'scooter', 'car', 'motorcycle')),
  license_plate TEXT,
  is_online BOOLEAN DEFAULT false,
  current_location POINT,
  delivery_radius_km INTEGER DEFAULT 5,
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  bank_account_name TEXT,
  bank_account_number TEXT,
  bank_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  vendor_rating INTEGER CHECK (vendor_rating >= 1 AND vendor_rating <= 5),
  driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
  vendor_comment TEXT,
  driver_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all new tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendors
CREATE POLICY "vendors_select_all" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "vendors_insert_own" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vendors_update_own" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for menu_items
CREATE POLICY "menu_items_select_all" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_vendor" ON public.menu_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
CREATE POLICY "menu_items_update_vendor" ON public.menu_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);

-- Create RLS policies for orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id OR 
  auth.uid() = driver_id OR
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);
CREATE POLICY "orders_insert_customer" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "orders_update_involved" ON public.orders FOR UPDATE USING (
  auth.uid() = customer_id OR 
  auth.uid() = driver_id OR
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
);

-- Create RLS policies for order_items
CREATE POLICY "order_items_select_via_order" ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id AND (
      o.customer_id = auth.uid() OR 
      o.driver_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.vendors WHERE id = o.vendor_id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "order_items_insert_customer" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);

-- Create RLS policies for driver_profiles
CREATE POLICY "driver_profiles_select_own" ON public.driver_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "driver_profiles_insert_own" ON public.driver_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "driver_profiles_update_own" ON public.driver_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for reviews
CREATE POLICY "reviews_select_public" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_customer" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reviews_update_customer" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'QB-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;