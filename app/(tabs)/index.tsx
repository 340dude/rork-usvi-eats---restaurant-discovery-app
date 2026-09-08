import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterChips } from '@/components/FilterChips';
import { CarouselSection } from '@/components/CarouselSection';
import { RestaurantMapView } from '@/components/MapView';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useRestaurants } from '@/hooks/use-restaurants';
import { REGION_NAME, ISLANDS, FEATURES, DIETARY_OPTIONS } from '@/constants/islands';
import { SearchFilters, Restaurant } from '@/types/restaurant';
import { MapPin, Filter, List, Map, WifiOff } from 'lucide-react-native';
import { router } from 'expo-router';

const CAROUSEL_SIZE = 10;
const ISLAND_CAROUSEL_SIZE = 8;

export default function ExploreScreen() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // Discover = curated carousels (the default, so opening the app doesn't
  // dump 200+ restaurants at once). Browse = the full flat list, entered
  // either explicitly ("Browse all") or automatically once a filter chip
  // narrows the set to something worth scrolling through directly.
  const [browseMode, setBrowseMode] = useState(false);

  const { restaurants, isLoading, error, refetch, userLocation } = useRestaurants(filters);

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

  // Any active filter is a signal the user wants a specific narrowed list,
  // not the curated overview — show it as a flat list rather than trying to
  // fit it into carousel sections.
  const showingList = browseMode || activeFilterCount > 0;

  const handleSeeAllIsland = (island: string) => {
    setFilters(prev => ({ ...prev, island }));
  };

  const handleSeeAllOpenNow = () => {
    setFilters(prev => ({ ...prev, openNow: true }));
  };

  const handleSeeAllWaterfront = () => {
    setFilters(prev => ({ ...prev, features: ['waterfront'] }));
  };

  const handleBrowseAll = () => {
    setBrowseMode(true);
  };

  const handleBackToDiscover = () => {
    setBrowseMode(false);
    setFilters({});
  };

  const handleMarkerPress = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  // Curated groupings built from the unfiltered restaurant list, only
  // recomputed when the underlying data actually changes.
  const openNow = useMemo(
    () =>
      [...restaurants]
        .filter(r => r.isOpen)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, CAROUSEL_SIZE),
    [restaurants]
  );

  // Ratings/review counts aren't populated yet (every restaurant imports at
  // 0 — see docs/restaurant-data-template.csv), so a "Top rated" section
  // would just show arbitrary order with a misleading "★ 0". Waterfront is
  // a real, curated feature tag instead.
  const waterfront = useMemo(
    () => restaurants.filter(r => r.features.includes('waterfront')).slice(0, CAROUSEL_SIZE),
    [restaurants]
  );

  const recentlyAdded = useMemo(
    () =>
      [...restaurants]
        .sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''))
        .slice(0, CAROUSEL_SIZE),
    [restaurants]
  );

  const byIsland = useMemo(() => {
    const map: Record<string, Restaurant[]> = {};
    for (const island of ISLANDS) {
      map[island.name] = restaurants
        .filter(r => r.island === island.name)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, ISLAND_CAROUSEL_SIZE);
    }
    return map;
  }, [restaurants]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error && restaurants.length === 0) {
    return (
      <View style={styles.centered}>
        <WifiOff size={48} color="#999" />
        <Text style={styles.emptyTitle}>Couldn't load restaurants</Text>
        <Text style={styles.emptyText}>Check your connection and try again</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#00BCD4" />
            <Text style={styles.locationText}>{REGION_NAME}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              accessibilityRole="button"
              accessibilityLabel={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
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
              accessibilityRole="button"
              accessibilityLabel={activeFilterCount > 0 ? `Show filters, ${activeFilterCount} active` : 'Show filters'}
              accessibilityState={{ expanded: showFilters }}
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

        {viewMode === 'list' && !showFilters && (
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modePill, !showingList && styles.modePillActive]}
              onPress={handleBackToDiscover}
              accessibilityRole="button"
              accessibilityLabel="Discover view"
              accessibilityState={{ selected: !showingList }}
            >
              <Text style={[styles.modePillText, !showingList && styles.modePillTextActive]}>
                Discover
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modePill, showingList && styles.modePillActive]}
              onPress={handleBrowseAll}
              accessibilityRole="button"
              accessibilityLabel={`Browse all ${restaurants.length} restaurants`}
              accessibilityState={{ selected: showingList }}
            >
              <Text style={[styles.modePillText, showingList && styles.modePillTextActive]}>
                All ({restaurants.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
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

      {viewMode === 'map' ? (
        <RestaurantMapView
          restaurants={restaurants}
          userLocation={userLocation}
          onMarkerPress={handleMarkerPress}
        />
      ) : showingList ? (
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
        <ScrollView
          contentContainerStyle={styles.discover}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#00BCD4" />
          }
        >
          <CarouselSection
            title="Open right now"
            restaurants={openNow}
            onSeeAll={handleSeeAllOpenNow}
          />
          <CarouselSection
            title="Waterfront dining"
            restaurants={waterfront}
            onSeeAll={handleSeeAllWaterfront}
          />
          {ISLANDS.map(island => (
            <CarouselSection
              key={island.id}
              title={`Best in ${island.name}`}
              restaurants={byIsland[island.name] || []}
              onSeeAll={() => handleSeeAllIsland(island.name)}
            />
          ))}
          <CarouselSection
            title="Recently added"
            subtitle="New to VI Eats"
            restaurants={recentlyAdded}
            onSeeAll={handleBrowseAll}
          />

          <TouchableOpacity style={styles.browseAllButton} onPress={handleBrowseAll}>
            <Text style={styles.browseAllButtonText}>
              Browse all {restaurants.length} restaurants
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  modePillActive: {
    backgroundColor: '#00BCD4',
  },
  modePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  modePillTextActive: {
    color: '#fff',
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
  discover: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  browseAllButton: {
    marginHorizontal: 16,
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00BCD4',
    alignItems: 'center',
  },
  browseAllButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00BCD4',
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
  retryButton: {
    marginTop: 20,
    backgroundColor: '#00BCD4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
