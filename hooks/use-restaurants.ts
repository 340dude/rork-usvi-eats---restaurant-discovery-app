import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Restaurant, SearchFilters } from '@/types/restaurant';
import { mockRestaurants } from '@/mocks/restaurants';
import * as Location from 'expo-location';

const FAVORITES_KEY = 'usvi-eats-favorites';
const CACHED_RESTAURANTS_KEY = 'usvi-eats-cached-restaurants';

// Helper to check if restaurant is currently open
const isRestaurantOpen = (hours: Restaurant['hours']): boolean => {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const currentHours = hours[currentDay];
  
  if (!currentHours || currentHours.closed || !currentHours.open || !currentHours.close) return false;
  
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const [openHour, openMin] = currentHours.open.split(':').map(Number);
  const [closeHour, closeMin] = currentHours.close.split(':').map(Number);
  const openTime = openHour * 100 + openMin;
  const closeTime = closeHour * 100 + closeMin;
  
  return currentTime >= openTime && currentTime <= closeTime;
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

  const restaurantsQuery = useQuery({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      // In production, this would fetch from API
      // For now, return mock data with calculated fields
      const restaurants = mockRestaurants.map(restaurant => ({
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant.hours),
        distance: userLocation ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          restaurant.location.coordinates.latitude,
          restaurant.location.coordinates.longitude
        ) : undefined,
      }));

      // Cache for offline use
      await AsyncStorage.setItem(CACHED_RESTAURANTS_KEY, JSON.stringify(restaurants));
      
      return restaurants;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter restaurants based on search criteria
  const filteredRestaurants = useMemo(() => {
    if (!restaurantsQuery.data) return [];
    
    let filtered = [...restaurantsQuery.data];
    
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
      // In production, fetch from API
      const restaurant = mockRestaurants.find(r => r.id === id);
      if (!restaurant) throw new Error('Restaurant not found');
      
      return {
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant.hours),
      };
    },
  });
};