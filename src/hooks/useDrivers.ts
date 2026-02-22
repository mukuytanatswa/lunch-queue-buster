import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/** Online drivers for assignment (is_online = true). */
export function useOnlineDrivers() {
  return useQuery({
    queryKey: ['drivers_online'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*, profiles!driver_profiles_user_id_fkey(first_name, last_name, phone)')
        .eq('is_online', true);
      if (error) throw error;
      return data;
    },
  });
}

/** Simpler: driver_profiles only (profiles FK may not exist). */
export function useOnlineDriverProfiles() {
  return useQuery({
    queryKey: ['driver_profiles_online'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('is_online', true);
      if (error) throw error;
      return data;
    },
  });
}

export function useDriverProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['driver_profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateDriverStatus(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      const { data: existing } = await supabase.from('driver_profiles').select('id').eq('user_id', userId!).maybeSingle();
      if (!existing) {
        const { error: insertErr } = await supabase.from('driver_profiles').insert({ user_id: userId!, is_online: isOnline });
        if (insertErr) throw insertErr;
        return;
      }
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: isOnline, updated_at: new Date().toISOString() })
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver_profiles_online'] });
      qc.invalidateQueries({ queryKey: ['driver_profile', userId] });
    },
  });
}

export function useUpdateDriverLocation(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (location: { lat: number; lng: number }) => {
      const { error } = await supabase
        .from('driver_profiles')
        .update({
          current_location: location,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver_profile', userId] });
      qc.invalidateQueries({ queryKey: ['driver_profiles_online'] });
    },
  });
}

export function useAssignDriverToOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, driverId }: { orderId: string; driverId: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: (_, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['vendor_orders'] });
      qc.invalidateQueries({ queryKey: ['order', orderId] });
      qc.invalidateQueries({ queryKey: ['driver_available_orders'] });
      qc.invalidateQueries({ queryKey: ['driver_my_orders'] });
    },
  });
}

/** Orders ready for pickup with no driver assigned (for driver app) */
export function useUnassignedReadyOrders() {
  return useQuery({
    queryKey: ['driver_available_orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*, menu_items (name, price)),
          vendors (name, location)
        `)
        .is('driver_id', null)
        .in('status', ['ready', 'confirmed'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

/** Orders assigned to current driver (for driver app) */
export function useDriverAssignedOrders(driverUserId: string | undefined) {
  return useQuery({
    queryKey: ['driver_my_orders', driverUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*, menu_items (name, price)),
          vendors (name, location)
        `)
        .eq('driver_id', driverUserId!)
        .in('status', ['confirmed', 'preparing', 'ready', 'picked_up'])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!driverUserId,
  });
}
