
-- Fix infinite recursion in profiles by using a security definer function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'admin'::user_role
  )
$$;

-- Drop the recursive admin policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Fix infinite recursion in group_orders SELECT policy
-- The current policy references group_order_members which references group_orders back
DROP POLICY IF EXISTS "group_orders_select" ON public.group_orders;

CREATE POLICY "group_orders_select"
ON public.group_orders
FOR SELECT
USING (
  creator_id = auth.uid()
  OR status = 'open'
  OR id IN (
    SELECT group_order_id FROM public.group_order_members WHERE user_id = auth.uid()
  )
);

-- Fix group_order_items SELECT policy to avoid recursion through group_orders
DROP POLICY IF EXISTS "group_order_items_select" ON public.group_order_items;

CREATE POLICY "group_order_items_select"
ON public.group_order_items
FOR SELECT
USING (
  user_id = auth.uid()
  OR group_order_id IN (
    SELECT id FROM public.group_orders WHERE creator_id = auth.uid()
  )
);

-- Fix group_order_members SELECT policy to avoid recursion through group_orders
DROP POLICY IF EXISTS "group_order_members_select" ON public.group_order_members;

CREATE POLICY "group_order_members_select"
ON public.group_order_members
FOR SELECT
USING (
  user_id = auth.uid()
  OR group_order_id IN (
    SELECT id FROM public.group_orders WHERE creator_id = auth.uid()
  )
);
