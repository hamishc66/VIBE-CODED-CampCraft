
import { GearItem, Category, TripSettings, Preset } from './types';

export const CATEGORIES: Category[] = [
  'Shelter', 'Sleep', 'Clothing', 'Cooking', 'Water', 'Safety', 'Electronics', 'Misc'
];

export const INITIAL_SETTINGS: TripSettings = {
  tripType: 'Overnight',
  environment: 'Forest',
  season: 'Summer',
  lowTemp: 10,
  distancePerDay: 15,
  waterAvailability: 'Occasional',
  location: '',
  packStyle: 'Balanced',
  weatherCondition: 'Clear',
  partySize: 1
};

export const DEFAULT_GEAR_LIBRARY: GearItem[] = [
  // Shelter
  { id: '1', name: 'Ultralight Tent (1p)', category: 'Shelter', weight: 800, isConsumable: false, isWorn: false, notes: 'Double wall' },
  { id: '2', name: 'Tarp & Bivy Combo', category: 'Shelter', weight: 450, isConsumable: false, isWorn: false },
  { id: '3', name: 'Hammock Setup', category: 'Shelter', weight: 950, isConsumable: false, isWorn: false },
  { id: '4', name: 'Tent Stakes (6)', category: 'Shelter', weight: 80, isConsumable: false, isWorn: false },

  // Sleep
  { id: '10', name: 'Down Quilt (0°C)', category: 'Sleep', weight: 600, isConsumable: false, isWorn: false },
  { id: '11', name: 'Sleeping Bag (-5°C)', category: 'Sleep', weight: 1100, isConsumable: false, isWorn: false },
  { id: '12', name: 'Inflatable Pad (R3.5)', category: 'Sleep', weight: 350, isConsumable: false, isWorn: false },
  { id: '13', name: 'Foam Pad (CCF)', category: 'Sleep', weight: 250, isConsumable: false, isWorn: false },
  { id: '14', name: 'Inflatable Pillow', category: 'Sleep', weight: 60, isConsumable: false, isWorn: false },

  // Clothing
  { id: '20', name: 'Rain Jacket', category: 'Clothing', weight: 200, isConsumable: false, isWorn: false },
  { id: '21', name: 'Puffy Jacket (Down)', category: 'Clothing', weight: 300, isConsumable: false, isWorn: false },
  { id: '22', name: 'Fleece Midlayer', category: 'Clothing', weight: 350, isConsumable: false, isWorn: false },
  { id: '23', name: 'Hiking Shirt', category: 'Clothing', weight: 150, isConsumable: false, isWorn: true },
  { id: '24', name: 'Hiking Pants', category: 'Clothing', weight: 300, isConsumable: false, isWorn: true },
  { id: '25', name: 'Extra Socks', category: 'Clothing', weight: 60, isConsumable: false, isWorn: false },
  { id: '26', name: 'Base Layer (Top)', category: 'Clothing', weight: 180, isConsumable: false, isWorn: false },
  
  // Cooking
  { id: '30', name: 'Canister Stove', category: 'Cooking', weight: 80, isConsumable: false, isWorn: false },
  { id: '31', name: 'Titanium Pot (750ml)', category: 'Cooking', weight: 100, isConsumable: false, isWorn: false },
  { id: '32', name: 'Spork', category: 'Cooking', weight: 15, isConsumable: false, isWorn: false },
  { id: '33', name: 'Fuel Canister (Small)', category: 'Cooking', weight: 200, isConsumable: true, isWorn: false },
  { id: '34', name: 'Food (per day)', category: 'Cooking', weight: 700, isConsumable: true, isWorn: false },

  // Water
  { id: '40', name: 'Water Filter (Squeeze)', category: 'Water', weight: 80, isConsumable: false, isWorn: false },
  { id: '41', name: 'Smartwater Bottle (1L)', category: 'Water', weight: 40, isConsumable: false, isWorn: false },
  { id: '42', name: 'Water Bladder (2L)', category: 'Water', weight: 150, isConsumable: false, isWorn: false },
  { id: '43', name: 'Chlorine Tabs', category: 'Water', weight: 10, isConsumable: false, isWorn: false },
  { id: '44', name: 'Water (1L)', category: 'Water', weight: 1000, isConsumable: true, isWorn: false },

  // Safety
  { id: '50', name: 'First Aid Kit (Basic)', category: 'Safety', weight: 150, isConsumable: false, isWorn: false },
  { id: '51', name: 'Headlamp', category: 'Safety', weight: 90, isConsumable: false, isWorn: false },
  { id: '52', name: 'Mini Knife', category: 'Safety', weight: 40, isConsumable: false, isWorn: false },
  { id: '53', name: 'Fire Starter', category: 'Safety', weight: 25, isConsumable: false, isWorn: false },
  { id: '54', name: 'Compass', category: 'Safety', weight: 30, isConsumable: false, isWorn: false },
  { id: '55', name: 'Satellite Messenger', category: 'Safety', weight: 120, isConsumable: false, isWorn: false },

  // Electronics
  { id: '60', name: 'Power Bank (10k mAh)', category: 'Electronics', weight: 200, isConsumable: false, isWorn: false },
  { id: '61', name: 'Charging Cables', category: 'Electronics', weight: 50, isConsumable: false, isWorn: false },
  { id: '62', name: 'Smartphone', category: 'Electronics', weight: 200, isConsumable: false, isWorn: false },

  // Misc
  { id: '70', name: 'Trekking Poles', category: 'Misc', weight: 500, isConsumable: false, isWorn: false },
  { id: '71', name: 'Trowel', category: 'Misc', weight: 20, isConsumable: false, isWorn: false },
  { id: '72', name: 'Toilet Paper', category: 'Misc', weight: 50, isConsumable: true, isWorn: false },
  { id: '73', name: 'Backpack (40L)', category: 'Misc', weight: 900, isConsumable: false, isWorn: false },
];

