import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
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
import { useMyRestaurant, useUpdateRestaurant } from '@/hooks/use-restaurants';
import { Restaurant } from '@/types/restaurant';

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

type ProfileFormData = {
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  priceLevel: '$' | '$$' | '$$$';
  cuisine: string[];
  features: string[];
  dietaryOptions: string[];
  hours: Record<string, { open?: string; close?: string; closed: boolean }>;
};

const toFormData = (restaurant: Restaurant): ProfileFormData => ({
  name: restaurant.name,
  description: restaurant.description,
  address: restaurant.location.address,
  phone: restaurant.contact.phone ?? '',
  website: restaurant.contact.website ?? '',
  instagram: restaurant.contact.instagram ?? '',
  facebook: restaurant.contact.facebook ?? '',
  priceLevel: restaurant.priceLevel,
  cuisine: restaurant.cuisine,
  features: restaurant.features,
  dietaryOptions: restaurant.dietaryOptions,
  hours: Object.fromEntries(
    Object.entries(restaurant.hours).map(([day, h]) => [day, { ...h, closed: !!h.closed }])
  ),
});

export default function EditProfile() {
  const { data: restaurant, isLoading, error } = useMyRestaurant();
  const updateRestaurant = useUpdateRestaurant();

  const [formData, setFormData] = useState<ProfileFormData | null>(null);

  useEffect(() => {
    if (restaurant) {
      setFormData(toFormData(restaurant));
    }
  }, [restaurant]);

  const handleSave = () => {
    if (!formData || !restaurant) return;

    updateRestaurant.mutate(
      {
        id: restaurant.id,
        updates: {
          name: formData.name,
          description: formData.description,
          priceLevel: formData.priceLevel,
          cuisine: formData.cuisine,
          features: formData.features,
          dietaryOptions: formData.dietaryOptions,
          location: { ...restaurant.location, address: formData.address },
          contact: {
            phone: formData.phone || undefined,
            website: formData.website || undefined,
            instagram: formData.instagram || undefined,
            facebook: formData.facebook || undefined,
          },
          hours: formData.hours,
        },
      },
      {
        onSuccess: () => Alert.alert('Success', 'Restaurant profile updated successfully!'),
        onError: (err) => Alert.alert('Save failed', err instanceof Error ? err.message : 'Please try again.'),
      }
    );
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => prev && ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleDietaryOption = (optionId: string) => {
    setFormData(prev => prev && ({
      ...prev,
      dietaryOptions: prev.dietaryOptions.includes(optionId)
        ? prev.dietaryOptions.filter(d => d !== optionId)
        : [...prev.dietaryOptions, optionId]
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData(prev => prev && ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter(c => c !== cuisine)
        : [...prev.cuisine, cuisine]
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => prev && ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Profile', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Profile', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn't load restaurant data. Pull down to retry or check your connection.</Text>
        </View>
      </>
    );
  }

  if (!restaurant || !formData) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Profile', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No restaurant is linked to your account yet. Contact support to get set up.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={updateRestaurant.isPending}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              {updateRestaurant.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Save size={20} color="#fff" />
              )}
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
              onChangeText={(text) => setFormData(prev => prev && ({ ...prev, name: text }))}
              placeholder="Enter restaurant name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => prev && ({ ...prev, description: text }))}
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
              onChangeText={(text) => setFormData(prev => prev && ({ ...prev, address: text }))}
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
                  onPress={() => setFormData(prev => prev && ({ ...prev, priceLevel: level as '$' | '$$' | '$$$' }))}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: formData.priceLevel === level }}
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
                onChangeText={(text) => setFormData(prev => prev && ({ ...prev, phone: text }))}
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
                onChangeText={(text) => setFormData(prev => prev && ({ ...prev, website: text }))}
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
                onChangeText={(text) => setFormData(prev => prev && ({ ...prev, instagram: text }))}
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
                onChangeText={(text) => setFormData(prev => prev && ({ ...prev, facebook: text }))}
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
                accessibilityRole="checkbox"
                accessibilityState={{ checked: formData.cuisine.includes(cuisine) }}
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
                accessibilityRole="checkbox"
                accessibilityState={{ checked: formData.features.includes(feature.id) }}
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
                accessibilityRole="checkbox"
                accessibilityState={{ checked: formData.dietaryOptions.includes(option.id) }}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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