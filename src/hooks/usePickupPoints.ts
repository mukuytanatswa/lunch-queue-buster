import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePickupPoints() {
  return useQuery({
    queryKey: ['pickup_points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pickup_points')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });
}
