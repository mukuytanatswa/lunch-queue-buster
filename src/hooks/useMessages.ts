import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export const useMessages = (orderId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['messages', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orderId && !!user,
    refetchInterval: 5000, // Poll every 5s for new messages
  });

  // Real-time subscription
  useEffect(() => {
    if (!orderId || !user) return;

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['messages', orderId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, user, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, receiverId, content }: { orderId: string; receiverId: string; content: string }) => {
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          receiver_id: receiverId,
          content,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.orderId] });
    },
  });
};
