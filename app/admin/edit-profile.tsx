import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import {
  Save,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Facebook,

  Star,
  Wifi,
  Car,
  Music,
  Users,
} from 'lucide-react-native';
import { Stack } from 'expo-router';

const FEATURES = [
  { id: 'waterfront', label: 'Waterfront', icon: MapPin },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'outdoor-seating', label: 'Outdoor Seating', icon: Star },
  { id: 'live-music', label: 'Live Music', icon: Music },
  { id: 'kid-friendly', label: 'Kid Friendly', icon: Users },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
];

const CUISINES = [
  'Caribbean', 'Seafood', 'American', 'Italian', 'Spanish', 'Latin', 'Cuban', 'Pizza', 'Bar & Grill'
];

export default function EditProfile() {
  const [formData, setFormData] = useState({
    name: 'The Sunset Grille',
    description: 'Waterfront dining with stunning sunset views. Fresh seafood daily and Caribbean-inspired cocktails.',
    address: '123 Waterfront Drive, Charlotte Amalie, St. Thomas 00802',
    phone: '(340) 555-0123',
    website: 'https://sunsetgrille.com',
    instagram: '@sunsetgrillevi',
    facebook: 'sunsetgrillevi',
    priceLevel: '$$' as '$' | '$$' | '$$$',
    cuisine: ['Caribbean', 'Seafood', 'American'],
    features: ['waterfront', 'parking', 'outdoor-seating', 'live-music'],
    dietaryOptions: ['vegetarian', 'gluten-free'],
    hours: {
      monday: { open: '11:00', close: '22:00', closed: false },
      tuesday: { open: '11:00', close: '22:00', closed: false },
      wednesday: { open: '11:00', close: '22:00', closed: false },
      thursday: { open: '11:00', close: '23:00', closed: false },
      friday: { open: '11:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
  });

  const handleSave = () => {
    Alert.alert('Success', 'Restaurant profile updated successfully!');
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleDietaryOption = (optionId: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryOptions: prev.dietaryOptions.includes(optionId)
        ? prev.dietaryOptions.filter(d => d !== optionId)
        : [...prev.dietaryOptions, optionId]
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData(prev => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...(prev.hours as any)[day],
          [field]: value
        }
      }
    }));
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Edit Profile',
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
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter restaurant name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Describe your restaurant"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
              placeholder="Full address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Level</Text>
            <View style={styles.priceLevelContainer}>
              {['$', '$$', '$$$'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.priceLevelButton,
                    formData.priceLevel === level && styles.priceLevelButtonActive
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, priceLevel: level as '$' | '$$' | '$$$' }))}
                >
                  <Text style={[
                    styles.priceLevelText,
                    formData.priceLevel === level && styles.priceLevelTextActive
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color="#666" />
              <TextInput
                style={styles.inputWithIconText}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="(340) 555-0123"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <View style={styles.inputWithIcon}>
              <Globe size={20} color="#666" />
              <TextInput
                style={styles.inputWithIconText}
                value={formData.website}
                onChangeText={(text) => setFormData(prev => ({ ...prev, website: text }))}
                placeholder="https://yourwebsite.com"
                keyboardType="url"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram</Text>
            <View style={styles.inputWithIcon}>
              <Instagram size={20} color="#666" />
              <TextInput
                style={styles.inputWithIconText}
                value={formData.instagram}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instagram: text }))}
                placeholder="@yourusername"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Facebook</Text>
            <View style={styles.inputWithIcon}>
              <Facebook size={20} color="#666" />
              <TextInput
                style={styles.inputWithIconText}
                value={formData.facebook}
                onChangeText={(text) => setFormData(prev => ({ ...prev, facebook: text }))}
                placeholder="yourpagename"
              />
            </View>
          </View>
        </View>

        {/* Cuisine Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuisine Types</Text>
          <View style={styles.chipContainer}>
            {CUISINES.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.chip,
                  formData.cuisine.includes(cuisine) && styles.chipActive
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                <Text style={[
                  styles.chipText,
                  formData.cuisine.includes(cuisine) && styles.chipTextActive
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features & Amenities</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[
                  styles.featureCard,
                  formData.features.includes(feature.id) && styles.featureCardActive
                ]}
                onPress={() => toggleFeature(feature.id)}
              >
                <feature.icon 
                  size={24} 
                  color={formData.features.includes(feature.id) ? '#00BCD4' : '#666'} 
                />
                <Text style={[
                  styles.featureText,
                  formData.features.includes(feature.id) && styles.featureTextActive
                ]}>
                  {feature.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Options</Text>
          <View style={styles.chipContainer}>
            {DIETARY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.chip,
                  formData.dietaryOptions.includes(option.id) && styles.chipActive
                ]}
                onPress={() => toggleDietaryOption(option.id)}
              >
                <Text style={[
                  styles.chipText,
                  formData.dietaryOptions.includes(option.id) && styles.chipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operating Hours</Text>
          {Object.entries(formData.hours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <View style={styles.hoursDay}>
                <Text style={styles.hoursDayText}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Switch
                  value={!hours.closed}
                  onValueChange={(value) => updateHours(day, 'closed', !value)}
                  trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
                  thumbColor={!hours.closed ? '#00BCD4' : '#f4f3f4'}
                />
              </View>
              {!hours.closed && (
                <View style={styles.hoursInputs}>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.open}
                    onChangeText={(text) => updateHours(day, 'open', text)}
                    placeholder="09:00"
                  />
                  <Text style={styles.timeSeparator}>to</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={hours.close}
                    onChangeText={(text) => updateHours(day, 'close', text)}
                    placeholder="22:00"
                  />
                </View>
              )}
            </View>
          ))}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    marginLeft: 8,
  },
  priceLevelContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceLevelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  priceLevelButtonActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  priceLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  priceLevelTextActive: {
    color: '#fff',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextActive: {
    color: '#00BCD4',
    fontWeight: '500',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
    gap: 8,
  },
  featureCardActive: {
    backgroundColor: '#E0F7FA',
    borderColor: '#00BCD4',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  featureTextActive: {
    color: '#00BCD4',
    fontWeight: '500',
  },
  hoursRow: {
    marginBottom: 16,
  },
  hoursDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hoursDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  hoursInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#666',
  },
});