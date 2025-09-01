-- =============================================
-- QuickBite Launch-Ready Database Schema
-- Phase 1c: Sample Data for Launch
-- =============================================

-- Insert sample vendors (only if none exist)
INSERT INTO public.vendors (name, description, cuisine_type, image_url, location, phone_number, email, is_active, is_featured, rating, total_reviews, delivery_time_min, delivery_time_max, delivery_fee, minimum_order)
SELECT 
  'UCT Cafeteria',
  'Your favorite campus dining spot offering fresh, affordable meals for students.',
  'Local Cuisine',
  '/placeholder.svg',
  'Upper Campus, Main Building',
  '+27 21 650 3622',
  'cafeteria@uct.ac.za',
  true,
  true,
  4.2,
  156,
  15,
  25,
  5.00,
  20.00
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = 'UCT Cafeteria')

UNION ALL

SELECT 
  'Jammie Shuttle Snacks',
  'Quick bites and drinks available during shuttle stops. Perfect for busy students.',
  'Snacks & Beverages',
  '/placeholder.svg',
  'Jammie Shuttle Stop',
  '+27 21 650 4444',
  'snacks@jammieshuttle.ac.za',
  true,
  false,
  3.8,
  89,
  5,
  15,
  3.00,
  15.00
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = 'Jammie Shuttle Snacks')

UNION ALL

SELECT 
  'Rondebosch Deli',
  'Fresh sandwiches, salads, and hot meals. Supporting local ingredients.',
  'Deli & Sandwiches',
  '/placeholder.svg',
  'Rondebosch Main Road',
  '+27 21 689 1234',
  'info@rondeboschdeli.co.za',
  true,
  true,
  4.5,
  203,
  20,
  35,
  8.00,
  25.00
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = 'Rondebosch Deli')

UNION ALL

SELECT 
  'Campus Corner Café',
  'Coffee, pastries, and light meals. Your study break destination.',
  'Café & Coffee',
  '/placeholder.svg',
  'Lower Campus, Science Building',
  '+27 21 650 5555',
  'hello@campuscorner.ac.za',
  true,
  false,
  4.0,
  127,
  10,
  20,
  4.00,
  18.00
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = 'Campus Corner Café')

UNION ALL

SELECT 
  'Groote Schuur Grill',
  'Hearty meals and grilled specialties. Perfect for post-lecture hunger.',
  'Grill & BBQ',
  '/placeholder.svg',
  'Groote Schuur Hospital Area',
  '+27 21 404 2222',
  'orders@grooteschuur-grill.co.za',
  true,
  true,
  4.3,
  178,
  25,
  40,
  10.00,
  30.00
WHERE NOT EXISTS (SELECT 1 FROM public.vendors WHERE name = 'Groote Schuur Grill');

-- Get vendor IDs for menu items (we'll use subqueries to find them)

-- Insert sample menu items for UCT Cafeteria
INSERT INTO public.menu_items (vendor_id, name, description, price, category, is_available, preparation_time, is_vegetarian, is_vegan, allergens)
SELECT 
  v.id,
  'Chicken Wrap',
  'Grilled chicken, lettuce, tomato, and mayo in a soft tortilla wrap',
  22.50,
  'Wraps',
  true,
  8,
  false,
  false,
  ARRAY['gluten', 'egg']
FROM public.vendors v 
WHERE v.name = 'UCT Cafeteria' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Chicken Wrap' AND mi.vendor_id = v.id
)

UNION ALL

SELECT 
  v.id,
  'Veggie Bowl',
  'Fresh quinoa bowl with roasted vegetables and tahini dressing',
  18.00,
  'Healthy',
  true,
  10,
  true,
  true,
  ARRAY['sesame']
FROM public.vendors v 
WHERE v.name = 'UCT Cafeteria' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Veggie Bowl' AND mi.vendor_id = v.id
)

UNION ALL

SELECT 
  v.id,
  'Classic Burger',
  'Beef patty with cheese, lettuce, tomato, and chips',
  28.00,
  'Burgers',
  true,
  12,
  false,
  false,
  ARRAY['gluten', 'dairy']
FROM public.vendors v 
WHERE v.name = 'UCT Cafeteria' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Classic Burger' AND mi.vendor_id = v.id
);

-- Insert sample menu items for other vendors
INSERT INTO public.menu_items (vendor_id, name, description, price, category, is_available, preparation_time, is_vegetarian, is_vegan, allergens)
SELECT 
  v.id,
  'Gourmet Sandwich',
  'Fresh turkey, avocado, and swiss cheese on artisan bread',
  24.00,
  'Sandwiches',
  true,
  6,
  false,
  false,
  ARRAY['gluten', 'dairy']
FROM public.vendors v 
WHERE v.name = 'Rondebosch Deli' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Gourmet Sandwich' AND mi.vendor_id = v.id
)

UNION ALL

SELECT 
  v.id,
  'Cappuccino',
  'Rich espresso with steamed milk and foam',
  12.00,
  'Beverages',
  true,
  4,
  true,
  false,
  ARRAY['dairy']
FROM public.vendors v 
WHERE v.name = 'Campus Corner Café' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Cappuccino' AND mi.vendor_id = v.id
)

UNION ALL

SELECT 
  v.id,
  'Grilled Chicken Breast',
  'Marinated chicken breast with seasonal vegetables',
  32.00,
  'Grilled',
  true,
  15,
  false,
  false,
  NULL
FROM public.vendors v 
WHERE v.name = 'Groote Schuur Grill' AND NOT EXISTS (
  SELECT 1 FROM public.menu_items mi WHERE mi.name = 'Grilled Chicken Breast' AND mi.vendor_id = v.id
);

-- Add indexes for better performance (only if they don't exist)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_cuisine_type ON public.vendors(cuisine_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_location ON public.vendors(location);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vendors_rating ON public.vendors(rating DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_category ON public.menu_items(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_price ON public.menu_items(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at DESC);