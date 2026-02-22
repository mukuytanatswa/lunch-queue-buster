import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useVendorPayouts(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['vendor_payouts', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_payouts')
        .select('*')
        .eq('vendor_id', vendorId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
}
