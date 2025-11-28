
import React from 'react';
import { TripSettings } from '../types';
import { Map, Thermometer, Droplets, Calendar, Users, Scale, CloudSun } from 'lucide-react';

interface TripSettingsPanelProps {
  settings: TripSettings;
  onChange: (newSettings: TripSettings) => void;
}

export const TripSettingsPanel: React.FC<TripSettingsPanelProps> = ({ settings, onChange }) => {
  const handleChange = (key: keyof TripSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-4 mb-4">
      <h2 className="text-lg font-bold text-earth-800 mb-4 flex items-center gap-2">
        <Map className="w-5 h-5 text-moss-600" />
        Trip Context
      </h2>
      
      <div className="space-y-4">
        {/* Row 1: Location & Type */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-earth-500 uppercase">Location</label>
             <input 
                type="text"
                className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
                placeholder="e.g. Yosemite"
                value={settings.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
             />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase">Trip Type</label>
            <select 
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.tripType}
              onChange={(e) => handleChange('tripType', e.target.value)}
            >
              <option>Day Hike</option>
              <option>Overnight</option>
              <option>Multi-day</option>
            </select>
          </div>
        </div>

        {/* Row 2: Style & Party */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
             <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
                <Scale className="w-3 h-3" /> Pack Style
             </label>
             <select 
                className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
                value={settings.packStyle}
                onChange={(e) => handleChange('packStyle', e.target.value)}
             >
                <option>Ultralight</option>
                <option>Balanced</option>
                <option>Comfort</option>
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
                <Users className="w-3 h-3" /> Party Size
             </label>
             <input 
                type="number"
                min={1}
                className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
                value={settings.partySize}
                onChange={(e) => handleChange('partySize', parseInt(e.target.value))}
             />
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-earth-100 my-2"></div>

        {/* Row 3: Environmental Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Environment */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase">Terrain</label>
            <select 
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.environment}
              onChange={(e) => handleChange('environment', e.target.value)}
            >
              <option>Forest</option>
              <option>Desert</option>
              <option>Alpine</option>
              <option>Coastal</option>
              <option>Mixed</option>
            </select>
          </div>

          {/* Weather */}
          <div className="space-y-1">
             <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
                <CloudSun className="w-3 h-3" /> Weather
             </label>
             <select 
                className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
                value={settings.weatherCondition}
                onChange={(e) => handleChange('weatherCondition', e.target.value)}
             >
                <option>Clear</option>
                <option>Rainy</option>
                <option>Stormy</option>
                <option>Snowy</option>
             </select>
          </div>

          {/* Season */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Season
            </label>
            <select 
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.season}
              onChange={(e) => handleChange('season', e.target.value)}
            >
              <option>Summer</option>
              <option>Shoulder</option>
              <option>Winter</option>
            </select>
          </div>

          {/* Low Temp */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
              <Thermometer className="w-3 h-3" /> Low Temp (°C)
            </label>
            <input 
              type="number"
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.lowTemp}
              onChange={(e) => handleChange('lowTemp', parseInt(e.target.value))}
            />
          </div>

          {/* Distance */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase">Km / Day</label>
            <input 
              type="number"
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.distancePerDay}
              onChange={(e) => handleChange('distancePerDay', parseInt(e.target.value))}
            />
          </div>

          {/* Water */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-earth-500 uppercase flex items-center gap-1">
              <Droplets className="w-3 h-3" /> Water
            </label>
            <select 
              className="w-full text-sm p-2 bg-earth-50 border border-earth-200 rounded-lg focus:ring-1 focus:ring-moss-400 outline-none"
              value={settings.waterAvailability}
              onChange={(e) => handleChange('waterAvailability', e.target.value)}
            >
              <option>Frequent</option>
              <option>Occasional</option>
              <option>Rare</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
