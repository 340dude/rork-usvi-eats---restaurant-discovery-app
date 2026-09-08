import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  Clock,
  Menu,
  Phone,
  AlertTriangle,
  MessageSquare,
  Check,
  X,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { UserReport } from '@/types/restaurant';
import { useMyRestaurant } from '@/hooks/use-restaurants';
import { useReports, useUpdateReportStatus } from '@/hooks/use-reports';
import { confirmAction } from '@/lib/confirm';

const getReportIcon = (type: UserReport['type']) => {
  switch (type) {
    case 'hours':
      return Clock;
    case 'menu':
      return Menu;
    case 'contact':
      return Phone;
    case 'closed':
      return AlertTriangle;
    default:
      return MessageSquare;
  }
};

const getReportTypeLabel = (type: UserReport['type']) => {
  switch (type) {
    case 'hours':
      return 'Hours';
    case 'menu':
      return 'Menu';
    case 'contact':
      return 'Contact';
    case 'closed':
      return 'Closure';
    default:
      return 'Other';
  }
};

const getStatusColor = (status: UserReport['status']) => {
  switch (status) {
    case 'pending':
      return '#FF9800';
    case 'approved':
      return '#4CAF50';
    case 'rejected':
      return '#F44336';
    default:
      return '#999';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function Reports() {
  const { data: restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useMyRestaurant();
  const { data: reports = [], isLoading: isLoadingReports, error: reportsError } = useReports(restaurant?.id);
  const updateStatus = useUpdateReportStatus();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (reportId: string) => {
    if (!restaurant) return;
    confirmAction(
      'Approve Report',
      'This will mark the report as approved.',
      () => updateStatus.mutate(
        { id: reportId, status: 'approved', restaurantId: restaurant.id },
        { onError: (err) => Alert.alert('Failed', err instanceof Error ? err.message : 'Please try again.') }
      ),
      'Approve'
    );
  };

  const handleReject = (reportId: string) => {
    if (!restaurant) return;
    confirmAction(
      'Reject Report',
      'This will mark the report as rejected. No changes will be made to your restaurant information.',
      () => updateStatus.mutate(
        { id: reportId, status: 'rejected', restaurantId: restaurant.id },
        { onError: (err) => Alert.alert('Failed', err instanceof Error ? err.message : 'Please try again.') }
      ),
      'Reject'
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (isLoadingRestaurant) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reports', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      </>
    );
  }

  if (restaurantError) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reports', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.emptyStateDescription}>Couldn't load restaurant data. Pull down to retry or check your connection.</Text>
        </View>
      </>
    );
  }

  if (!restaurant) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reports', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
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
          title: `Reports ${pendingCount > 0 ? `(${pendingCount})` : ''}`,
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
        }} 
      />
      <View style={styles.container}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && styles.filterTabActive,
              ]}
              onPress={() => setFilter(status)}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === status }}
            >
              <Text style={[
                styles.filterTabText,
                filter === status && styles.filterTabTextActive,
              ]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && pendingCount > 0 && (
                  <Text style={styles.filterBadge}> ({pendingCount})</Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.reportsList}>
          {isLoadingReports && (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color="#00BCD4" />
            </View>
          )}
          {reportsError && (
            <Text style={styles.emptyStateDescription}>Couldn't load reports.</Text>
          )}
          {!isLoadingReports && filteredReports.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color="#999" />
              <Text style={styles.emptyStateTitle}>No reports</Text>
              <Text style={styles.emptyStateDescription}>
                {filter === 'pending' 
                  ? 'No pending reports at the moment.'
                  : `No ${filter} reports found.`
                }
              </Text>
            </View>
          ) : (
            filteredReports.map((report) => {
              const IconComponent = getReportIcon(report.type);
              return (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportTypeContainer}>
                      <IconComponent size={20} color="#666" />
                      <Text style={styles.reportType}>
                        {getReportTypeLabel(report.type)}
                      </Text>
                    </View>
                    <View style={styles.reportMeta}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(report.status) + '20' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(report.status) }
                        ]}>
                          {report.status}
                        </Text>
                      </View>
                      <Text style={styles.reportDate}>
                        {formatDate(report.createdAt)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reportDescription}>
                    {report.description}
                  </Text>

                  {report.photo && (
                    <Image
                      source={{ uri: report.photo }}
                      style={styles.reportPhoto}
                      accessibilityLabel="Photo attached to this report"
                    />
                  )}

                  {report.status === 'pending' && (
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(report.id)}
                        disabled={updateStatus.isPending}
                      >
                        <Check size={16} color="#fff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(report.id)}
                        disabled={updateStatus.isPending}
                      >
                        <X size={16} color="#fff" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {report.resolvedAt && (
                    <Text style={styles.resolvedText}>
                      Resolved on {formatDate(report.resolvedAt)}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
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
  inlineLoading: {
    paddingVertical: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: '#E0F7FA',
  },
  filterTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#00BCD4',
    fontWeight: '600',
  },
  filterBadge: {
    fontSize: 12,
    color: '#FF9800',
  },
  reportsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reportMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  reportDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reportPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  resolvedText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});