import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Restaurant } from '@/types/restaurant';
import { RestaurantCardCompact } from '@/components/RestaurantCardCompact';

interface CarouselSectionProps {
  title: string;
  subtitle?: string;
  restaurants: Restaurant[];
  onSeeAll?: () => void;
}

// A titled horizontal row of RestaurantCardCompact cards, used to break the
// Explore tab's Discover view into digestible, scannable groups instead of
// one long vertical list of every restaurant. Renders nothing if there are
// no restaurants to show, so callers can include a section unconditionally
// and let it disappear gracefully (e.g. an island with very few listings).
export const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  subtitle,
  restaurants,
  onSeeAll,
}) => {
  if (restaurants.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {onSeeAll && (
          <TouchableOpacity
            style={styles.seeAll}
            onPress={onSeeAll}
            accessibilityRole="button"
            accessibilityLabel={`See all ${title}`}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={16} color="#00BCD4" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCardCompact restaurant={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00BCD4',
  },
  list: {
    paddingHorizontal: 16,
  },
});
