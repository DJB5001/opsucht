import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AbsenceRequest } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useAbsences() {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAbsences = useCallback(async () => {
    const { data, error } = await supabase
      .from('absence_requests')
      .select('*, profile:profiles!user_id(username)')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Abwesenheiten:', error);
      return;
    }

    const mapped: AbsenceRequest[] = (data || []).map((a) => ({
      id: a.id,
      userId: a.user_id,
      username: (a.profile as { username: string } | null)?.username || 'Unbekannt',
      startDate: a.start_date,
      endDate: a.end_date,
      reason: a.reason,
      status: a.status as AbsenceRequest['status'],
      requestedAt: a.requested_at,
    }));

    setAbsences(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAbsences();

    const channel = supabase
      .channel('absences-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'absence_requests' }, () => fetchAbsences())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAbsences]);

  const createAbsence = async (startDate: string, endDate: string, reason: string) => {
    if (!user) return;

    const { error } = await supabase.from('absence_requests').insert({
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      reason,
    });

    if (error) {
      console.error('Fehler beim Erstellen der Abwesenheit:', error);
      return;
    }
    await fetchAbsences();
  };

  const approveAbsence = async (requestId: string) => {
    const { error } = await supabase
      .from('absence_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    if (error) {
      console.error('Fehler beim Genehmigen:', error);
      return;
    }
    await fetchAbsences();
  };

  const rejectAbsence = async (requestId: string) => {
    const { error } = await supabase
      .from('absence_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      console.error('Fehler beim Ablehnen:', error);
      return;
    }
    await fetchAbsences();
  };

  return { absences, loading, createAbsence, approveAbsence, rejectAbsence };
}
