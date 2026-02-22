
-- Create messages table for driver-customer chat
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "messages_insert" ON public.messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update" ON public.messages
FOR UPDATE USING (auth.uid() = receiver_id);

CREATE INDEX idx_messages_order_id ON public.messages(order_id);
CREATE INDEX idx_messages_participants ON public.messages(sender_id, receiver_id);
