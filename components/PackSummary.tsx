
import React, { useState } from 'react';
import { GearItem, Category, PackAnalysis, TripSettings } from '../types';
import { CATEGORIES } from '../constants';
import { Trash2, AlertCircle, Backpack, Info, Check, AlertTriangle, ShieldCheck, Gem, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface PackSummaryProps {
  items: GearItem[];
  settings: TripSettings;
  onRemove: (id: string) => void;
  onClear: () => void;
  onQuickFeedback: () => void;
  onDeepReview: () => void;
  isThinking: boolean;
  analysis: PackAnalysis | null;
}

const COLORS = ['#429851', '#7f7461', '#988e7d', '#b6ae9f', '#d3cec4', '#e8e6e1', '#31793e', '#52493d'];

export const PackSummary: React.FC<PackSummaryProps> = ({ 
  items, 
  settings,
  onRemove, 
  onClear, 
  onQuickFeedback, 
  onDeepReview,
  isThinking,
  analysis
}) => {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const baseWeight = items.filter(i => !i.isConsumable && !i.isWorn).reduce((sum, item) => sum + item.weight, 0);
  
  // Heuristic for Target Weight calculation
  const getTargetMax = () => {
      let max = 5000;
      if (settings.packStyle === 'Ultralight') max = 5000;
      if (settings.packStyle === 'Balanced') max = 8000;
      if (settings.packStyle === 'Comfort') max = 12000;
      
      // Adjust slightly for trip type
      if (settings.tripType === 'Multi-day') max += 2000;
      
      return max;
  };
  const targetMax = getTargetMax();
  const weightPercent = Math.min((totalWeight / targetMax) * 100, 100);
  
  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    value: items.filter(i => i.category === cat).reduce((sum, i) => sum + i.weight, 0)
  })).filter(d => d.value > 0);

  const formatWeight = (g: number) => {
    if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
    return `${g} g`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 flex flex-col h-[750px]">
      <div className="p-4 border-b border-earth-100 bg-earth-50 rounded-t-xl flex justify-between items-center">
        <h2 className="text-lg font-bold text-earth-800 flex items-center gap-2">
          <Backpack className="w-5 h-5 text-moss-600" />
          My Pack
        </h2>
        <div className="flex gap-2">
            <button
                onClick={() => setViewMode(prev => prev === 'bar' ? 'pie' : 'bar')}
                className="text-xs text-earth-600 hover:text-moss-700 hover:bg-earth-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                title="Toggle View"
            >
                {viewMode === 'bar' ? <PieIcon className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
                {viewMode === 'bar' ? 'Chart' : 'Stats'}
            </button>
            <button 
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            disabled={items.length === 0}
            >
            Clear
            </button>
        </div>
      </div>

      {/* Stats Header / Visualization Area */}
      <div className="p-4 bg-earth-50/50 border-b border-earth-100 min-h-[140px] flex flex-col justify-center relative">
        {viewMode === 'bar' ? (
            <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider font-semibold">Total Weight</p>
                    <p className="text-2xl font-bold text-earth-900">{formatWeight(totalWeight)}</p>
                    </div>
                    <div>
                    <p className="text-xs text-earth-500 uppercase tracking-wider font-semibold">Base Weight</p>
                    <p className="text-xl font-bold text-moss-700">{formatWeight(baseWeight)}</p>
                    </div>
                </div>
                
                {/* Weight Range Indicator */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-earth-400 uppercase tracking-wide">
                        <span>{settings.packStyle} Goal</span>
                        <span>Max {formatWeight(targetMax)}</span>
                    </div>
                    <div className="h-2 w-full bg-earth-200 rounded-full overflow-hidden relative">
                        <div 
                            className={`h-full transition-all duration-500 ${weightPercent > 100 ? 'bg-red-500' : weightPercent > 90 ? 'bg-amber-500' : 'bg-moss-500'}`} 
                            style={{ width: `${weightPercent}%` }}
                        ></div>
                    </div>
                    {analysis?.weightAssessment && (
                        <p className="text-xs text-right font-medium text-moss-700">{analysis.weightAssessment}</p>
                    )}
                </div>
            </div>
        ) : (
            <div className="h-[140px] w-full animate-fadeIn flex items-center justify-center">
                {items.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip formatter={(value: number) => `${value}g`} itemStyle={{ fontSize: '12px' }} />
                            <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-xs text-earth-400 italic">Add items to see chart</p>
                )}
            </div>
        )}
      </div>

      {/* Warnings & Alerts */}
      {analysis && (analysis.missingCategories.length > 0 || analysis.redFlags.length > 0) && (
          <div className="p-3 bg-red-50 border-b border-red-100 space-y-2">
              {analysis.redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-700 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {flag}
                  </div>
              ))}
              {analysis.missingCategories.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-amber-700">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Missing Essentials: {analysis.missingCategories.join(', ')}
                  </div>
              )}
          </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-earth-400 p-8 text-center">
            <Backpack className="w-12 h-12 mb-2 opacity-20" />
            <p>Your pack is empty.</p>
            <p className="text-sm">Select items from the library to start building.</p>
          </div>
        ) : (
          CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="mb-2">
                <h3 className="text-xs font-bold text-earth-500 uppercase px-2 mb-1">{cat}</h3>
                <div className="bg-white rounded-lg overflow-hidden border border-earth-100 shadow-sm">
                  {catItems.map(item => {
                    // Check if essential
                    const isEssential = analysis?.essentialItemIds.includes(item.id);
                    
                    return (
                        <div key={item.id} className="flex justify-between items-center p-2 border-b border-earth-100 last:border-0 hover:bg-earth-50 transition-colors">
                            <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-earth-800 font-medium truncate">{item.name}</span>
                                    {isEssential ? (
                                        <span className="bg-moss-100 text-moss-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex items-center gap-0.5" title="Essential Item">
                                            <ShieldCheck className="w-2.5 h-2.5" /> Essential
                                        </span>
                                    ) : (
                                        <span className="bg-earth-100 text-earth-500 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-0.5" title="Comfort / Optional">
                                            <Gem className="w-2.5 h-2.5" /> Comfort
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-earth-500">
                                    <span className="font-mono">{item.weight}g</span>
                                    {item.notes && <span className="truncate italic max-w-[150px]">- {item.notes}</span>}
                                </div>
                            </div>
                            <button onClick={() => onRemove(item.id)} className="text-earth-300 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-earth-200 bg-white rounded-b-xl flex gap-3">
        <button 
          onClick={onQuickFeedback}
          disabled={items.length === 0 || isThinking}
          className="flex-1 bg-moss-100 text-moss-800 py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-moss-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Info className="w-4 h-4" />
          Quick Check
        </button>
        <button 
          onClick={onDeepReview}
          disabled={items.length === 0 || isThinking}
          className="flex-1 bg-earth-800 text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-earth-900 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <AlertCircle className="w-4 h-4" />
          Deep Review
        </button>
      </div>
    </div>
  );
};
