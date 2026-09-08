import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Restaurant } from '@/types/restaurant';

interface MapViewProps {
  restaurants: Restaurant[];
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress: (restaurant: Restaurant) => void;
}

export function RestaurantMapView({ restaurants, userLocation, onMarkerPress }: MapViewProps) {
  const getMapRegion = () => {
    if (!userLocation) {
      // Default to USVI center
      return {
        latitude: 18.3419,
        longitude: -64.9307,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }
    
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  };

  return (
    <MapView
      style={styles.map}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      region={getMapRegion()}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          coordinate={{
            latitude: restaurant.location.coordinates.latitude,
            longitude: restaurant.location.coordinates.longitude,
          }}
          title={restaurant.name}
          description={`${restaurant.cuisine.join(' • ')} • ${restaurant.priceLevel}`}
          onPress={() => onMarkerPress(restaurant)}
        >
          <View style={[
            styles.markerContainer,
            restaurant.isOpen ? styles.openMarker : styles.closedMarker
          ]}>
            <Text style={styles.markerText}>{restaurant.priceLevel}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  openMarker: {
    borderColor: '#4CAF50',
  },
  closedMarker: {
    borderColor: '#757575',
  },
  markerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});