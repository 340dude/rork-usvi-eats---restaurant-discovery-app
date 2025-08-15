export const ISLANDS = [
  { id: 'st-thomas', name: 'St. Thomas', emoji: '🏝️' },
  { id: 'st-john', name: 'St. John', emoji: '🌴' },
  { id: 'st-croix', name: 'St. Croix', emoji: '🏖️' },
  { id: 'water-island', name: 'Water Island', emoji: '⛵' },
] as const;

export const CUISINES = [
  'Caribbean',
  'American',
  'Italian',
  'Mexican',
  'Seafood',
  'Asian',
  'French',
  'Pizza',
  'Burgers',
  'Sushi',
  'Vegetarian',
  'Bakery',
  'Bar & Grill',
] as const;

export const FEATURES = [
  { id: 'waterfront', label: 'Waterfront', icon: '🌊' },
  { id: 'parking', label: 'Parking', icon: '🚗' },
  { id: 'kid-friendly', label: 'Kid Friendly', icon: '👶' },
  { id: 'live-music', label: 'Live Music', icon: '🎵' },
  { id: 'outdoor-seating', label: 'Outdoor Seating', icon: '☀️' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'takeout', label: 'Takeout', icon: '🥡' },
  { id: 'delivery', label: 'Delivery', icon: '🚚' },
] as const;

export const DIETARY_OPTIONS = [
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'gluten-free', label: 'Gluten Free', icon: '🌾' },
  { id: 'dairy-free', label: 'Dairy Free', icon: '🥛' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
] as const;

export const PRICE_LEVELS = [
  { id: '$', label: 'Budget', description: 'Under $15' },
  { id: '$$', label: 'Moderate', description: '$15-30' },
  { id: '$$$', label: 'Upscale', description: 'Over $30' },
] as const;