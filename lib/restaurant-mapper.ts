import { Restaurant } from '@/types/restaurant';

// Shape of a row in the Supabase `restaurants` table (see supabase/schema.sql).
export interface RestaurantRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  island: string;
  cuisine: string[];
  price_level: string;
  rating: number;
  review_count: number;
  images: Restaurant['images'];
  location: Restaurant['location'];
  contact: Restaurant['contact'];
  hours: Restaurant['hours'];
  features: string[];
  dietary_options: string[];
  menu: Restaurant['menu'];
  is_open: boolean;
  updated_at: string;
}

export function rowToRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    island: row.island as Restaurant['island'],
    cuisine: row.cuisine,
    priceLevel: row.price_level as Restaurant['priceLevel'],
    rating: row.rating,
    reviewCount: row.review_count,
    images: row.images,
    location: row.location,
    contact: row.contact,
    hours: row.hours,
    features: row.features,
    dietaryOptions: row.dietary_options,
    menu: row.menu,
    lastUpdated: row.updated_at,
    isOpen: row.is_open,
  };
}

// Partial because updates can touch a subset of fields (e.g. just the profile form).
export function restaurantToRow(restaurant: Partial<Restaurant>): Partial<RestaurantRow> {
  const row: Partial<RestaurantRow> = {};

  if (restaurant.id !== undefined) row.id = restaurant.id;
  if (restaurant.slug !== undefined) row.slug = restaurant.slug;
  if (restaurant.name !== undefined) row.name = restaurant.name;
  if (restaurant.description !== undefined) row.description = restaurant.description;
  if (restaurant.island !== undefined) row.island = restaurant.island;
  if (restaurant.cuisine !== undefined) row.cuisine = restaurant.cuisine;
  if (restaurant.priceLevel !== undefined) row.price_level = restaurant.priceLevel;
  if (restaurant.rating !== undefined) row.rating = restaurant.rating;
  if (restaurant.reviewCount !== undefined) row.review_count = restaurant.reviewCount;
  if (restaurant.images !== undefined) row.images = restaurant.images;
  if (restaurant.location !== undefined) row.location = restaurant.location;
  if (restaurant.contact !== undefined) row.contact = restaurant.contact;
  if (restaurant.hours !== undefined) row.hours = restaurant.hours;
  if (restaurant.features !== undefined) row.features = restaurant.features;
  if (restaurant.dietaryOptions !== undefined) row.dietary_options = restaurant.dietaryOptions;
  if (restaurant.menu !== undefined) row.menu = restaurant.menu;
  if (restaurant.isOpen !== undefined) row.is_open = restaurant.isOpen;

  return row;
}
