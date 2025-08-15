import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  Heart, 
  Phone, 
  Globe, 
  Clock,
  Star,
  Navigation,
  Share2,
  AlertCircle,
} from 'lucide-react-native';
import { useRestaurant, useFavorites } from '@/hooks/use-restaurants';
import { Platform } from 'react-native';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: restaurant, isLoading } = useRestaurant(id as string);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedMenuCategory, setSelectedMenuCategory] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<'hours' | 'menu' | 'contact' | 'closed' | 'other'>('other');
  const [reportDescription, setReportDescription] = useState('');

  if (isLoading || !restaurant) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  const handleCall = () => {
    if (restaurant.contact.phone) {
      Linking.openURL(`tel:${restaurant.contact.phone}`);
    }
  };

  const handleWebsite = () => {
    if (restaurant.contact.website) {
      Linking.openURL(restaurant.contact.website);
    }
  };

  const handleDirections = () => {
    const { latitude, longitude } = restaurant.location.coordinates;
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}${latitude},${longitude}?q=${encodeURIComponent(restaurant.name)}`,
      android: `${scheme}${latitude},${longitude}?q=${encodeURIComponent(restaurant.location.address)}`,
      default: `https://maps.google.com/?q=${latitude},${longitude}`,
    });
    
    if (url) Linking.openURL(url);
  };

  const getDayHours = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = restaurant.hours[today];
    
    if (!hours || hours.closed) return 'Closed today';
    return `${hours.open} - ${hours.close}`;
  };

  const handleReportSubmit = () => {
    if (!reportDescription.trim()) {
      Alert.alert('Error', 'Please describe the issue');
      return;
    }
    
    // In production, this would submit to your API
    Alert.alert(
      'Report Submitted',
      'Thank you for helping us keep information accurate. We will review your report shortly.',
      [{ text: 'OK', onPress: () => {
        setShowReportModal(false);
        setReportDescription('');
        setReportType('other');
      }}]
    );
  };

  const reportTypes = [
    { id: 'hours' as const, label: 'Incorrect Hours' },
    { id: 'menu' as const, label: 'Menu/Prices Wrong' },
    { id: 'contact' as const, label: 'Contact Info Wrong' },
    { id: 'closed' as const, label: 'Permanently Closed' },
    { id: 'other' as const, label: 'Other Issue' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurant.images.hero }} style={styles.heroImage} />
        <View style={styles.imageOverlay}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(restaurant.id)}
          >
            <Heart 
              size={24} 
              color="#fff" 
              fill={isFavorite(restaurant.id) ? '#FF5252' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFB800" fill="#FFB800" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
            <Text style={styles.reviewCount}>({restaurant.reviewCount} reviews)</Text>
          </View>
        </View>

        <Text style={styles.description}>{restaurant.description}</Text>

        <View style={styles.info}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cuisine</Text>
              <Text style={styles.infoValue}>{restaurant.cuisine.join(' • ')}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>{restaurant.priceLevel}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hours Today</Text>
              <View style={styles.hoursContainer}>
                <Clock size={14} color={restaurant.isOpen ? '#4CAF50' : '#757575'} />
                <Text style={[styles.infoValue, restaurant.isOpen ? styles.open : styles.closed]}>
                  {getDayHours()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.address}>{restaurant.location.address}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Phone size={20} color="#00BCD4" />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleDirections}>
            <Navigation size={20} color="#00BCD4" />
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>
          
          {restaurant.contact.website && (
            <TouchableOpacity style={styles.actionButton} onPress={handleWebsite}>
              <Globe size={20} color="#00BCD4" />
              <Text style={styles.actionText}>Website</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color="#00BCD4" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        {restaurant.features.length > 0 && (
          <View style={styles.features}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featureList}>
              {restaurant.features.map((feature) => (
                <View key={feature} style={styles.featureChip}>
                  <Text style={styles.featureText}>
                    {feature.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.menu}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.menuCategories}
          >
            {restaurant.menu.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedMenuCategory === index && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedMenuCategory(index)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedMenuCategory === index && styles.categoryTabTextActive,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.menuItems}>
            {restaurant.menu[selectedMenuCategory]?.items.map((item) => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemHeader}>
                  <Text style={styles.menuItemName}>
                    {item.name}
                    {item.popular && <Text style={styles.popularBadge}> ⭐ Popular</Text>}
                  </Text>
                  <Text style={styles.menuItemPrice}>
                    {item.price === 'Market Price' ? item.price : `$${item.price}`}
                  </Text>
                </View>
                {item.description && (
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                )}
                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <View style={styles.dietaryTags}>
                    {item.dietaryTags.map((tag) => (
                      <Text key={tag} style={styles.dietaryTag}>{tag}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setShowReportModal(true)}
        >
          <AlertCircle size={16} color="#666" />
          <Text style={styles.reportText}>Report incorrect information</Text>
        </TouchableOpacity>

        <Text style={styles.lastUpdated}>
          Last updated: {new Date(restaurant.lastUpdated).toLocaleDateString()}
        </Text>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Issue</Text>
            <TouchableOpacity onPress={handleReportSubmit}>
              <Text style={styles.modalSubmit}>Submit</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>What&apos;s the issue?</Text>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.reportTypeOption,
                  reportType === type.id && styles.reportTypeSelected
                ]}
                onPress={() => setReportType(type.id)}
              >
                <Text style={[
                  styles.reportTypeText,
                  reportType === type.id && styles.reportTypeTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <Text style={[styles.modalSectionTitle, { marginTop: 24 }]}>Description</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Please describe the issue in detail..."
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: width,
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  info: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  open: {
    color: '#4CAF50',
  },
  closed: {
    color: '#757575',
  },
  address: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '500',
  },
  features: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E0F7FA',
    borderRadius: 16,
  },
  featureText: {
    fontSize: 13,
    color: '#00838F',
  },
  menu: {
    marginBottom: 24,
  },
  menuCategories: {
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  categoryTabActive: {
    backgroundColor: '#00BCD4',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: '#fff',
  },
  menuItems: {
    gap: 16,
  },
  menuItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  popularBadge: {
    fontSize: 12,
    color: '#FFB800',
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  dietaryTags: {
    flexDirection: 'row',
    gap: 6,
  },
  dietaryTag: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 8,
  },
  reportText: {
    fontSize: 14,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalSubmit: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reportTypeOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  reportTypeSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#E0F7FA',
  },
  reportTypeText: {
    fontSize: 16,
    color: '#333',
  },
  reportTypeTextSelected: {
    color: '#00838F',
    fontWeight: '500',
  },
  reportInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
});