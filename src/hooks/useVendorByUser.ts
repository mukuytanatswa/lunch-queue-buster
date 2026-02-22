import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Get vendor row for the current user (when profile.role === 'vendor'). */
export function useVendorByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['vendor_by_user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
