import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
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

const mockReports: UserReport[] = [
  {
    id: '1',
    restaurantId: '1',
    userId: 'user123',
    type: 'hours',
    description: 'Restaurant shows closed but they are open. I just called and they confirmed they are open until 10 PM today.',
    status: 'pending',
    createdAt: '2024-01-15T09:30:00Z',
  },
  {
    id: '2',
    restaurantId: '1',
    type: 'menu',
    description: 'Fish tacos price is outdated. They now cost $16, not $14 as shown on the menu.',
    status: 'pending',
    createdAt: '2024-01-14T16:20:00Z',
  },
  {
    id: '3',
    restaurantId: '1',
    type: 'contact',
    description: 'Phone number is disconnected. Tried calling multiple times.',
    status: 'approved',
    createdAt: '2024-01-13T11:15:00Z',
    resolvedAt: '2024-01-13T14:30:00Z',
  },
  {
    id: '4',
    restaurantId: '1',
    type: 'other',
    description: 'They have a new outdoor seating area that is not mentioned in the features.',
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    status: 'pending',
    createdAt: '2024-01-12T19:45:00Z',
  },
  {
    id: '5',
    restaurantId: '1',
    type: 'closed',
    description: 'Restaurant appears to be permanently closed. Windows are boarded up.',
    status: 'rejected',
    createdAt: '2024-01-10T08:20:00Z',
    resolvedAt: '2024-01-10T10:15:00Z',
  },
];

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
  const [reports, setReports] = useState<UserReport[]>(mockReports);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleApprove = (reportId: string) => {
    Alert.alert(
      'Approve Report',
      'This will mark the report as approved and may update your restaurant information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setReports(prev => prev.map(report =>
              report.id === reportId
                ? {
                    ...report,
                    status: 'approved',
                    resolvedAt: new Date().toISOString(),
                  }
                : report
            ));
            Alert.alert('Success', 'Report approved and changes applied.');
          },
        },
      ]
    );
  };

  const handleReject = (reportId: string) => {
    Alert.alert(
      'Reject Report',
      'This will mark the report as rejected. No changes will be made to your restaurant information.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setReports(prev => prev.map(report =>
              report.id === reportId
                ? {
                    ...report,
                    status: 'rejected',
                    resolvedAt: new Date().toISOString(),
                  }
                : report
            ));
          },
        },
      ]
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

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
          {filteredReports.length === 0 ? (
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
                    <Image source={{ uri: report.photo }} style={styles.reportPhoto} />
                  )}

                  {report.status === 'pending' && (
                    <View style={styles.reportActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApprove(report.id)}
                      >
                        <Check size={16} color="#fff" />
                        <Text style={styles.approveButtonText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReject(report.id)}
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
    color: '#999',
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
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
});