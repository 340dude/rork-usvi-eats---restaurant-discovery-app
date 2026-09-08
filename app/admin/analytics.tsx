import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  TrendingUp,
  Phone,
  Navigation,
  Eye,
  BarChart3,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useMyRestaurant } from '@/hooks/use-restaurants';
import { useAnalyticsEvents, aggregateAnalytics, DailyCount } from '@/hooks/use-analytics';

const formatNumber = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const getMaxValue = (data: DailyCount[], key: 'views' | 'calls' | 'directions') => {
  return Math.max(1, ...data.map(item => item[key]));
};

export default function Analytics() {
  const { data: restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useMyRestaurant();
  const { data: events = [], isLoading: isLoadingEvents } = useAnalyticsEvents(restaurant?.id);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'calls' | 'directions'>('views');

  const analytics = useMemo(() => aggregateAnalytics(events, selectedPeriod), [events, selectedPeriod]);
  const maxValue = getMaxValue(analytics.dailyBreakdown, selectedMetric);

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

  if (isLoadingRestaurant) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analytics', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      </>
    );
  }

  if (restaurantError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analytics', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyStateDescription}>Couldn't load restaurant data. Pull down to retry or check your connection.</Text>
        </View>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <Stack.Screen options={{ title: 'Analytics', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyStateDescription}>No restaurant is linked to your account yet. Contact support to get set up.</Text>
        </View>
      </>
    );
  }

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
        {isLoadingEvents && (
          <View style={styles.inlineLoading}>
            <ActivityIndicator color="#00BCD4" />
          </View>
        )}

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
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedPeriod === period }}
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
              <Text style={styles.metricNumber}>{formatNumber(analytics.profileViews)}</Text>
              <Text style={styles.metricLabel}>Profile Views</Text>
            </View>

            <View style={styles.metricCard}>
              <Phone size={24} color="#4CAF50" />
              <Text style={styles.metricNumber}>{formatNumber(analytics.callTaps)}</Text>
              <Text style={styles.metricLabel}>Calls</Text>
            </View>

            <View style={styles.metricCard}>
              <Navigation size={24} color="#9C27B0" />
              <Text style={styles.metricNumber}>{formatNumber(analytics.directionTaps)}</Text>
              <Text style={styles.metricLabel}>Directions</Text>
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
                    accessibilityRole="radio"
                    accessibilityLabel={`Show ${metric}`}
                    accessibilityState={{ checked: selectedMetric === metric }}
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
            {analytics.dailyBreakdown.map((item, index) => {
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
      </ScrollView>
    </>
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
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inlineLoading: {
    paddingVertical: 16,
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
});