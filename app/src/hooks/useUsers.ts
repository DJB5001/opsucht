import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      return;
    }

    const mapped: User[] = (data || []).map((p) => ({
      id: p.id,
      username: p.username,
      role: p.role as User['role'],
      createdAt: p.created_at,
      createdBy: p.created_by ?? undefined,
    }));

    setUsers(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchUsers())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchUsers]);

  const createUser = async (username: string, password: string, role: User['role']): Promise<{ error?: string }> => {
    const email = `${username}@darknova.app`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    await fetchUsers();
    return {};
  };

  const deleteUser = async (userId: string): Promise<{ error?: string }> => {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      return { error: error.message };
    }

    await fetchUsers();
    return {};
  };

  return { users, loading, createUser, deleteUser };
}
