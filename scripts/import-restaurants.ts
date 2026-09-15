// Bulk-imports real restaurants from a CSV (see docs/restaurant-data-guide.md
// for the column reference). Safe to re-run after fixing a row — matches
// existing restaurants by slug and updates them rather than duplicating.
//
// Usage: npm run db:import-restaurants
//     or: npx tsx scripts/import-restaurants.ts path/to/other.csv

import 'dotenv/config';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const csvPath = process.argv[2] || 'docs/restaurant-data-template.csv';
const ISLANDS = ['St. Thomas', 'St. John', 'St. Croix', 'Water Island'];
const PRICE_LEVELS = ['$', '$$', '$$$'];
const FEATURES = ['waterfront', 'parking', 'kid-friendly', 'live-music', 'outdoor-seating', 'wifi', 'takeout', 'delivery'];
const DIETARY_OPTIONS = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto'];
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitList(value: string, allowed: string[], field: string, errors: string[]): string[] {
  if (!value) return [];
  const items = value.split(';').map(s => s.trim()).filter(Boolean);
  for (const item of items) {
    if (!allowed.includes(item)) {
      errors.push(`${field} has unrecognized value "${item}" (allowed: ${allowed.join(', ')})`);
    }
  }
  return items;
}

function parseDayHours(value: string, day: string, errors: string[]): { open?: string; close?: string; closed?: boolean } {
  if (!value || value.trim().toLowerCase() === 'closed') {
    return { closed: true };
  }
  const parts = value.split('-').map(s => s.trim());
  if (parts.length !== 2 || !TIME_RE.test(parts[0]) || !TIME_RE.test(parts[1])) {
    errors.push(`${day} hours "${value}" isn't in HH:MM-HH:MM format (or "closed")`);
    return { closed: true };
  }
  return { open: parts[0], close: parts[1] };
}

function parseCoordinate(value: string, field: string, min: number, max: number, errors: string[]): number {
  const n = Number(value);
  if (value === '' || Number.isNaN(n) || n < min || n > max) {
    errors.push(`${field} "${value}" isn't a valid coordinate`);
    return 0;
  }
  return n;
}

interface Row {
  [key: string]: string;
}

interface RestaurantRowData {
  slug: string;
  name: string;
  description: string;
  island: string;
  cuisine: string[];
  price_level: string;
  rating: number;
  review_count: number;
  images: { hero: string; gallery: string[] };
  location: { address: string; coordinates: { latitude: number; longitude: number }; neighborhood?: string };
  contact: { phone?: string; website?: string; instagram?: string; facebook?: string };
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  features: string[];
  dietary_options: string[];
  is_open: boolean;
}

type BuildResult = { row: RestaurantRowData } | { error: string };

function buildRestaurantRow(row: Row, rowNum: number, seenSlugs: Set<string>): BuildResult {
  const errors: string[] = [];
  const name = row.name?.trim();
  if (!name) errors.push('name is required');

  let slug = row.slug?.trim() || (name ? slugify(name) : '');
  if (!slug) errors.push('could not determine a slug (name and slug are both empty)');
  if (slug && seenSlugs.has(slug)) {
    errors.push(`slug "${slug}" is used by an earlier row in this same file`);
  }

  const description = row.description?.trim();
  if (!description) errors.push('description is required');

  const island = row.island?.trim();
  if (!island || !ISLANDS.includes(island)) {
    errors.push(`island "${island}" must be one of: ${ISLANDS.join(', ')}`);
  }

  const priceLevel = row.price_level?.trim();
  if (!priceLevel || !PRICE_LEVELS.includes(priceLevel)) {
    errors.push(`price_level "${priceLevel}" must be one of: ${PRICE_LEVELS.join(', ')}`);
  }

  const address = row.address?.trim();
  if (!address) errors.push('address is required');

  const heroImageUrl = row.hero_image_url?.trim();
  if (!heroImageUrl) errors.push('hero_image_url is required');

  const cuisine = splitList(row.cuisine, [], 'cuisine', []); // free-form, no allowlist
  if (cuisine.length === 0) errors.push('cuisine is required (at least one)');

  const latitude = parseCoordinate(row.latitude, 'latitude', -90, 90, errors);
  const longitude = parseCoordinate(row.longitude, 'longitude', -180, 180, errors);

  const features = splitList(row.features, FEATURES, 'features', errors);
  const dietaryOptions = splitList(row.dietary_options, DIETARY_OPTIONS, 'dietary_options', errors);

  const hours: Record<string, { open?: string; close?: string; closed?: boolean }> = {};
  for (const day of DAYS) {
    hours[day] = parseDayHours(row[day], day, errors);
  }

  if (errors.length > 0) {
    return { error: `Row ${rowNum} (${name || 'unnamed'}): ${errors.join('; ')}` };
  }

  seenSlugs.add(slug);

  return {
    row: {
      slug,
      name,
      description,
      island,
      cuisine,
      price_level: priceLevel,
      rating: 0,
      review_count: 0,
      images: { hero: heroImageUrl, gallery: [] },
      location: {
        address,
        coordinates: { latitude, longitude },
        neighborhood: row.neighborhood?.trim() || undefined,
      },
      contact: {
        phone: row.phone?.trim() || undefined,
        website: row.website?.trim() || undefined,
        instagram: row.instagram?.trim() || undefined,
        facebook: row.facebook?.trim() || undefined,
      },
      hours,
      features,
      dietary_options: dietaryOptions,
      is_open: true,
    },
  };
}

async function main() {
  let csvContent: string;
  try {
    csvContent = readFileSync(csvPath, 'utf8');
  } catch {
    console.error(`Couldn't read ${csvPath}`);
    process.exit(1);
  }

  const records: Row[] = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

  if (records.length === 0) {
    console.log('No rows found in the CSV — nothing to import.');
    return;
  }

  const seenSlugs = new Set<string>();
  const validRows: RestaurantRowData[] = [];
  const rowErrors: string[] = [];

  records.forEach((row, i) => {
    const result = buildRestaurantRow(row, i + 2, seenSlugs); // +2: header row + 1-indexing
    if ('error' in result) {
      rowErrors.push(result.error);
    } else {
      validRows.push(result.row);
    }
  });

  if (rowErrors.length > 0) {
    console.log(`\n${rowErrors.length} row(s) skipped due to errors:\n`);
    rowErrors.forEach(e => console.log('  ✗ ' + e));
  }

  if (validRows.length === 0) {
    console.log('\nNo valid rows to import.');
    process.exit(rowErrors.length > 0 ? 1 : 0);
  }

  const supabase = createClient(supabaseUrl!, serviceRoleKey!);
  const { data, error } = await supabase
    .from('restaurants')
    .upsert(validRows, { onConflict: 'slug' })
    .select('name, slug');

  if (error) {
    console.error('\nImport failed:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log(`\n${data?.length ?? 0} restaurant(s) imported/updated:`);
  for (const r of data ?? []) {
    console.log(`  ✓ ${r.name} (${r.slug})`);
  }

  if (rowErrors.length > 0) {
    console.log(`\n${rowErrors.length} row(s) were skipped — fix them in the CSV and re-run.`);
    process.exitCode = 1;
  }
}

main();
