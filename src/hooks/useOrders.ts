import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

interface PlaceOrderInput {
  vendorId: string;
  items: { menuItemId: string; name: string; quantity: number; unitPrice: number }[];
  deliveryAddress: string;
  deliveryInstructions?: string;
  customerName: string;
  customerPhone?: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
}

export const usePlaceOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!user) throw new Error('Must be logged in to place order');

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          vendor_id: input.vendorId,
          customer_name: input.customerName,
          customer_phone: input.customerPhone,
          delivery_address: input.deliveryAddress,
          delivery_instructions: input.deliveryInstructions,
          subtotal: input.subtotal,
          delivery_fee: input.deliveryFee,
          total_amount: input.totalAmount,
          order_number: '', // Will be auto-set by trigger
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
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

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
