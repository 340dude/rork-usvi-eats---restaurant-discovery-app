export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  island: 'St. Thomas' | 'St. John' | 'St. Croix' | 'Water Island';
  cuisine: string[];
  priceLevel: '$' | '$$' | '$$$';
  rating: number;
  reviewCount: number;
  images: {
    hero: string;
    logo?: string;
    gallery: string[];
  };
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    neighborhood?: string;
  };
  contact: {
    phone?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  hours: {
    [key: string]: {
      open?: string;
      close?: string;
      closed?: boolean;
    };
  };
  features: string[];
  dietaryOptions: string[];
  menu: MenuCategory[];
  lastUpdated: string;
  isOpen?: boolean;
  distance?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  options?: MenuItemOption[];
  dietaryTags?: string[];
  popular?: boolean;
}

export interface MenuItemOption {
  name: string;
  price?: string;
}

export interface SearchFilters {
  island?: string;
  cuisine?: string;
  priceLevel?: string[];
  features?: string[];
  dietaryOptions?: string[];
  openNow?: boolean;
  query?: string;
}

export interface RestaurantOwner {
  id: string;
  email: string;
  phone: string;
  name: string;
  restaurantIds: string[];
  verified: boolean;
  verificationMethod?: 'email' | 'phone' | 'geo-pin';
  createdAt: string;
}

export interface UserReport {
  id: string;
  restaurantId: string;
  userId?: string;
  type: 'hours' | 'menu' | 'contact' | 'closed' | 'other';
  description: string;
  photo?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface SpecialHours {
  id: string;
  restaurantId: string;
  date: string;
  reason: string;
  closed: boolean;
  openTime?: string;
  closeTime?: string;
  createdAt: string;
}

export interface RestaurantAnalytics {
  restaurantId: string;
  period: 'day' | 'week' | 'month';
  profileViews: number;
  callTaps: number;
  directionTaps: number;
  favorites: number;
  topViewedDishes: { itemId: string; itemName: string; views: number }[];
  lastUpdated: string;
}