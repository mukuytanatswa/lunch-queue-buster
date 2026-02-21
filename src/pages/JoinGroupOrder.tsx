import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const JoinGroupOrder = () => {
  const { code } = useParams<{ code: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      toast.error('Please sign in to join a group order');
      navigate('/auth');
      return;
    }

    const joinGroup = async () => {
      setJoining(true);
      try {
        // Find group order by invite code
        const { data: groupOrder, error: findError } = await supabase
          .from('group_orders')
          .select('id, status')
          .eq('invite_code', code!)
          .single();

        if (findError || !groupOrder) {
          toast.error('Invalid or expired invite link');
          navigate('/');
          return;
        }

        if (groupOrder.status !== 'open') {
          toast.error('This group order is no longer accepting members');
          navigate('/');
          return;
        }

        // Join as member
        const { error: joinError } = await supabase
          .from('group_order_members')
          .insert({
            group_order_id: groupOrder.id,
            user_id: user.id,
          });

        if (joinError && joinError.code === '23505') {
          // Already a member, just redirect
          navigate(`/group-order/${groupOrder.id}`);
          return;
        }

        if (joinError) throw joinError;

        toast.success('Joined group order!');
        navigate(`/group-order/${groupOrder.id}`);
      } catch (err) {
        toast.error('Failed to join group order');
        navigate('/');
      } finally {
        setJoining(false);
      }
    };

    joinGroup();
  }, [code, user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Joining group order...</p>
      </div>
    </div>
  );
};

export default JoinGroupOrder;
