import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePromotionsByVendor(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['promotions', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('vendor_id', vendorId!)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('valid_until', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
}

/** For checkout: get active promotion by vendor and optional code */
export function usePromotionByCode(vendorId: string | undefined, code: string | null) {
  return useQuery({
    queryKey: ['promotion_code', vendorId, code],
    queryFn: async () => {
      if (!code?.trim()) return null;
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('vendor_id', vendorId!)
        .eq('is_active', true)
        .or(`code.eq.${code.trim()},code.is.null`)
        .gte('valid_until', new Date().toISOString())
        .lte('valid_from', new Date().toISOString())
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId && !!code?.trim(),
  });
}

export function useCreatePromotion(vendorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      code?: string;
      type: 'percentage' | 'fixed_amount';
      value: number;
      min_order_amount?: number;
      valid_until: string;
      valid_from?: string;
    }) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          vendor_id: vendorId,
          code: input.code || null,
          type: input.type,
          value: input.value,
          min_order_amount: input.min_order_amount ?? 0,
          valid_from: input.valid_from || new Date().toISOString(),
          valid_until: input.valid_until,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['promotions', vendorId] });
    },
  });
}
