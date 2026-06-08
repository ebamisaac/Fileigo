const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection to:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('documents').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Connection established. Document count check passed.');
    }
  } catch (err) {
    console.error('Fetch/Network Error:', err.message);
  }
}

test();
