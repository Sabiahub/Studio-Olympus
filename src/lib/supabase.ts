import { createClient } from '@supabase/supabase-js';

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseUrl = supabaseUrlRaw.startsWith('http') ? supabaseUrlRaw : `https://${supabaseUrlRaw}.supabase.co`;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';


export const supabase = createClient(supabaseUrl, supabaseKey);

