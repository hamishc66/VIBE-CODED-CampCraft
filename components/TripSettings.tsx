
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
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-5 mb-6">
      <h2 className="text-base font-bold text-earth-800 mb-5 flex items-center gap-2 pb-2 border-b border-earth-100">
        <Map className="w-5 h-5 text-moss-600" />
        Trip Context
      </h2>
      
      <div className="space-y-5">
        {/* Row 1: Location & Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide">Location</label>
             <input 
                type="text"
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow placeholder-earth-300 text-earth-900"
                placeholder="e.g. Yosemite"
                value={settings.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
             />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide">Trip Type</label>
            <div className="relative">
                <select 
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                value={settings.tripType}
                onChange={(e) => handleChange('tripType', e.target.value)}
                >
                <option>Day Hike</option>
                <option>Overnight</option>
                <option>Multi-day</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>
        </div>

        {/* Row 2: Style & Party */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
             <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
                <Scale className="w-3 h-3 text-earth-400" /> Pack Style
             </label>
             <div className="relative">
                <select 
                    className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                    value={settings.packStyle}
                    onChange={(e) => handleChange('packStyle', e.target.value)}
                >
                    <option>Ultralight</option>
                    <option>Balanced</option>
                    <option>Comfort</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
                <Users className="w-3 h-3 text-earth-400" /> Party Size
             </label>
             <input 
                type="number"
                min={1}
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow"
                value={settings.partySize}
                onChange={(e) => handleChange('partySize', parseInt(e.target.value))}
             />
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-earth-100 my-1"></div>

        {/* Row 3: Environmental Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Environment */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide">Terrain</label>
            <div className="relative">
                <select 
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                value={settings.environment}
                onChange={(e) => handleChange('environment', e.target.value)}
                >
                <option>Forest</option>
                <option>Desert</option>
                <option>Alpine</option>
                <option>Coastal</option>
                <option>Mixed</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-1.5">
             <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
                <CloudSun className="w-3 h-3 text-earth-400" /> Weather
             </label>
             <div className="relative">
                <select 
                    className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                    value={settings.weatherCondition}
                    onChange={(e) => handleChange('weatherCondition', e.target.value)}
                >
                    <option>Clear</option>
                    <option>Rainy</option>
                    <option>Stormy</option>
                    <option>Snowy</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
          </div>

          {/* Season */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-earth-400" /> Season
            </label>
            <div className="relative">
                <select 
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                value={settings.season}
                onChange={(e) => handleChange('season', e.target.value)}
                >
                <option>Summer</option>
                <option>Shoulder</option>
                <option>Winter</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          {/* Low Temp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-earth-400" /> Low Temp (°C)
            </label>
            <input 
              type="number"
              className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow"
              value={settings.lowTemp}
              onChange={(e) => handleChange('lowTemp', parseInt(e.target.value))}
            />
          </div>

          {/* Distance */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide">Km / Day</label>
            <input 
              type="number"
              className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow"
              value={settings.distancePerDay}
              onChange={(e) => handleChange('distancePerDay', parseInt(e.target.value))}
            />
          </div>

          {/* Water */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wide flex items-center gap-1">
              <Droplets className="w-3 h-3 text-earth-400" /> Water
            </label>
            <div className="relative">
                <select 
                className="w-full text-sm px-3 py-2.5 bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 outline-none transition-shadow cursor-pointer appearance-none"
                value={settings.waterAvailability}
                onChange={(e) => handleChange('waterAvailability', e.target.value)}
                >
                <option>Frequent</option>
                <option>Occasional</option>
                <option>Rare</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-earth-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
