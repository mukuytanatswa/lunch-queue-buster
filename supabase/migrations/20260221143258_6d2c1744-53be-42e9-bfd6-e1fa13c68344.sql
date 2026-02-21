
-- Create group_order_members table FIRST (referenced by group_orders policy)
CREATE TABLE public.group_order_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  nickname text,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (group_order_id, user_id)
);

ALTER TABLE public.group_order_members ENABLE ROW LEVEL SECURITY;

-- Create group_orders table
CREATE TABLE public.group_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  vendor_id uuid REFERENCES public.vendors(id),
  name text NOT NULL DEFAULT 'Group Order',
  invite_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  status text NOT NULL DEFAULT 'open',
  delivery_address text,
  delivery_instructions text,
  expires_at timestamptz DEFAULT (now() + interval '2 hours'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.group_orders ENABLE ROW LEVEL SECURITY;

-- Now add the FK constraint on group_order_members
ALTER TABLE public.group_order_members
  ADD CONSTRAINT group_order_members_group_order_id_fkey
  FOREIGN KEY (group_order_id) REFERENCES public.group_orders(id) ON DELETE CASCADE;

-- Group orders policies
CREATE POLICY "group_orders_select"
ON public.group_orders FOR SELECT
TO authenticated
USING (
  creator_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_order_members
    WHERE group_order_id = group_orders.id AND user_id = auth.uid()
  ) OR
  status = 'open'
);

CREATE POLICY "group_orders_insert"
ON public.group_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "group_orders_update"
ON public.group_orders FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id);

-- Group order members policies
CREATE POLICY "group_order_members_select"
ON public.group_order_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_orders
    WHERE id = group_order_members.group_order_id AND creator_id = auth.uid()
  )
);

CREATE POLICY "group_order_members_insert"
ON public.group_order_members FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_order_members_delete"
ON public.group_order_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create group_order_items table
CREATE TABLE public.group_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_order_id uuid REFERENCES public.group_orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  menu_item_id uuid REFERENCES public.menu_items(id),
  quantity integer NOT NULL DEFAULT 1,
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.group_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_order_items_select"
ON public.group_order_items FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.group_orders
    WHERE id = group_order_items.group_order_id AND creator_id = auth.uid()
  )
);

CREATE POLICY "group_order_items_insert"
ON public.group_order_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_order_items_update"
ON public.group_order_items FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "group_order_items_delete"
ON public.group_order_items FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
