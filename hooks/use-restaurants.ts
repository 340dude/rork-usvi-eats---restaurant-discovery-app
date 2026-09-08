import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Restaurant, SearchFilters } from '@/types/restaurant';
import { supabase } from '@/lib/supabase';
import { rowToRestaurant, restaurantToRow, RestaurantRow } from '@/lib/restaurant-mapper';
import { useAuth } from '@/hooks/use-auth';
import * as Location from 'expo-location';

const FAVORITES_KEY = 'usvi-eats-favorites';
const CACHED_RESTAURANTS_KEY = 'usvi-eats-cached-restaurants';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const toMinutesOfDay = (time: string): number => {
  const [hour, min] = time.split(':').map(Number);
  return hour * 100 + min;
};

// Helper to check if restaurant is currently open. Handles hours that cross
// midnight (e.g. open 17:00, close 02:00) two ways: today's own opening has
// no upper bound once it's known to run past midnight (closeTime <= openTime),
// and separately, we check whether we're still inside *yesterday's*
// overnight tail (e.g. it's 1am and yesterday didn't close until 2am).
const isRestaurantOpen = (hours: Restaurant['hours']): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const todayHours = hours[DAY_NAMES[now.getDay()]];
  if (todayHours && !todayHours.closed && todayHours.open && todayHours.close) {
    const openTime = toMinutesOfDay(todayHours.open);
    const closeTime = toMinutesOfDay(todayHours.close);
    const crossesMidnight = closeTime <= openTime;
    if (currentTime >= openTime && (crossesMidnight || currentTime <= closeTime)) return true;
  }

  const yesterdayHours = hours[DAY_NAMES[(now.getDay() + 6) % 7]];
  if (yesterdayHours && !yesterdayHours.closed && yesterdayHours.open && yesterdayHours.close) {
    const openTime = toMinutesOfDay(yesterdayHours.open);
    const closeTime = toMinutesOfDay(yesterdayHours.close);
    if (closeTime <= openTime && currentTime <= closeTime) return true;
  }

  return false;
};

// Calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// `menu` is the overwhelmingly largest field on a restaurant row (every
// category/item/description/price) and isn't used anywhere in the list/card
// UI — only search-by-dish-name needs it. Browsing (Explore/Favorites, or a
// blank search query) uses this slim column set; measured ~79% smaller than
// select('*') on a realistic-size dataset.
const LIST_COLUMNS = 'id,slug,name,description,island,cuisine,price_level,rating,review_count,images,location,contact,hours,features,dietary_options,is_open,updated_at';

async function fetchRestaurantsList(): Promise<Restaurant[]> {
  const { data, error } = await supabase.from('restaurants').select(LIST_COLUMNS);

  if (error) {
    // Fall back to the last successful fetch so the app stays usable offline.
    const cached = await AsyncStorage.getItem(CACHED_RESTAURANTS_KEY);
    if (cached) return JSON.parse(cached);
    throw error;
  }

  const restaurants = (data as Omit<RestaurantRow, 'menu'>[]).map(row => rowToRestaurant({ ...row, menu: [] }));
  await AsyncStorage.setItem(CACHED_RESTAURANTS_KEY, JSON.stringify(restaurants));
  return restaurants;
}

// Only fetched once the user actually types a search query, so dish-name
// matching stays available without paying the full menu payload on every
// app open.
async function fetchRestaurantsFull(): Promise<Restaurant[]> {
  const { data, error } = await supabase.from('restaurants').select('*');

  if (error) {
    const cached = await AsyncStorage.getItem(CACHED_RESTAURANTS_KEY);
    if (cached) return JSON.parse(cached);
    throw error;
  }

  const restaurants = (data as RestaurantRow[]).map(rowToRestaurant);
  await AsyncStorage.setItem(CACHED_RESTAURANTS_KEY, JSON.stringify(restaurants));
  return restaurants;
}

