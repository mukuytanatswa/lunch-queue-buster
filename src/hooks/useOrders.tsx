import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from './useCart';
import type { Tables } from '@/integrations/supabase/types';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;

export const useOrders = (status?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setOrders(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, status]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
  };
};

export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const createOrder = async (
    items: CartItem[],
    deliveryAddress: string,
    deliveryInstructions?: string,
    paymentMethod?: string
  ) => {
    if (!user || !profile) {
      throw new Error('User must be authenticated to create an order');
    }

    if (items.length === 0) {
      throw new Error('Cart cannot be empty');
    }

    // Check if all items are from the same vendor
    const vendorIds = Array.from(new Set(items.map(item => item.vendorId)));
    if (vendorIds.length > 1) {
      throw new Error('All items must be from the same vendor');
    }

    try {
      setLoading(true);

      const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const deliveryFee = 5.00; // Default delivery fee
      const tipAmount = 0; // Can be added later
      const totalAmount = subtotal + deliveryFee + tipAmount;

      // Generate order number and create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          customer_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          customer_phone: profile.phone,
          vendor_id: vendorIds[0],
          order_number: '', // Will be set by database trigger
          subtotal,
          delivery_fee: deliveryFee,
          tip_amount: tipAmount,
          total_amount: totalAmount,
          delivery_address: deliveryAddress,
          delivery_instructions: deliveryInstructions,
          payment_method: paymentMethod || 'card',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        special_instructions: item.specialInstructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: 'Order placed successfully!',
        description: `Your order #${orderData.order_number} has been placed.`,
      });

      return orderData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading,
  };
};