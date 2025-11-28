import React, { useState } from 'react';
import { GearItem, Category, Preset, SuggestedItem } from '../types';
import { CATEGORIES, PRESETS } from '../constants';
import { Plus, Search, PackagePlus, ArrowUpDown, Filter, Sparkles, Loader2 } from 'lucide-react';

interface GearLibraryProps {
  library: GearItem[];
  onAdd: (item: GearItem) => void;
  onApplyPreset: (preset: Preset) => void;
  onRequestSuggestions: () => void;
  suggestions: SuggestedItem[];
  isLoadingSuggestions: boolean;
}

type SortOption = 'name' | 'weight' | 'category';

export const GearLibrary: React.FC<GearLibraryProps> = ({ 
  library, 
  onAdd, 
  onApplyPreset, 
  onRequestSuggestions,
  suggestions,
  isLoadingSuggestions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortOption>('category');
  
  // Custom item state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState('');
  const [customCategory, setCustomCategory] = useState<Category>('Misc');

  const filteredItems = library.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'weight') return a.weight - b.weight;
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customWeight) return;
    
    const newItem: GearItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      weight: parseFloat(customWeight),
      category: customCategory,
      isConsumable: false,
      isWorn: false
    };
    onAdd(newItem);
    setCustomName('');
    setCustomWeight('');
    setIsAddingCustom(false);
  };

  const handleAddSuggestion = (suggestion: SuggestedItem) => {
    const newItem: GearItem = {
      id: `sugg-${Date.now()}-${Math.random()}`,
      name: suggestion.name,
      weight: suggestion.weight,
      category: suggestion.category,
      isConsumable: false,
      isWorn: false,
      notes: suggestion.reason
    };
    onAdd(newItem);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 flex flex-col h-[750px]">
      <div className="p-4 border-b border-earth-100 bg-earth-50 rounded-t-xl space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-earth-800 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-moss-600" />
            Gear Library
            </h2>
        </div>
        
        {/* Presets */}
        <div className="space-y-1">
            <h3 className="text-xs font-semibold text-earth-500 uppercase tracking-wide">Quick Starters</h3>
            <div className="flex gap-2">
                {PRESETS.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => onApplyPreset(preset)}
                        className="px-3 py-1.5 bg-white border border-earth-200 rounded-lg text-xs font-medium text-earth-700 hover:border-moss-400 hover:bg-moss-50 transition-all shadow-sm flex-1 truncate"
                        title={preset.description}
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="Search gear items..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 focus:border-transparent outline-none text-earth-900 placeholder-earth-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-[70%]">
                <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors border ${
                    selectedCategory === 'All' 
                    ? 'bg-earth-800 text-white border-earth-800' 
                    : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'
                }`}
                >
                All
                </button>
                {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors border ${
                    selectedCategory === cat 
                        ? 'bg-moss-600 text-white border-moss-600' 
                        : 'bg-white text-earth-600 border-earth-200 hover:bg-earth-50'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
            
            <div className="flex items-center gap-1 border-l border-earth-200 pl-2 ml-2">
                <ArrowUpDown className="w-3 h-3 text-earth-400" />
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs bg-transparent border-none focus:ring-0 text-earth-600 cursor-pointer font-medium"
                >
                    <option value="category">Category</option>
                    <option value="weight">Weight</option>
                    <option value="name">Name</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Gear Section */}
      <div className="bg-moss-50/50 border-b border-moss-100 p-2">
         {suggestions.length === 0 ? (
             <button 
                onClick={onRequestSuggestions}
                disabled={isLoadingSuggestions}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-moss-700 bg-white border border-moss-200 rounded-lg hover:bg-moss-50 transition-colors shadow-sm disabled:opacity-70"
             >
                {isLoadingSuggestions ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {isLoadingSuggestions ? 'Finding gear...' : 'Get AI Suggestions'}
             </button>
         ) : (
             <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                     <h3 className="text-xs font-bold text-moss-800 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Recommended for you</h3>
                     <button onClick={onRequestSuggestions} className="text-[10px] text-moss-600 hover:underline">Refresh</button>
                 </div>
                 {suggestions.map((s, idx) => (
                     <div key={idx} className="flex justify-between items-start bg-white p-2 rounded-lg border border-moss-100 shadow-sm">
                         <div>
                             <p className="text-xs font-bold text-earth-800">{s.name}</p>
                             <p className="text-[10px] text-earth-500">{s.reason}</p>
                         </div>
                         <button onClick={() => handleAddSuggestion(s)} className="text-moss-600 hover:bg-moss-50 p-1 rounded">
                             <Plus className="w-4 h-4" />
                         </button>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredItems.map(item => (
          <div key={item.id} className="group flex items-center justify-between p-2 hover:bg-earth-50 rounded-lg transition-colors border border-transparent hover:border-earth-100">
            <div className="min-w-0">
              <p className="font-medium text-earth-900 text-sm truncate">{item.name}</p>
              <div className="flex gap-2 text-xs text-earth-500">
                <span>{item.category}</span>
                <span>•</span>
                <span>{item.weight}g</span>
              </div>
            </div>
            <button
              onClick={() => onAdd(item)}
              className="p-1.5 text-moss-600 hover:bg-moss-50 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-moss-200 bg-white shadow-sm"
              title="Add to pack"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-earth-400 text-sm">
            No items found.
          </div>
        )}
      </div>

      {/* Add Custom Item Toggle */}
      <div className="p-3 border-t border-earth-100 bg-earth-50 rounded-b-xl">
        {!isAddingCustom ? (
          <button 
            onClick={() => setIsAddingCustom(true)}
            className="w-full py-2 text-sm text-moss-700 font-medium hover:bg-moss-50 rounded-lg border border-dashed border-moss-300 transition-colors bg-white"
          >
            + Create Custom Item
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="space-y-2 bg-white p-2 rounded-lg border border-earth-200">
            <input 
              className="w-full text-sm p-2 border border-earth-200 rounded bg-white text-earth-900 focus:ring-1 focus:ring-moss-400 outline-none" 
              placeholder="Item Name" 
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <input 
                type="number"
                className="w-1/3 text-sm p-2 border border-earth-200 rounded bg-white text-earth-900 focus:ring-1 focus:ring-moss-400 outline-none" 
                placeholder="Weight (g)" 
                value={customWeight}
                onChange={e => setCustomWeight(e.target.value)}
              />
              <select 
                className="w-2/3 text-sm p-2 border border-earth-200 rounded bg-white text-earth-900 focus:ring-1 focus:ring-moss-400 outline-none"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value as Category)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-moss-600 text-white text-xs py-2 rounded hover:bg-moss-700 font-medium">Add Item</button>
              <button type="button" onClick={() => setIsAddingCustom(false)} className="flex-1 bg-earth-100 text-earth-700 text-xs py-2 rounded hover:bg-earth-200 border border-earth-200">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};