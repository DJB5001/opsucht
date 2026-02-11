import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from './useOrders';

export function useFarmerOrders() {
  const { user } = useAuth();
  const { orders, loading } = useOrders();

  const acceptOrder = async (orderId: string) => {
    if (!user) return;

    const { error } = await supabase.from('user_order_progress').insert({
      order_id: orderId,
      user_id: user.id,
      status: 'accepted',
    });

    if (error) {
      console.error('Fehler beim Annehmen:', error);
    }
  };

  const updateProgress = async (orderId: string, blockId: string, amount: number) => {
    if (!user) return;

    // Find the progress entry for this user+order
    const { data: progress } = await supabase
      .from('user_order_progress')
      .select('id')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .single();

    if (!progress) return;

    // Upsert completed item
    const { data: existing } = await supabase
      .from('completed_items')
      .select('id')
      .eq('progress_id', progress.id)
      .eq('block_id', blockId)
      .single();

    if (existing) {
      await supabase
        .from('completed_items')
        .update({ amount })
        .eq('id', existing.id);
    } else {
      await supabase.from('completed_items').insert({
        progress_id: progress.id,
        block_id: blockId,
        amount,
      });
    }
  };

  const submitOrder = async (orderId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_order_progress')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Fehler beim Abgeben:', error);
    }
  };

  return { orders, loading, acceptOrder, updateProgress, submitOrder };
}
