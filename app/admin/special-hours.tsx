import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import {
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Trash2,
  Save,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { SpecialHours } from '@/types/restaurant';

const mockSpecialHours: SpecialHours[] = [
  {
    id: '1',
    restaurantId: '1',
    date: '2024-01-25',
    reason: 'Private Event',
    closed: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    restaurantId: '1',
    date: '2024-02-14',
    reason: 'Valentine\'s Day Special Hours',
    closed: false,
    openTime: '17:00',
    closeTime: '23:00',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '3',
    restaurantId: '1',
    date: '2024-03-17',
    reason: 'St. Patrick\'s Day',
    closed: false,
    openTime: '12:00',
    closeTime: '02:00',
    createdAt: '2024-01-15T10:00:00Z',
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const isUpcoming = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};

export default function SpecialHoursScreen() {
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>(mockSpecialHours);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: '',
    reason: '',
    closed: false,
    openTime: '',
    closeTime: '',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Special hours updated successfully!');
  };

  const addSpecialHours = () => {
    if (!newEntry.date || !newEntry.reason) {
      Alert.alert('Error', 'Please fill in the date and reason.');
      return;
    }

    if (!newEntry.closed && (!newEntry.openTime || !newEntry.closeTime)) {
      Alert.alert('Error', 'Please specify opening and closing times.');
      return;
    }

    const entry = {
      id: `special-${Date.now()}`,
      restaurantId: '1',
      date: newEntry.date,
      reason: newEntry.reason,
      closed: newEntry.closed,
      openTime: newEntry.closed ? undefined : newEntry.openTime,
      closeTime: newEntry.closed ? undefined : newEntry.closeTime,
      createdAt: new Date().toISOString(),
    };

    setSpecialHours(prev => [...prev, entry].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));

    setNewEntry({
      date: '',
      reason: '',
      closed: false,
      openTime: '',
      closeTime: '',
    });
    setShowAddForm(false);
  };

  const deleteSpecialHours = (id: string) => {
    Alert.alert(
      'Delete Special Hours',
      'Are you sure you want to delete this entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setSpecialHours(prev => prev.filter(entry => entry.id !== id)),
        },
      ]
    );
  };

  const upcomingHours = specialHours.filter(entry => isUpcoming(entry.date));
  const pastHours = specialHours.filter(entry => !isUpcoming(entry.date));

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Special Hours',
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container}>
        {/* Add New Entry */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={20} color="#00BCD4" />
            <Text style={styles.addButtonText}>Add Special Hours</Text>
          </TouchableOpacity>

          {showAddForm && (
            <View style={styles.addForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.date}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reason</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.reason}
                  onChangeText={(text) => setNewEntry(prev => ({ ...prev, reason: text }))}
                  placeholder="Holiday, Private Event, etc."
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Closed All Day</Text>
                <Switch
                  value={newEntry.closed}
                  onValueChange={(value) => setNewEntry(prev => ({ ...prev, closed: value }))}
                  trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
                  thumbColor={newEntry.closed ? '#00BCD4' : '#f4f3f4'}
                />
              </View>

              {!newEntry.closed && (
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={styles.label}>Open Time</Text>
                    <TextInput
                      style={styles.input}
                      value={newEntry.openTime}
                      onChangeText={(text) => setNewEntry(prev => ({ ...prev, openTime: text }))}
                      placeholder="09:00"
                    />
                  </View>
                  <View style={styles.timeInput}>
                    <Text style={styles.label}>Close Time</Text>
                    <TextInput
                      style={styles.input}
                      value={newEntry.closeTime}
                      onChangeText={(text) => setNewEntry(prev => ({ ...prev, closeTime: text }))}
                      placeholder="22:00"
                    />
                  </View>
                </View>
              )}

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveFormButton}
                  onPress={addSpecialHours}
                >
                  <Text style={styles.saveFormButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Upcoming Special Hours */}
        {upcomingHours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            {upcomingHours.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    <Text style={styles.entryReason}>{entry.reason}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteSpecialHours(entry.id)}
                  >
                    <Trash2 size={16} color="#FF5252" />
                  </TouchableOpacity>
                </View>

                <View style={styles.entryDetails}>
                  {entry.closed ? (
                    <View style={styles.closedBadge}>
                      <AlertTriangle size={16} color="#FF5252" />
                      <Text style={styles.closedText}>Closed All Day</Text>
                    </View>
                  ) : (
                    <View style={styles.hoursInfo}>
                      <Clock size={16} color="#4CAF50" />
                      <Text style={styles.hoursText}>
                        {entry.openTime} - {entry.closeTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Past Special Hours */}
        {pastHours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past</Text>
            {pastHours.map((entry) => (
              <View key={entry.id} style={[styles.entryCard, styles.pastEntryCard]}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryDate, styles.pastText]}>
                      {formatDate(entry.date)}
                    </Text>
                    <Text style={[styles.entryReason, styles.pastText]}>
                      {entry.reason}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteSpecialHours(entry.id)}
                  >
                    <Trash2 size={16} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.entryDetails}>
                  {entry.closed ? (
                    <View style={styles.closedBadge}>
                      <AlertTriangle size={16} color="#999" />
                      <Text style={[styles.closedText, styles.pastText]}>
                        Closed All Day
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.hoursInfo}>
                      <Clock size={16} color="#999" />
                      <Text style={[styles.hoursText, styles.pastText]}>
                        {entry.openTime} - {entry.closeTime}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {specialHours.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#999" />
            <Text style={styles.emptyStateTitle}>No Special Hours</Text>
            <Text style={styles.emptyStateDescription}>
              Add special hours for holidays, events, or temporary closures.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  saveButton: {
    padding: 8,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  addForm: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveFormButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
  },
  saveFormButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  entryCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  pastEntryCard: {
    opacity: 0.6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  entryReason: {
    fontSize: 14,
    color: '#666',
  },
  pastText: {
    color: '#999',
  },
  deleteButton: {
    padding: 4,
  },
  entryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  closedText: {
    fontSize: 14,
    color: '#FF5252',
    fontWeight: '500',
  },
  hoursInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  hoursText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    backgroundColor: '#fff',
    marginBottom: 16,
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
    paddingHorizontal: 32,
  },
});