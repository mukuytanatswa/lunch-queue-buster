import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { generateDeliveryPin } from '@/lib/delivery';

export const useOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (name, image_url)
          ),
          vendors (name, image_url)
        `)
        .eq('customer_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

/** Single order by ID (e.g. for tracking page) */
export function useOrderById(orderId: string | undefined) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*, menu_items (name, image_url)),
          vendors (name, image_url, location)
        `)
        .eq('id', orderId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'picked_up') updates.pickup_time = new Date().toISOString();
      if (status === 'delivered') {
        updates.delivered_time = new Date().toISOString();
        updates.proof_of_delivery_photo_url = null; // Can be set by driver separately
      }
      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['vendor_orders'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor_orders'] });
    },
  });
};

export const useSetProofOfDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, photoUrl }: { orderId: string; photoUrl: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          proof_of_delivery_photo_url: photoUrl,
          status: 'delivered',
          delivered_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['vendor_orders'] });
    },
  });
};

interface PlaceOrderInput {
  vendorId: string;
  items: { menuItemId: string; name: string; quantity: number; unitPrice: number }[];
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  totalAmount: number;
  paymentMethod?: 'payfast' | 'payshap';
  scheduledFor: string; // required — every order is a pre-order
  promotionCode?: string | null;
  payshapReference?: string | null;
}

export const usePlaceOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!user) throw new Error('Must be logged in to place order');

      const deliveryPin = generateDeliveryPin();
      const now = new Date();
      const cancellationDeadline = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          vendor_id: input.vendorId,
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          delivery_address: null,
          subtotal: input.subtotal,
          delivery_fee: 0,
          total_amount: input.totalAmount,
          order_number: '',
          status: 'pending',
          payment_status: input.paymentMethod === 'payshap' && input.payshapReference ? 'paid' : 'pending', // PayFast orders are marked paid via ITN webhook
          payment_method: input.paymentMethod || 'cash',
          delivery_pin: deliveryPin,
          cancellation_deadline: cancellationDeadline,
          scheduled_for: input.scheduledFor,
          pickup_point_id: null,
          payshap_reference: input.payshapReference || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = input.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return { ...order, delivery_pin: deliveryPin };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendor_orders'] });
    },
  });
};
