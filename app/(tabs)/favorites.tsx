import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurants, useFavorites } from '@/hooks/use-restaurants';
import { router } from 'expo-router';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();
  const { restaurants } = useRestaurants();
  
  const favoriteRestaurants = restaurants.filter(r => favorites.includes(r.id));

  if (favoriteRestaurants.length === 0) {
    return (
      <View style={styles.empty}>
        <Heart size={64} color="#E0E0E0" />
        <Text style={styles.emptyTitle}>No favorites yet</Text>
        <Text style={styles.emptyText}>
          Start exploring and save your favorite restaurants
        </Text>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => router.push('/(tabs)')}
        >
          <MapPin size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Explore Restaurants</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favoriteRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>
              {favoriteRestaurants.length} {favoriteRestaurants.length === 1 ? 'Restaurant' : 'Restaurants'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  count: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});