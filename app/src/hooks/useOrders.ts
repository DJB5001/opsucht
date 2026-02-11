import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { FarmOrder, OrderItem, UserOrderProgress } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<FarmOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from('farm_orders')
      .select(`
        *,
        order_items (*),
        user_order_progress (
          *,
          completed_items (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Aufträge:', error);
      return;
    }

    const mapped: FarmOrder[] = (data || []).map((order) => ({
      id: order.id,
      items: (order.order_items || []).map((item: { block_id: string; amount: number; unit: string }) => ({
        blockId: item.block_id,
        amount: item.amount,
        unit: item.unit as OrderItem['unit'],
      })),
      startDate: order.start_date,
      deadline: order.deadline,
      status: order.status as FarmOrder['status'],
      autoAssign: order.auto_assign,
      createdBy: order.created_by,
      createdAt: order.created_at,
      notes: order.notes ?? undefined,
      userProgress: (order.user_order_progress || []).map((p: {
        user_id: string;
        status: string;
        completed_items: { block_id: string; amount: number }[];
        submitted_at: string | null;
        confirmed_at: string | null;
        confirmed_by: string | null;
      }) => ({
        userId: p.user_id,
        status: p.status as UserOrderProgress['status'],
        completedItems: (p.completed_items || []).map((ci: { block_id: string; amount: number }) => ({
          blockId: ci.block_id,
          amount: ci.amount,
        })),
        submittedAt: p.submitted_at ?? undefined,
        confirmedAt: p.confirmed_at ?? undefined,
        confirmedBy: p.confirmed_by ?? undefined,
      })),
    }));

    setOrders(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'farm_orders' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_order_progress' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completed_items' }, () => fetchOrders())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const createOrder = async (orderData: Omit<FarmOrder, 'id' | 'createdAt' | 'userProgress'>) => {
    if (!user) return;

    const { data: newOrder, error: orderError } = await supabase
      .from('farm_orders')
      .insert({
        start_date: orderData.startDate,
        deadline: orderData.deadline,
        status: orderData.status,
        auto_assign: orderData.autoAssign,
        created_by: user.id,
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error('Fehler beim Erstellen des Auftrags:', orderError);
      return;
    }

    if (orderData.items.length > 0) {
      const { error: itemsError } = await supabase.from('order_items').insert(
        orderData.items.map((item) => ({
          order_id: newOrder.id,
          block_id: item.blockId,
          amount: item.amount,
          unit: item.unit,
        }))
      );
      if (itemsError) console.error('Fehler beim Erstellen der Auftragsposten:', itemsError);
    }

    if (orderData.autoAssign) {
      const { data: farmers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'farmer');

      if (farmers && farmers.length > 0) {
        const { error: progressError } = await supabase.from('user_order_progress').insert(
          farmers.map((f) => ({
            order_id: newOrder.id,
            user_id: f.id,
            status: 'accepted',
          }))
        );
        if (progressError) console.error('Fehler bei Auto-Zuweisung:', progressError);
      }
    }

    await fetchOrders();
  };

  const deleteOrder = async (orderId: string) => {
    const { error } = await supabase.from('farm_orders').delete().eq('id', orderId);
    if (error) {
      console.error('Fehler beim Löschen des Auftrags:', error);
      return;
    }
    await fetchOrders();
  };

  const confirmOrder = async (orderId: string, userId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_order_progress')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
      })
      .eq('order_id', orderId)
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Bestätigen:', error);
      return;
    }
    await fetchOrders();
  };

  return { orders, loading, createOrder, deleteOrder, confirmOrder };
}
