import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useMenuItems = (vendorId: string) => {
  return useQuery({
    queryKey: ['menu_items', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_available', true)
        .order('category');

      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
};

/** All items including unavailable — for vendor dashboard management */
export const useAllMenuItems = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ['menu_items_all', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('vendor_id', vendorId!)
        .order('category')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!vendorId,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      vendor_id: string;
      name: string;
      price: number;
      description?: string;
      category?: string;
      image_url?: string;
      is_available?: boolean;
    }) => {
      const { data, error } = await supabase.from('menu_items').insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu_items_all', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['menu_items', data.vendor_id] });
    },
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vendor_id, ...updates }: {
      id: string;
      vendor_id: string;
      name?: string;
      price?: number;
      description?: string;
      category?: string;
      image_url?: string;
      is_available?: boolean;
    }) => {
      const { data, error } = await supabase.from('menu_items').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu_items_all', data.vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['menu_items', data.vendor_id] });
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vendor_id }: { id: string; vendor_id: string }) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      return { vendor_id };
    },
    onSuccess: (_, { vendor_id }) => {
      queryClient.invalidateQueries({ queryKey: ['menu_items_all', vendor_id] });
      queryClient.invalidateQueries({ queryKey: ['menu_items', vendor_id] });
    },
  });
};
