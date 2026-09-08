# Adding real restaurant data

Fill in [`docs/restaurant-data-template.csv`](./restaurant-data-template.csv) with real restaurants (one per row), then run the import. Open the CSV in Excel, Google Sheets, or Numbers — just make sure to **export/save as CSV** when you're done editing (not .xlsx).

## Columns

| Column | Required? | Format | Notes |
|---|---|---|---|
| `name` | Yes | text | e.g. `The Sunset Grille` |
| `slug` | No | text | Leave blank and I'll generate one from the name (e.g. `the-sunset-grille`). Only fill this in if you want a specific URL-friendly ID. |
| `description` | Yes | text | One or two sentences. |
| `island` | Yes | one of: `St. Thomas`, `St. John`, `St. Croix`, `Water Island` | Must match exactly (including the period after "St"). |
| `cuisine` | Yes | semicolon-separated | e.g. `Caribbean;Seafood;American` |
| `price_level` | Yes | `$`, `$$`, or `$$$` | |
| `address` | Yes | text | Full street address. |
| `neighborhood` | No | text | e.g. `Red Hook`, `Christiansted` |
| `latitude` | Yes | decimal | See "Finding coordinates" below. Needed for the distance/sort-by-nearby feature. |
| `longitude` | Yes | decimal | Same. |
| `phone` | No | text | e.g. `(340) 555-0123` |
| `website` | No | URL | |
| `instagram` | No | text | Handle, e.g. `@restaurantname` |
| `facebook` | No | text | Page name |
| `hero_image_url` | Yes | URL | See "Photos" below — this is the one real gap right now. |
| `features` | No | semicolon-separated | Any of: `waterfront`, `parking`, `kid-friendly`, `live-music`, `outdoor-seating`, `wifi`, `takeout`, `delivery` |
| `dietary_options` | No | semicolon-separated | Any of: `vegan`, `vegetarian`, `gluten-free`, `dairy-free`, `keto` |
| `monday` … `sunday` | Yes (each day) | `HH:MM-HH:MM` or `closed` | 24-hour time, e.g. `11:00-22:00`. Use `closed` for days they're not open. |

### Example row (don't paste this into the CSV — just for reference)

```
name: The Sunset Grille
description: Waterfront dining with stunning sunset views. Fresh seafood daily.
island: St. Thomas
cuisine: Caribbean;Seafood;American
price_level: $$
address: 123 Waterfront Drive, Charlotte Amalie, St. Thomas 00802
neighborhood: Charlotte Amalie
latitude: 18.3419
longitude: -64.9307
phone: (340) 555-0123
hero_image_url: https://example.com/photos/sunset-grille.jpg
features: waterfront;parking;outdoor-seating
dietary_options: vegetarian;gluten-free
monday: 11:00-22:00
tuesday: 11:00-22:00
wednesday: 11:00-22:00
thursday: 11:00-23:00
friday: 11:00-23:00
saturday: 10:00-23:00
sunday: closed
```

## Finding coordinates

Right-click a restaurant's location on [Google Maps](https://maps.google.com), and the top of the context menu shows the latitude/longitude (e.g. `18.3419, -64.9307`) — click it to copy. Paste the first number into `latitude`, the second into `longitude`.

## Photos — the one real gap

The app doesn't have a photo upload feature yet — `hero_image_url` needs a link to an already-hosted image. Options:
- A photo already on the restaurant's own website (right-click the image → Copy Image Address)
- Their Google Business Profile or Facebook page photos (same trick)
- A free image host like [Imgur](https://imgur.com) if you have photo files but nowhere to host them

If you want actual photo *uploads* built into the admin screens (so restaurant owners can upload directly instead of pasting a URL), that's a real feature we haven't built — let me know and I can scope it separately.

## Running the import

Once the CSV is filled in and saved:

```bash
npm run db:import-restaurants
```

This reads `docs/restaurant-data-template.csv`, validates each row, and adds/updates restaurants in Supabase (matched by slug — safe to re-run after fixing a row). It prints a clear pass/fail report per row; nothing partially-invalid gets silently skipped.

New restaurants start unclaimed (no owner) — link a real owner to their listing the same way as before:

```bash
npx tsx scripts/assign-owner.ts owner@example.com their-restaurant-slug
```
