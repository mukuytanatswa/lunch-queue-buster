import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  });
}
