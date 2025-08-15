import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterChips } from '@/components/FilterChips';
import { RestaurantMapView } from '@/components/MapView';
import { useRestaurants } from '@/hooks/use-restaurants';
import { ISLANDS, FEATURES, DIETARY_OPTIONS } from '@/constants/islands';
import { SearchFilters, Restaurant } from '@/types/restaurant';
import { MapPin, Filter, List, Map } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const { restaurants, isLoading, refetch, userLocation } = useRestaurants(filters);

  const handleIslandToggle = (island: string) => {
    setFilters(prev => ({
      ...prev,
      island: prev.island === island ? undefined : island,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => {
      const current = prev.features || [];
      const updated = current.includes(feature)
        ? current.filter(f => f !== feature)
        : [...current, feature];
      return { ...prev, features: updated.length > 0 ? updated : undefined };
    });
  };

  const handleDietaryToggle = (option: string) => {
    setFilters(prev => {
      const current = prev.dietaryOptions || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, dietaryOptions: updated.length > 0 ? updated : undefined };
    });
  };

  const handleOpenNowToggle = () => {
    setFilters(prev => ({ ...prev, openNow: !prev.openNow }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = 
    (filters.island ? 1 : 0) +
    (filters.features?.length || 0) +
    (filters.dietaryOptions?.length || 0) +
    (filters.openNow ? 1 : 0);

  const handleMarkerPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>Discovering restaurants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#00BCD4" />
            <Text style={styles.locationText}>U.S. Virgin Islands</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            >
              {viewMode === 'list' ? (
                <Map size={20} color="#666" />
              ) : (
                <List size={20} color="#666" />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color={showFilters ? '#00BCD4' : '#666'} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showFilters && (
        <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Islands</Text>
            <FilterChips
              chips={ISLANDS.map(i => ({ id: i.name, label: i.name, icon: i.emoji }))}
              selected={filters.island ? [filters.island] : []}
              onToggle={handleIslandToggle}
              multiSelect={false}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Features</Text>
            <FilterChips
              chips={[
                { id: 'open-now', label: 'Open Now', icon: '🟢' },
                ...FEATURES.map(f => ({ id: f.id, label: f.label, icon: f.icon }))
              ]}
              selected={[
                ...(filters.openNow ? ['open-now'] : []),
                ...(filters.features || [])
              ]}
              onToggle={(id) => {
                if (id === 'open-now') {
                  handleOpenNowToggle();
                } else {
                  handleFeatureToggle(id);
                }
              }}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Dietary Options</Text>
            <FilterChips
              chips={DIETARY_OPTIONS.map(d => ({ id: d.id, label: d.label, icon: d.icon }))}
              selected={filters.dietaryOptions || []}
              onToggle={handleDietaryToggle}
            />
          </View>

          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {viewMode === 'list' ? (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#00BCD4"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptyText}>Try adjusting your filters</Text>
            </View>
          }
        />
      ) : (
        <RestaurantMapView
          restaurants={restaurants}
          userLocation={userLocation}
          onMarkerPress={handleMarkerPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterButton: {
    position: 'relative',
    padding: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#00BCD4',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    maxHeight: 280,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterSection: {
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 4,
  },
  clearButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  list: {
    paddingVertical: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    padding: 8,
  },
});