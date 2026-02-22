-- Pickup points (shared drop-off locations to reduce delivery cost)
CREATE TABLE IF NOT EXISTS public.pickup_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  campus_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders: delivery PIN, proof of delivery, pre-order, cancellation, pickup point, batch, payshap
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_pin text,
  ADD COLUMN IF NOT EXISTS proof_of_delivery_photo_url text,
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz,
  ADD COLUMN IF NOT EXISTS cancellation_deadline timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_batch_id uuid,
  ADD COLUMN IF NOT EXISTS payshap_reference text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'pickup_point_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN pickup_point_id uuid REFERENCES public.pickup_points(id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Promotions (vendor discounts / time-limited offers)
CREATE TABLE IF NOT EXISTS public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  code text,
  type text NOT NULL DEFAULT 'percentage',
  value numeric NOT NULL,
  min_order_amount numeric DEFAULT 0,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vendor payouts
CREATE TABLE IF NOT EXISTS public.vendor_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pickup points readable" ON public.pickup_points;
CREATE POLICY "Pickup points readable" ON public.pickup_points FOR SELECT USING (true);
DROP POLICY IF EXISTS "Promotions readable" ON public.promotions;
CREATE POLICY "Promotions readable" ON public.promotions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Promotions vendor all" ON public.promotions;
CREATE POLICY "Promotions vendor all" ON public.promotions FOR ALL USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);
DROP POLICY IF EXISTS "Vendor payouts read" ON public.vendor_payouts;
CREATE POLICY "Vendor payouts read" ON public.vendor_payouts FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid())
);

-- Backfill cancellation_deadline for existing orders
UPDATE public.orders SET cancellation_deadline = created_at + interval '10 minutes'
WHERE cancellation_deadline IS NULL AND status NOT IN ('delivered', 'cancelled');
