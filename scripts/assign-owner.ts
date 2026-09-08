// Links an already-registered auth user to a restaurant, since there's no
// self-serve "claim your restaurant" flow yet.
//
// Usage: npx tsx scripts/assign-owner.ts <owner-email> <restaurant-slug>
// Requires .env with EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [email, slug] = process.argv.slice(2);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

if (!email || !slug) {
  console.error('Usage: npx tsx scripts/assign-owner.ts <owner-email> <restaurant-slug>');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function assignOwner() {
  // supabase-js has no "get user by email" admin call, so page through and match.
  let user: { id: string; email?: string } | undefined;
  let page = 1;
  while (!user) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error('Failed to list users:', error.message);
      process.exit(1);
    }
    user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (data.users.length < 200) break;
    page += 1;
  }

  if (!user) {
    console.error(`No auth user found with email ${email}. They need to sign up in the app first.`);
    process.exit(1);
  }

  const { data: restaurant, error: updateError } = await supabase
    .from('restaurants')
    .update({ owner_id: user.id })
    .eq('slug', slug)
    .select('id, name, slug')
    .single();

  if (updateError) {
    console.error('Failed to assign owner:', updateError.message);
    process.exit(1);
  }

  console.log(`Linked ${email} to "${restaurant.name}" (${restaurant.slug})`);
}

assignOwner();
