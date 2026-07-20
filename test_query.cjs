const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = supabaseUrlRaw.startsWith('http') ? supabaseUrlRaw : `https://${supabaseUrlRaw}.supabase.co`;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('artists').select('*, portfolio_images(*)').eq('is_guest', false);
  console.log('Error:', error);
  console.log('Data:', data ? data.length : null);
}

test();
