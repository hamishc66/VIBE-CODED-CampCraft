import React, { useState, useEffect, useCallback } from 'react';
import { GearLibrary } from './components/GearLibrary';
import { PackSummary } from './components/PackSummary';
import { TripSettingsPanel } from './components/TripSettings';
import { AIFeedback } from './components/AIFeedback';
import { GearItem, TripSettings, ChatMessage, AIStatus, PackAnalysis, Preset, SuggestedItem } from './types';
import { INITIAL_SETTINGS, DEFAULT_GEAR_LIBRARY } from './constants';
import { getQuickFeedback, getDeepReview, sendChatMessage, searchGearInfo, analyzePack, getGearSuggestions } from './services/gemini';
import { Mountain } from 'lucide-react';

const App: React.FC = () => {
  const [tripSettings, setTripSettings] = useState<TripSettings>(INITIAL_SETTINGS);
  const [packItems, setPackItems] = useState<GearItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  
  // Analysis State
  const [packAnalysis, setPackAnalysis] = useState<PackAnalysis | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  // Debounced Analysis Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (packItems.length > 0) {
        const result = await analyzePack(packItems, tripSettings);
        setPackAnalysis(result);
      } else {
        setPackAnalysis(null);
      }
    }, 1500); // 1.5s debounce

    return () => clearTimeout(timer);
  }, [packItems, tripSettings]);

  // Clear suggestions when trip changes significantly or items change
  useEffect(() => {
    setSuggestions([]);
  }, [tripSettings.tripType, tripSettings.season]);

  const addToPack = (item: GearItem) => {
    // Create a unique instance for the pack
    const instance: GearItem = {
      ...item,
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setPackItems(prev => [...prev, instance]);
    
    // Remove from suggestions if added
    setSuggestions(prev => prev.filter(s => s.name !== item.name));
  };

  const removeFromPack = (id: string) => {
    setPackItems(prev => prev.filter(item => item.id !== id));
  };

  const clearPack = () => {
      setPackItems([]);
      setPackAnalysis(null);
  };

  const applyPreset = (preset: Preset) => {
      setTripSettings(preset.settings);
      
      const newItems = preset.itemIds
        .map(id => DEFAULT_GEAR_LIBRARY.find(i => i.id === id))
        .filter((i): i is GearItem => !!i)
        .map(item => ({
             ...item,
             id: `${item.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      
      setPackItems(newItems);
  };

  const fetchSuggestions = async () => {
      setIsSuggestionsLoading(true);
      const res = await getGearSuggestions(packItems, tripSettings);
      setSuggestions(res);
      setIsSuggestionsLoading(false);
  };

  const addMessage = (role: 'user' | 'model', content: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, newMsg]);
  };

  // 1. Quick Feedback (Gemini Fast)
  const handleQuickFeedback = async () => {
    setAiStatus('loading');
    addMessage('user', 'Give me a quick check on this loadout.');
    
    const response = await getQuickFeedback(packItems, tripSettings);
    addMessage('model', response);
    setAiStatus('idle');
  };

  // 2. Deep Review (Gemini Thinking)
  const handleDeepReview = async () => {
    setAiStatus('thinking');
    addMessage('user', 'Please do a deep review of my gear.');
    
    const response = await getDeepReview(packItems, tripSettings);
    addMessage('model', response);
    setAiStatus('idle');
  };

  // 3. Chat (Gemini Pro)
  const handleChat = async (text: string) => {
    setAiStatus('loading');
    addMessage('user', text);

    const serviceHistory = chatHistory.map(m => ({ role: m.role, content: m.content }));
    const response = await sendChatMessage(serviceHistory, text, packItems, tripSettings);
    
    addMessage('model', response);
    setAiStatus('idle');
  };

  // 4. Search (Gemini Flash + Search)
  const handleSearch = async (query: string) => {
      setAiStatus('loading');
      addMessage('user', `Search info for: ${query}`);
      
      const response = await searchGearInfo(query);
      addMessage('model', `**Search Result:**\n\n${response}`);
      setAiStatus('idle');
  };

  return (
    <div className="min-h-screen bg-earth-50 text-earth-900 pb-12">
      {/* Header */}
      <header className="bg-earth-800 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-moss-600 p-2 rounded-lg">
             <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CampCraft</h1>
            <p className="text-xs text-earth-300">Ultralight Loadout Simulator</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context & Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <TripSettingsPanel settings={tripSettings} onChange={setTripSettings} />
          <GearLibrary 
            library={DEFAULT_GEAR_LIBRARY} 
            onAdd={addToPack}
            onApplyPreset={applyPreset}
            onRequestSuggestions={fetchSuggestions}
            suggestions={suggestions}
            isLoadingSuggestions={isSuggestionsLoading}
          />
        </div>

        {/* Center/Right Column: Pack & AI */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <PackSummary 
                items={packItems} 
                settings={tripSettings}
                onRemove={removeFromPack} 
                onClear={clearPack}
                onQuickFeedback={handleQuickFeedback}
                onDeepReview={handleDeepReview}
                isThinking={aiStatus !== 'idle'}
                analysis={packAnalysis}
             />
             <AIFeedback 
                messages={chatHistory}
                onSendMessage={handleChat}
                status={aiStatus}
                onSearch={handleSearch}
             />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;