export const useRestaurants = (filters?: SearchFilters) => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Use browser geolocation API for web
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.log('Location error:', error);
          }
        );
      }
    } else {
      // Use expo-location for mobile
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      })();
    }
  }, []);

  // A non-empty search query needs dish-name matching, which requires menu
  // data — switch to the full fetch only then, cached separately so browsing
  // (the common case) never pays for it.
  const needsFullData = !!filters?.query;

  const restaurantsQuery = useQuery({
    queryKey: ['restaurants', needsFullData ? 'full' : 'list'],
    queryFn: needsFullData ? fetchRestaurantsFull : fetchRestaurantsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  // Derive open/closed + distance client-side, then apply search filters
  const filteredRestaurants = useMemo(() => {
    if (!restaurantsQuery.data) return [];

    let filtered = restaurantsQuery.data.map(restaurant => ({
      ...restaurant,
      isOpen: isRestaurantOpen(restaurant.hours),
      distance: userLocation ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurant.location.coordinates.latitude,
        restaurant.location.coordinates.longitude
      ) : undefined,
    }));

    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.some(c => c.toLowerCase().includes(query)) ||
        r.description.toLowerCase().includes(query) ||
        r.menu.some(cat =>
          cat.items.some(item =>
            item.name.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
          )
        )
      );
    }

    if (filters?.island) {
      filtered = filtered.filter(r => r.island === filters.island);
    }

    if (filters?.cuisine) {
      filtered = filtered.filter(r => r.cuisine.includes(filters.cuisine!));
    }

    if (filters?.priceLevel && filters.priceLevel.length > 0) {
      filtered = filtered.filter(r => filters.priceLevel!.includes(r.priceLevel));
    }

    if (filters?.features && filters.features.length > 0) {
      filtered = filtered.filter(r =>
        filters.features!.every(f => r.features.includes(f))
      );
    }

    if (filters?.dietaryOptions && filters.dietaryOptions.length > 0) {
      filtered = filtered.filter(r =>
        filters.dietaryOptions!.every(d => r.dietaryOptions.includes(d))
      );
    }

    if (filters?.openNow) {
      filtered = filtered.filter(r => r.isOpen);
    }

    // Sort by distance if location is available
    if (userLocation) {
      filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return filtered;
  }, [restaurantsQuery.data, filters, userLocation]);

  return {
    restaurants: filteredRestaurants,
    isLoading: restaurantsQuery.isLoading,
    error: restaurantsQuery.error,
    refetch: restaurantsQuery.refetch,
    userLocation,
  };
};

export const useFavorites = () => {
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async (restaurantId: string) => {
      const current = favoritesQuery.data || [];
      const updated = current.includes(restaurantId)
        ? current.filter((id: string) => id !== restaurantId)
        : [...current, restaurantId];

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['favorites'], data);
    },
  });

  return {
    favorites: favoritesQuery.data || [],
    toggleFavorite: toggleFavorite.mutate,
    isFavorite: (id: string) => (favoritesQuery.data || []).includes(id),
  };
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const restaurant = rowToRestaurant(data as RestaurantRow);
      return {
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant.hours),
      };
    },
    enabled: !!id,
    retry: false,
  });
};

// The restaurant owned by the signed-in admin user. A given owner is
// expected to have at most one restaurant for now (see scripts/assign-owner.ts);
// `data` is `null` once loaded if none is linked yet.
export const useMyRestaurant = () => {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['restaurant', 'mine', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const restaurant = rowToRestaurant(data as RestaurantRow);
      return {
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant.hours),
      };
    },
    enabled: !!userId,
  });
};

// Persists admin edits (profile, hours, menu, etc.) back to Supabase.
// Until restaurant-owner auth exists, any caller can update any restaurant —
// see the note in supabase/schema.sql.
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Restaurant> }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update(restaurantToRow(updates))
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return rowToRestaurant(data as RestaurantRow);
    },
    onSuccess: (restaurant) => {
      queryClient.setQueryData(['restaurant', restaurant.id], restaurant);
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};
