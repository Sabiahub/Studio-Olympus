import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseUrl = supabaseUrlRaw.startsWith('http') ? supabaseUrlRaw : `https://${supabaseUrlRaw}.supabase.co`;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key
// This client bypasses RLS and can perform admin actions (like managing users)
// IMPORTANT: NEVER use this client on the frontend, only in Server Actions or Route Handlers!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
