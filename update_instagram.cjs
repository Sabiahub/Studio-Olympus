const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

// Ignorar erro de SSL local do Node (UNABLE_TO_VERIFY_LEAF_SIGNATURE)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const supabaseUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrl = supabaseUrlRaw.startsWith('http') ? supabaseUrlRaw : `https://${supabaseUrlRaw}.supabase.co`;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  { name: 'Bruxa', instagram: 'artana.bruxa' },
  { name: 'Caio', instagram: 'caiocesar.ttt' },
  { name: 'Fera', instagram: 'amaral.ink' },
  { name: 'Glass', instagram: 'glass_ink15' },
  { name: 'Jottas', instagram: 'inkjottas' },
  { name: 'Joao', instagram: 'joaoserraink' },
  { name: 'João', instagram: 'joaoserraink' },
  { name: 'Leon', instagram: 'leonkstano_' },
  { name: 'Luan', instagram: 'luanksttano.ink' },
  { name: 'Lusca', instagram: 'luscatattoo' },
  { name: 'Manu', instagram: 'amanuprata' },
  { name: 'Marcella', instagram: 'resendemarcella.tattoo' },
  { name: 'Marcellus', instagram: 'marcellusdiaztattoo' },
  { name: 'Maria', instagram: 'mariaclaratatuadora' },
  { name: 'Passati', instagram: 'passatitattoo' },
  { name: 'Ruana', instagram: 'ruanadiaztattoo' },
  { name: 'Rubi', instagram: 'rubbikx' }
];

async function updateHandles() {
  console.log("Iniciando atualizações...");
  for (const { name, instagram } of updates) {
    const { error } = await supabase
      .from('artists')
      .update({ instagram })
      .ilike('name', `%${name}%`);
      
    if (error) {
      console.error(`Erro ao atualizar ${name}:`, error.message);
    } else {
      console.log(`Sucesso: ${name} -> @${instagram}`);
    }
  }
  console.log("Concluído!");
}

updateHandles();
