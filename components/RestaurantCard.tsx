import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { router } from 'expo-router';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/restaurant/${restaurant.id}`);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: restaurant.images.hero }} style={styles.image} />
      
      {restaurant.isOpen !== undefined && (
        <View style={[styles.badge, restaurant.isOpen ? styles.openBadge : styles.closedBadge]}>
          <Text style={styles.badgeText}>{restaurant.isOpen ? 'Open' : 'Closed'}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.rating}>
            <Star size={14} color="#FFB800" fill="#FFB800" />
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
            <Text style={styles.reviewCount}>({restaurant.reviewCount})</Text>
          </View>
        </View>
        
        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine.join(' • ')}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.location}>
            <MapPin size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {restaurant.location.neighborhood || restaurant.island}
            </Text>
          </View>
          
          <View style={styles.meta}>
            {restaurant.distance && (
              <Text style={styles.distance}>{restaurant.distance.toFixed(1)} mi</Text>
            )}
            <Text style={styles.price}>{restaurant.priceLevel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#4CAF50',
  },
  closedBadge: {
    backgroundColor: '#757575',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00BCD4',
  },
});