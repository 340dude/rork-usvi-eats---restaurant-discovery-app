import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Store,
  Edit3,
  Calendar,
  MessageSquare,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Phone,
  Navigation,
  ArrowLeft,
} from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
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
  ],
  lastUpdated: '2024-01-15T10:00:00Z',
};

const mockReports = [
  {
    id: '1',
    type: 'hours',
    description: 'Restaurant shows closed but they are open',
    status: 'pending',
    createdAt: '2024-01-15T09:30:00Z',
  },
  {
    id: '2',
    type: 'menu',
    description: 'Fish tacos price is outdated',
    status: 'pending',
    createdAt: '2024-01-14T16:20:00Z',
  },
];

export default function AdminDashboard() {
  const router = useRouter();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'edit-profile':
        router.push('/admin/edit-profile');
        break;
      case 'edit-menu':
        router.push('/admin/edit-menu');
        break;
      case 'special-hours':
        router.push('/admin/special-hours');
        break;
      case 'reports':
        router.push('/admin/reports');
        break;
      case 'analytics':
        router.push('/admin/analytics');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is under development.');
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Restaurant Dashboard',
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>The Sunset Grille</Text>
            <Text style={styles.restaurantLocation}>Charlotte Amalie, St. Thomas</Text>
            <View style={styles.statusBadge}>
              <CheckCircle size={16} color="#4CAF50" />
              <Text style={styles.statusText}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#00BCD4" />
            <Text style={styles.statNumber}>{mockAnalytics.profileViews}</Text>
            <Text style={styles.statLabel}>Profile Views</Text>
            <Text style={styles.statPeriod}>This week</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{mockAnalytics.favorites}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
            <Text style={styles.statPeriod}>Total</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Phone size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{mockAnalytics.callTaps}</Text>
            <Text style={styles.statLabel}>Calls</Text>
            <Text style={styles.statPeriod}>This week</Text>
          </View>
          <View style={styles.statCard}>
            <Navigation size={24} color="#9C27B0" />
            <Text style={styles.statNumber}>{mockAnalytics.directionTaps}</Text>
            <Text style={styles.statLabel}>Directions</Text>
            <Text style={styles.statPeriod}>This week</Text>
          </View>
        </View>

        {/* Pending Reports Alert */}
        {mockReports.length > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => handleQuickAction('reports')}
          >
            <AlertCircle size={24} color="#FF5722" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Reports</Text>
              <Text style={styles.alertDescription}>
                {mockReports.length} customer report{mockReports.length > 1 ? 's' : ''} need your attention
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('edit-profile')}
            >
              <Store size={32} color="#00BCD4" />
              <Text style={styles.actionLabel}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('edit-menu')}
            >
              <Edit3 size={32} color="#FF9800" />
              <Text style={styles.actionLabel}>Edit Menu</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('special-hours')}
            >
              <Calendar size={32} color="#4CAF50" />
              <Text style={styles.actionLabel}>Special Hours</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('reports')}
            >
              <MessageSquare size={32} color="#FF5722" />
              <Text style={styles.actionLabel}>Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('analytics')}
            >
              <BarChart3 size={32} color="#9C27B0" />
              <Text style={styles.actionLabel}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Clock size={20} color="#666" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Menu updated</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityCard}>
            <Clock size={20} color="#666" />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Profile viewed 47 times</Text>
              <Text style={styles.activityTime}>Today</Text>
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
  restaurantHeader: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  restaurantInfo: {
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  restaurantLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statPeriod: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});