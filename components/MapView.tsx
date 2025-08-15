import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Restaurant } from '@/types/restaurant';

interface MapViewProps {
  restaurants: Restaurant[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (restaurant: Restaurant) => void;
}

// Web fallback component
export function RestaurantMapView({ restaurants }: MapViewProps) {
  return (
    <View style={styles.webFallback}>
      <Text style={styles.webFallbackText}>Map view is not available on web</Text>
      <Text style={styles.webFallbackSubtext}>
        {restaurants.length} restaurants found
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  webFallbackText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 14,
    color: '#999',
  },
});