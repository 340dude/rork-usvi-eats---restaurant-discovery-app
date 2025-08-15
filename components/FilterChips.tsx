import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';

interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
  multiSelect?: boolean;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  selected,
  onToggle,
  onClear,
  multiSelect = true,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {selected.length > 0 && onClear && (
        <TouchableOpacity style={styles.clearChip} onPress={onClear}>
          <X size={14} color="#666" />
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
      
      {chips.map((chip) => {
        const isSelected = selected.includes(chip.id);
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onToggle(chip.id)}
          >
            {chip.icon && <Text style={styles.icon}>{chip.icon}</Text>}
            <Text style={[styles.label, isSelected && styles.selectedLabel]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  selectedChip: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#fff',
  },
  clearText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});