export const PRESETS: Preset[] = [
  {
    id: 'day-hike',
    name: 'Day Hike',
    description: 'Essentials for a safe day out.',
    settings: {
      tripType: 'Day Hike',
      environment: 'Forest',
      season: 'Summer',
      lowTemp: 15,
      distancePerDay: 10,
      waterAvailability: 'Occasional',
      location: '',
      packStyle: 'Balanced',
      weatherCondition: 'Clear',
      partySize: 1
    },
    itemIds: ['20', '41', '50', '51', '62', '32', '34'] // Rain Jacket, Bottle, FAK, Headlamp, Phone, Spork, Food
  },
  {
    id: 'overnight',
    name: 'Overnight',
    description: 'Standard 3-season camping setup.',
    settings: {
      tripType: 'Overnight',
      environment: 'Forest',
      season: 'Summer',
      lowTemp: 10,
      distancePerDay: 12,
      waterAvailability: 'Occasional',
      location: '',
      packStyle: 'Balanced',
      weatherCondition: 'Clear',
      partySize: 1
    },
    itemIds: ['1', '10', '12', '14', '20', '22', '30', '31', '32', '33', '34', '40', '41', '50', '51', '73'] 
  },
  {
    id: 'weekend',
    name: 'Weekend Trip',
    description: '2-night trip in mixed terrain.',
    settings: {
      tripType: 'Multi-day',
      environment: 'Mixed',
      season: 'Shoulder',
      lowTemp: 5,
      distancePerDay: 15,
      waterAvailability: 'Frequent',
      location: '',
      packStyle: 'Balanced',
      weatherCondition: 'Clear',
      partySize: 1
    },
    itemIds: ['1', '10', '12', '20', '21', '25', '30', '31', '32', '33', '34', '40', '41', '50', '51', '60', '73']
  }
];
