import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing Supabase URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function ensureBucket() {
  const { data, error } = await supabase.storage.createBucket('documents', {
    public: false
  });
  if (error && error.status !== 409) {
    console.error("Bucket creation error:", error);
    process.exit(1);
  }
  console.log('Bucket "documents" is ready.', data?.name ?? "already existed");
}

ensureBucket()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
