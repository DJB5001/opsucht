export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          role: 'admin' | 'farmer' | 'viewer';
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id: string;
          username: string;
          role?: 'admin' | 'farmer' | 'viewer';
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          role?: 'admin' | 'farmer' | 'viewer';
          created_at?: string;
          created_by?: string | null;
        };
      };
      farm_orders: {
        Row: {
          id: string;
          start_date: string;
          deadline: string;
          status: 'open' | 'in_progress' | 'completed';
          auto_assign: boolean;
          created_by: string;
          created_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          start_date: string;
          deadline: string;
          status?: 'open' | 'in_progress' | 'completed';
          auto_assign?: boolean;
          created_by: string;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          start_date?: string;
          deadline?: string;
          status?: 'open' | 'in_progress' | 'completed';
          auto_assign?: boolean;
          created_by?: string;
          created_at?: string;
          notes?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          block_id: string;
          amount: number;
          unit: 'dk' | 'kisten';
        };
        Insert: {
          id?: string;
          order_id: string;
          block_id: string;
          amount: number;
          unit?: 'dk' | 'kisten';
        };
        Update: {
          id?: string;
          order_id?: string;
          block_id?: string;
          amount?: number;
          unit?: 'dk' | 'kisten';
        };
      };
      user_order_progress: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          status: 'accepted' | 'in_progress' | 'submitted' | 'confirmed';
          submitted_at: string | null;
          confirmed_at: string | null;
          confirmed_by: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          status?: 'accepted' | 'in_progress' | 'submitted' | 'confirmed';
          submitted_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          status?: 'accepted' | 'in_progress' | 'submitted' | 'confirmed';
          submitted_at?: string | null;
          confirmed_at?: string | null;
          confirmed_by?: string | null;
        };
      };
      completed_items: {
        Row: {
          id: string;
          progress_id: string;
          block_id: string;
          amount: number;
        };
        Insert: {
          id?: string;
          progress_id: string;
          block_id: string;
          amount?: number;
        };
        Update: {
          id?: string;
          progress_id?: string;
          block_id?: string;
          amount?: number;
        };
      };
      absence_requests: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          status: 'pending' | 'approved' | 'rejected';
          requested_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          reason: string;
          status?: 'pending' | 'approved' | 'rejected';
          requested_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          status?: 'pending' | 'approved' | 'rejected';
          requested_at?: string;
        };
      };
    };
    Functions: {
      get_my_role: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
