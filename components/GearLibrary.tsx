
import React, { useState } from 'react';
import { GearItem, Category, Preset, SuggestedItem } from '../types';
import { CATEGORIES, PRESETS } from '../constants';
import { Plus, Search, PackagePlus, ArrowUpDown, Filter, Sparkles, Loader2, X, Tag, Calculator, Tent, BedDouble, Shirt, Utensils, Droplets, ShieldAlert, Zap, Box } from 'lucide-react';
import { estimateGearWeight } from '../services/gemini';

interface GearLibraryProps {
  library: GearItem[];
  onAdd: (item: GearItem) => void;
  onApplyPreset: (preset: Preset) => void;
  onRequestSuggestions: () => void;
  suggestions: SuggestedItem[];
  isLoadingSuggestions: boolean;
}

type SortOption = 'name' | 'weight' | 'category';

const getCategoryIcon = (category: string) => {
    switch(category) {
        case 'Shelter': return <Tent className="w-3.5 h-3.5" />;
        case 'Sleep': return <BedDouble className="w-3.5 h-3.5" />;
        case 'Clothing': return <Shirt className="w-3.5 h-3.5" />;
        case 'Cooking': return <Utensils className="w-3.5 h-3.5" />;
        case 'Water': return <Droplets className="w-3.5 h-3.5" />;
        case 'Safety': return <ShieldAlert className="w-3.5 h-3.5" />;
        case 'Electronics': return <Zap className="w-3.5 h-3.5" />;
        default: return <Box className="w-3.5 h-3.5" />;
    }
};

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
  const [isEstimatingWeight, setIsEstimatingWeight] = useState(false);
  const [weightError, setWeightError] = useState(false);

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
    setWeightError(false);

    if (!customName || !customWeight) return;
    
    const weightVal = parseFloat(customWeight);
    if (isNaN(weightVal) || weightVal < 0) {
        setWeightError(true);
        return;
    }

    const newItem: GearItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      weight: weightVal,
      category: customCategory,
      isConsumable: false,
      isWorn: false
    };
    onAdd(newItem);
    setCustomName('');
    setCustomWeight('');
    setIsAddingCustom(false);
  };

  const handleEstimateWeight = async () => {
    if (!customName) return;
    setIsEstimatingWeight(true);
    setWeightError(false);
    const weight = await estimateGearWeight(customName);
    if (weight > 0) {
      setCustomWeight(weight.toString());
    }
    setIsEstimatingWeight(false);
  };

  const handleAddSuggestion = (suggestion: SuggestedItem) => {
    const newItem: GearItem = {
      id: `sugg-${Date.now()}-${Math.random()}`,
      name: suggestion.name,
      weight: suggestion.weight || 0, 
      category: suggestion.category,
      isConsumable: false,
      isWorn: false,
      notes: suggestion.reason
    };
    onAdd(newItem);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 flex flex-col h-[800px] overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-earth-100 bg-earth-50/50 space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-earth-800 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-moss-600" />
                Gear Library
            </h2>
        </div>
        
        {/* Presets */}
        <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-earth-400 uppercase tracking-wide">Quick Starters</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {PRESETS.map(preset => (
                    <button
                        key={preset.id}
                        onClick={() => onApplyPreset(preset)}
                        className="flex-shrink-0 px-3 py-2 bg-white border border-earth-200 rounded-lg text-xs font-medium text-earth-700 hover:border-moss-400 hover:bg-moss-50 transition-all shadow-sm whitespace-nowrap"
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
            <label className="sr-only">Search Items</label>
            <Search className="absolute left-3 top-3 w-4 h-4 text-earth-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-earth-200 rounded-lg focus:ring-2 focus:ring-moss-400 focus:border-transparent outline-none text-earth-900 placeholder-earth-400 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-earth-400 hover:text-earth-600">
                    <X className="w-4 h-4" />
                </button>
            )}
          </div>
          
          <div className="flex gap-3">
             <div className="relative flex-1">
                <select 
                   className="w-full appearance-none bg-white border border-earth-200 text-earth-700 text-xs py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-moss-400 cursor-pointer shadow-sm"
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
                >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Filter className="w-3.5 h-3.5 text-earth-400 absolute right-3 top-3 pointer-events-none" />
             </div>

             <div className="relative w-1/3">
                 <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full appearance-none bg-white border border-earth-200 text-earth-700 text-xs py-2.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-moss-400 cursor-pointer shadow-sm"
                 >
                    <option value="category">Category</option>
                    <option value="weight">Weight</option>
                    <option value="name">Name</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-earth-400 absolute right-3 top-3 pointer-events-none" />
             </div>
          </div>
        </div>
      </div>

      {/* Suggested Gear Section */}
      <div className="bg-moss-50/30 border-b border-moss-100 p-4">
         {suggestions.length === 0 ? (
             <button 
                onClick={onRequestSuggestions}
                disabled={isLoadingSuggestions}
                className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold text-moss-700 bg-white border border-moss-200 rounded-lg hover:bg-moss-50 transition-colors shadow-sm disabled:opacity-70 group"
             >
                {isLoadingSuggestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500 group-hover:text-amber-600" />}
                {isLoadingSuggestions ? 'Researching real gear...' : 'Suggest Missing Essentials'}
             </button>
         ) : (
             <div className="space-y-3">
                 <div className="flex justify-between items-center px-1">
                     <h3 className="text-[10px] font-bold text-moss-800 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Recommended for you
                     </h3>
                     <button onClick={onRequestSuggestions} className="text-[10px] text-moss-600 hover:text-moss-800 underline font-medium">Refresh</button>
                 </div>
                 
                 <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-amber-900 leading-tight">
                       <span className="font-bold">Disclaimer:</span> Weights are approximate. Suggestions are real examples found via Google Search but are not sponsored. Always verify specs.
                    </p>
                 </div>

                 <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {suggestions.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-start bg-white p-3 rounded-lg border border-moss-100 shadow-sm hover:border-moss-300 transition-colors group">
                            <div className="flex-1 pr-3">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold text-earth-900 leading-snug">{s.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-earth-600 bg-earth-100 px-1.5 py-0.5 rounded">{s.category}</span>
                                        <span className="text-[10px] bg-moss-50 text-moss-800 px-1.5 py-0.5 rounded font-semibold border border-moss-100">
                                            {s.weightDisplay || `${s.weight}g`}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-earth-600 leading-normal mt-2 pt-2 border-t border-earth-50">{s.reason}</p>
                            </div>
                            <button 
                                onClick={() => handleAddSuggestion(s)} 
                                className="mt-1 text-moss-600 hover:bg-moss-50 p-2 rounded-full border border-transparent hover:border-moss-200 transition-all"
                                title="Add to Pack"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                 </div>
             </div>
         )}
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-white">
        {filteredItems.map(item => (
          <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-earth-50 rounded-lg transition-colors border border-transparent hover:border-earth-100 cursor-pointer" onClick={() => onAdd(item)}>
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-earth-50 border border-earth-100 flex items-center justify-center text-earth-500 group-hover:bg-white group-hover:text-moss-600 transition-colors">
                  {getCategoryIcon(item.category)}
              </div>
              <div>
                  <p className="font-semibold text-earth-900 text-sm truncate">{item.name}</p>
                  <div className="flex gap-2 text-xs text-earth-500 items-center mt-0.5">
                    <span className="text-[10px] bg-earth-100 px-1.5 rounded text-earth-600">{item.category}</span>
                    <span className="font-mono text-earth-700 font-medium">{item.weight}g</span>
                  </div>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(item); }}
              className="p-2 text-moss-600 hover:bg-moss-100 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              title="Add to pack"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-earth-400 text-sm flex flex-col items-center">
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <span>No items found matching your filter.</span>
          </div>
        )}
      </div>

      {/* Add Custom Item Form */}
      <div className="p-4 border-t border-earth-200 bg-earth-50">
        {!isAddingCustom ? (
          <button 
            onClick={() => setIsAddingCustom(true)}
            className="w-full py-3 text-sm text-moss-700 font-bold hover:bg-white hover:shadow-sm rounded-lg border border-dashed border-moss-300 transition-all bg-transparent flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Custom Item
          </button>
        ) : (
          <form onSubmit={handleAddCustom} className="bg-white p-5 rounded-xl border border-earth-200 shadow-lg space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
             <div className="flex justify-between items-center pb-2 border-b border-earth-100">
                 <h3 className="text-xs font-bold text-earth-500 uppercase tracking-wide">Add New Item</h3>
                 <button type="button" onClick={() => setIsAddingCustom(false)} className="text-earth-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
             </div>
             
             <div className="space-y-1.5">
                 <label className="block text-xs font-bold text-earth-700">Item Name</label>
                 <input 
                    className="w-full text-sm px-3 py-2.5 border border-earth-200 rounded-lg bg-white text-earth-900 focus:ring-2 focus:ring-moss-400 outline-none transition-shadow" 
                    placeholder="e.g. My Favorite Mug" 
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    autoFocus
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-earth-700">Weight (g)</label>
                    <input 
                        type="text"
                        inputMode="numeric"
                        className={`w-full text-sm px-3 py-2.5 border rounded-lg bg-white text-earth-900 focus:ring-2 outline-none transition-shadow ${weightError ? 'border-red-500 focus:ring-red-400' : 'border-earth-200 focus:ring-moss-400'}`}
                        placeholder="0" 
                        value={customWeight}
                        onChange={e => {
                            setCustomWeight(e.target.value);
                            if (weightError) setWeightError(false);
                        }}
                    />
                    <button 
                      type="button" 
                      onClick={handleEstimateWeight}
                      disabled={isEstimatingWeight || !customName}
                      className="mt-1 text-[10px] text-moss-600 hover:text-moss-800 flex items-center gap-1.5 disabled:opacity-50 font-medium"
                    >
                      {isEstimatingWeight ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Calculating...</>
                      ) : (
                        <><Calculator className="w-3 h-3" /> Don't know? Ask AI</>
                      )}
                    </button>
                 </div>
                 <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-earth-700">Category</label>
                    <div className="relative">
                        <select 
                            className="w-full text-sm px-3 py-2.5 border border-earth-200 rounded-lg bg-white text-earth-900 focus:ring-2 focus:ring-moss-400 outline-none cursor-pointer appearance-none"
                            value={customCategory}
                            onChange={e => setCustomCategory(e.target.value as Category)}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ArrowUpDown className="w-3 h-3 text-earth-400 absolute right-3 top-3 pointer-events-none opacity-50" />
                    </div>
                 </div>
             </div>

             <button type="submit" className="w-full bg-moss-600 text-white text-sm py-3 rounded-lg hover:bg-moss-700 font-bold shadow-sm transition-colors mt-2">
                 Add Item to Library
             </button>
          </form>
        )}
      </div>
    </div>
  );
};
