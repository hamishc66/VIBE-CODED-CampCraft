
export type Category = 'Shelter' | 'Sleep' | 'Clothing' | 'Cooking' | 'Water' | 'Safety' | 'Electronics' | 'Misc';

export interface GearItem {
  id: string;
  name: string;
  category: Category;
  weight: number; // in grams
  isConsumable: boolean; // food, water, fuel
  isWorn: boolean; // clothes worn
  notes?: string;
}

export interface TripSettings {
  tripType: 'Day Hike' | 'Overnight' | 'Multi-day';
  environment: 'Forest' | 'Desert' | 'Alpine' | 'Coastal' | 'Mixed';
  season: 'Summer' | 'Shoulder' | 'Winter';
  lowTemp: number; // Celsius
  distancePerDay: number; // km
  waterAvailability: 'Frequent' | 'Occasional' | 'Rare';
  location: string;
  packStyle: 'Ultralight' | 'Balanced' | 'Comfort';
  weatherCondition: 'Clear' | 'Rainy' | 'Stormy' | 'Snowy';
  partySize: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export type AIStatus = 'idle' | 'loading' | 'thinking';

export interface PackAnalysis {
  essentialItemIds: string[];
  missingCategories: string[];
  redFlags: string[];
  weightAssessment: string; 
}

export interface SuggestedItem {
  name: string;
  category: Category;
  weight: number; // Approximate numeric weight for adding to pack (average)
  weightDisplay: string; // Text description like "~450g" or "400-500g"
  reason: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  settings: TripSettings;
  itemIds: string[];
}
