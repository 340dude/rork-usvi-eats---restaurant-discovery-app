// Sets (overwrites) a restaurant's `menu` jsonb column in Supabase from a local
// JSON file shaped as MenuCategory[] (see types/restaurant.ts). The CSV importer
// never touches `menu` (it always writes `[]` on import), so this is the way to
// seed/update text menus for individual restaurants without a schema change.
//
// Usage: npx tsx scripts/set-menu.ts <slug> <path-to-menu.json>
//    or: npx tsx scripts/set-menu.ts --find "Restaurant Name" <path-to-menu.json>

import 'dotenv/config';
import { readFileSync } from 'fs';
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
  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/set-menu.ts <slug> <path-to-menu.json>');
    console.error('   or: npx tsx scripts/set-menu.ts --find "Restaurant Name" <path-to-menu.json>');
    process.exit(1);
  }

  let slug: string;
  let menuPath: string;

  if (args[0] === '--find') {
    const name = args[1];
    menuPath = args[2];
    if (!name || !menuPath) {
      console.error('Usage: npx tsx scripts/set-menu.ts --find "Restaurant Name" <path-to-menu.json>');
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
      process.exit(1);
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
    menuPath = args[1];
  }

  const menu = JSON.parse(readFileSync(menuPath, 'utf-8'));
  if (!Array.isArray(menu)) {
    console.error('Menu JSON must be an array of MenuCategory objects.');
    process.exit(1);
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
    console.log(`No restaurant with slug "${slug}" found — nothing to update.`);
    process.exit(1);
  }

  const { error: updateError } = await supabase
    .from('restaurants')
    .update({ menu })
    .eq('slug', slug);

  if (updateError) {
    console.error('Update failed:', updateError.message);
    process.exit(1);
  }

  const itemCount = menu.reduce((n: number, cat: any) => n + (cat.items?.length ?? 0), 0);
  console.log(`Updated menu for ${existing.name} (${existing.slug}): ${menu.length} categories, ${itemCount} items.`);
}

main();
