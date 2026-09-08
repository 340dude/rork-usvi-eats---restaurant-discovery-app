import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { router } from 'expo-router';

interface RestaurantCardCompactProps {
  restaurant: Restaurant;
}

const CARD_WIDTH = 168;

// Smaller, fixed-width card for horizontal carousels on the Discover
// section of the Explore tab. Deliberately a distinct component from
// RestaurantCard (which is full-width and used for vertical list/search
// results) rather than a variant, since the two have different layout
// constraints (fixed width + shorter image vs. flexible width).
export const RestaurantCardCompact: React.FC<RestaurantCardCompactProps> = ({ restaurant }) => {
  const accessibilityLabel = [
    restaurant.name,
    restaurant.cuisine.join(', '),
    restaurant.priceLevel,
    restaurant.reviewCount > 0 ? `rated ${restaurant.rating} stars` : null,
    restaurant.isOpen === undefined ? null : (restaurant.isOpen ? 'open' : 'closed'),
  ].filter(Boolean).join(', ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View>
        <Image source={{ uri: restaurant.images.hero }} style={styles.image} accessible={false} />
        {restaurant.isOpen !== undefined && (
          <View style={[styles.badge, restaurant.isOpen ? styles.openBadge : styles.closedBadge]}>
            <Text style={styles.badgeText}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <View style={styles.metaRow}>
          {restaurant.reviewCount > 0 && (
            <>
              <Star size={11} color="#FFB800" fill="#FFB800" />
              <Text style={styles.rating}>{restaurant.rating}</Text>
              <Text style={styles.dot}>·</Text>
            </>
          )}
          <Text style={styles.price}>{restaurant.priceLevel}</Text>
        </View>
        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine.join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: CARD_WIDTH,
    height: 100,
    backgroundColor: '#f0f0f0',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  openBadge: {
    backgroundColor: '#4CAF50',
  },
  closedBadge: {
    backgroundColor: '#757575',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dot: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
  },
  cuisine: {
    fontSize: 11,
    color: '#888',
  },
});
