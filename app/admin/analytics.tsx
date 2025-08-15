import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  TrendingUp,
  Users,
  Phone,
  Navigation,
  Eye,
  Heart,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { RestaurantAnalytics } from '@/types/restaurant';

const mockAnalytics: RestaurantAnalytics = {
  restaurantId: '1',
  period: 'week',
  profileViews: 1247,
  callTaps: 89,
  directionTaps: 156,
  favorites: 234,
  topViewedDishes: [
    { itemId: 'grilled-mahi', itemName: 'Grilled Mahi Mahi', views: 89 },
    { itemId: 'conch-fritters', itemName: 'Conch Fritters', views: 67 },
    { itemId: 'jerk-chicken', itemName: 'Jerk Chicken', views: 45 },
    { itemId: 'tuna-tartare', itemName: 'Ahi Tuna Tartare', views: 32 },
    { itemId: 'fish-tacos', itemName: 'Fish Tacos', views: 28 },
  ],
  lastUpdated: '2024-01-15T10:00:00Z',
};

const mockWeeklyData = [
  { day: 'Mon', views: 145, calls: 12, directions: 18 },
  { day: 'Tue', views: 167, calls: 15, directions: 22 },
  { day: 'Wed', views: 189, calls: 11, directions: 25 },
  { day: 'Thu', views: 201, calls: 18, directions: 28 },
  { day: 'Fri', views: 234, calls: 16, directions: 31 },
  { day: 'Sat', views: 178, calls: 9, directions: 19 },
  { day: 'Sun', views: 133, calls: 8, directions: 13 },
];

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const getMaxValue = (data: typeof mockWeeklyData, key: 'views' | 'calls' | 'directions') => {
  return Math.max(...data.map(item => item[key]));
};

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'calls' | 'directions'>('views');

  const maxValue = getMaxValue(mockWeeklyData, selectedMetric);

  const getMetricColor = (metric: 'views' | 'calls' | 'directions') => {
    switch (metric) {
      case 'views':
        return '#00BCD4';
      case 'calls':
        return '#4CAF50';
      case 'directions':
        return '#9C27B0';
      default:
        return '#999';
    }
  };

  const getMetricIcon = (metric: 'views' | 'calls' | 'directions') => {
    switch (metric) {
      case 'views':
        return Eye;
      case 'calls':
        return Phone;
      case 'directions':
        return Navigation;
      default:
        return BarChart3;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Analytics',
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
        }} 
      />
      <ScrollView style={styles.container}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['day', 'week', 'month'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <TrendingUp size={24} color="#00BCD4" />
              <Text style={styles.metricNumber}>{formatNumber(mockAnalytics.profileViews)}</Text>
              <Text style={styles.metricLabel}>Profile Views</Text>
              <Text style={styles.metricChange}>+12% vs last {selectedPeriod}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Heart size={24} color="#FF9800" />
              <Text style={styles.metricNumber}>{formatNumber(mockAnalytics.favorites)}</Text>
              <Text style={styles.metricLabel}>Favorites</Text>
              <Text style={styles.metricChange}>+8% vs last {selectedPeriod}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Phone size={24} color="#4CAF50" />
              <Text style={styles.metricNumber}>{mockAnalytics.callTaps}</Text>
              <Text style={styles.metricLabel}>Calls</Text>
              <Text style={styles.metricChange}>+15% vs last {selectedPeriod}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Navigation size={24} color="#9C27B0" />
              <Text style={styles.metricNumber}>{mockAnalytics.directionTaps}</Text>
              <Text style={styles.metricLabel}>Directions</Text>
              <Text style={styles.metricChange}>+5% vs last {selectedPeriod}</Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.section}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Weekly Trends</Text>
            <View style={styles.metricSelector}>
              {(['views', 'calls', 'directions'] as const).map((metric) => {
                const IconComponent = getMetricIcon(metric);
                return (
                  <TouchableOpacity
                    key={metric}
                    style={[
                      styles.metricSelectorButton,
                      selectedMetric === metric && {
                        backgroundColor: getMetricColor(metric) + '20',
                        borderColor: getMetricColor(metric),
                      },
                    ]}
                    onPress={() => setSelectedMetric(metric)}
                  >
                    <IconComponent 
                      size={16} 
                      color={selectedMetric === metric ? getMetricColor(metric) : '#666'} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <View style={styles.chart}>
            {mockWeeklyData.map((item, index) => {
              const value = item[selectedMetric];
              const height = (value / maxValue) * 120;
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.chartBarContainer}>
                    <View 
                      style={[
                        styles.chartBarFill,
                        { 
                          height: height,
                          backgroundColor: getMetricColor(selectedMetric),
                        },
                      ]} 
                    />
                  </View>
                  <Text style={styles.chartBarValue}>{value}</Text>
                  <Text style={styles.chartBarLabel}>{item.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Dishes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Viewed Dishes</Text>
          {mockAnalytics.topViewedDishes.map((dish, index) => (
            <View key={dish.itemId} style={styles.dishCard}>
              <View style={styles.dishRank}>
                <Text style={styles.dishRankText}>{index + 1}</Text>
              </View>
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.itemName}</Text>
                <Text style={styles.dishViews}>{dish.views} views this {selectedPeriod}</Text>
              </View>
              <View style={styles.dishProgress}>
                <View 
                  style={[
                    styles.dishProgressFill,
                    { 
                      width: `${(dish.views / mockAnalytics.topViewedDishes[0].views) * 100}%`,
                    },
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <TrendingUp size={20} color="#4CAF50" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Peak Hours</Text>
              <Text style={styles.insightDescription}>
                Most profile views happen between 6-8 PM on weekdays
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Users size={20} color="#FF9800" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Popular Days</Text>
              <Text style={styles.insightDescription}>
                Friday and Saturday generate 40% more engagement
              </Text>
            </View>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Calendar size={20} color="#9C27B0" />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Seasonal Trend</Text>
              <Text style={styles.insightDescription}>
                Tourist season shows 60% increase in profile views
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#00BCD4',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '500',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  metricSelectorButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  chartBarContainer: {
    height: 120,
    width: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 12,
  },
  chartBarValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
  chartBarLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dishRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dishRankText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  dishInfo: {
    flex: 1,
    marginRight: 12,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  dishViews: {
    fontSize: 14,
    color: '#666',
  },
  dishProgress: {
    width: 60,
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  dishProgressFill: {
    height: '100%',
    backgroundColor: '#00BCD4',
    borderRadius: 2,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});