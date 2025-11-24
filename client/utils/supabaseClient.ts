import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  console.warn('Using placeholder values - app will not work until credentials are set.');
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

export type Language = 'en' | 'gu' | 'hi';

export type PaymentMethod = 'google_pay' | 'bank_transfer' | 'cheque';

export type PaymentMethodRecord = {
  id: string;
  entry_id: string;
  user_id: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  bank_number?: string;
  cheque_number?: string;
  cheque_issuer_name?: string;
  payment_received_date: string;
  created_at: string;
  updated_at: string;
};

export type BananaEntry = {
  id: string;
  user_id: string;
  date: string;
  dealer_name?: string;
  location?: string;
  vehicle_number?: string;
  columns: ColumnData[];
  grand_total: number;
  rate_per_20kg: number;
  payment_due_date?: string;
  total_earned: number;
  created_at: string;
};

export type ColumnData = {
  columnNumber: number;
  rows: WeightRow[];
  columnTotal: number;
};

export type WeightRow = {
  weight: number;
  remark: string;
};

export const calculateTotalEarned = (grandTotalWeight: number, ratePer20kg: number): number => {
  return parseFloat(((grandTotalWeight / 20) * ratePer20kg).toFixed(2));
};
