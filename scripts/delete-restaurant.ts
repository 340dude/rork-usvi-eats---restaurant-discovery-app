// Deletes a restaurant from Supabase by slug — for permanently-closed restaurants
// that were previously imported. The CSV importer only upserts (adds/updates rows
// present in the CSV); it never deletes rows that are removed from the CSV. Use
// this script after removing a closed restaurant's row from
// docs/restaurant-data-template.csv to also remove it from the live DB.
//
// Usage: npx tsx scripts/delete-restaurant.ts <slug>
//    or: npx tsx scripts/delete-restaurant.ts --find "Restaurant Name"   (looks up slug by name, case-insensitive partial match)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npx tsx scripts/delete-restaurant.ts <slug>');
    console.error('   or: npx tsx scripts/delete-restaurant.ts --find "Restaurant Name"');
    process.exit(1);
  }

  let slug: string;

  if (args[0] === '--find') {
    const name = args[1];
    if (!name) {
      console.error('Usage: npx tsx scripts/delete-restaurant.ts --find "Restaurant Name"');
      process.exit(1);
    }
    const { data, error } = await supabase
      .from('restaurants')
      .select('name, slug')
      .ilike('name', `%${name}%`);
    if (error) {
      console.error('Lookup failed:', error.message);
      process.exit(1);
    }
    if (!data || data.length === 0) {
      console.log(`No restaurant found matching "${name}".`);
      process.exit(0);
    }
    if (data.length > 1) {
      console.log(`Multiple matches for "${name}" — re-run with the exact slug:`);
      data.forEach(r => console.log(`  ${r.name} (${r.slug})`));
      process.exit(1);
    }
    slug = data[0].slug;
    console.log(`Found: ${data[0].name} (${slug})`);
  } else {
    slug = args[0];
  }

  const { data: existing, error: findError } = await supabase
    .from('restaurants')
    .select('name, slug')
    .eq('slug', slug)
    .maybeSingle();

  if (findError) {
    console.error('Lookup failed:', findError.message);
    process.exit(1);
  }
  if (!existing) {
    console.log(`No restaurant with slug "${slug}" found — nothing to delete.`);
    process.exit(0);
  }

  const { error: deleteError } = await supabase
    .from('restaurants')
    .delete()
    .eq('slug', slug);

  if (deleteError) {
    console.error('Delete failed:', deleteError.message);
    process.exit(1);
  }

  console.log(`Deleted: ${existing.name} (${existing.slug})`);
}

main();
