import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMyVendor = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my_vendor', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

/** Orders for a vendor - vendors use this to track their orders */
export function useVendorOrders(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor_orders', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*, menu_items (name, image_url))
        `)
        .eq('vendor_id', vendorId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
    refetchInterval: 10000,
  });
}

export const useVendorMenuItems = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor_menu_items', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('category');
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
};

export const useUpdateVendorOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'delivered') updates.delivered_time = new Date().toISOString();
      if (status === 'picked_up') updates.pickup_time = new Date().toISOString();

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAddMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      vendor_id: string;
      name: string;
      description?: string;
      price: number;
      category?: string;
      image_url?: string;
      is_available?: boolean;
      is_vegetarian?: boolean;
      is_vegan?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_menu_items'] });
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
    },
  });
};

export const useUpdateVendorMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor_menu_items'] });
      queryClient.invalidateQueries({ queryKey: ['menu_items'] });
    },
  });
};
