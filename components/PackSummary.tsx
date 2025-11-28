
import React, { useState } from 'react';
import { GearItem, Category, PackAnalysis, TripSettings } from '../types';
import { CATEGORIES } from '../constants';
import { Trash2, AlertCircle, Backpack, Info, AlertTriangle, ShieldCheck, Gem, PieChart as PieIcon, BarChart3, TrendingDown, Scale, History, Eraser } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface PackSummaryProps {
  items: GearItem[];
  settings: TripSettings;
  onRemove: (id: string) => void;
  onClear: () => void;
  onQuickFeedback: () => void;
  onDeepReview: () => void;
  onStripToEssentials: () => void;
  onTakeSnapshot: () => void;
  snapshot: { weight: number; date: number } | null;
  isThinking: boolean;
  analysis: PackAnalysis | null;
}

const COLORS = ['#429851', '#7f7461', '#988e7d', '#b6ae9f', '#d3cec4', '#e8e6e1', '#31793e', '#52493d'];

export const PackSummary: React.FC<PackSummaryProps> = ({ 
  items = [], 
  settings,
  onRemove, 
  onClear, 
  onQuickFeedback, 
  onDeepReview,
  onStripToEssentials,
  onTakeSnapshot,
  snapshot,
  isThinking,
  analysis
}) => {
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');

  // Safeguard against NaN or undefined weights
  const validItems = items.map(item => ({
      ...item,
      weight: (typeof item.weight === 'number' && !isNaN(item.weight)) ? item.weight : 0
  }));

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);
  const baseWeight = validItems.filter(i => !i.isConsumable && !i.isWorn).reduce((sum, item) => sum + item.weight, 0);
  
  const getTargetMax = () => {
      let max = 5000;
      if (settings.packStyle === 'Ultralight') max = 5000;
      if (settings.packStyle === 'Balanced') max = 8000;
      if (settings.packStyle === 'Comfort') max = 12000;
      if (settings.tripType === 'Multi-day') max += 2000;
      return max;
  };
  const targetMax = getTargetMax();
  const weightPercent = Math.min((totalWeight / targetMax) * 100, 100) || 0;
  
  const calculateULScore = () => {
      if (validItems.length === 0) return 100;
      let threshold = 4500; // 4.5kg for UL
      if (settings.tripType === 'Multi-day') threshold += 1500;
      if (settings.season === 'Winter') threshold += 2000;
      
      const diff = Math.max(0, baseWeight - threshold);
      const score = Math.max(0, 100 - (diff / 100)); 
      return Math.round(score) || 0;
  };
  const ulScore = calculateULScore();

  const heaviestItems = [...validItems]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    value: validItems.filter(i => i.category === cat).reduce((sum, i) => sum + i.weight, 0)
  })).filter(d => d.value > 0);

  const formatWeight = (g: number) => {
    if (isNaN(g)) return '0 g';
    if (g >= 1000) return `${(g / 1000).toFixed(2)} kg`;
    return `${g} g`;
  };

  const getScoreColor = (score: number) => {
      if (score >= 80) return 'text-moss-700 bg-moss-50 border-moss-200';
      if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200';
      return 'text-red-700 bg-red-50 border-red-200';
  };

  const getBarColor = (percent: number) => {
    if (percent > 100) return 'bg-red-500';
    if (percent > 85) return 'bg-amber-500';
    return 'bg-moss-500';
  };

  const missingCategories = analysis?.missingCategories || [];
  const redFlags = analysis?.redFlags || [];
  const essentialItemIds = analysis?.essentialItemIds || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-earth-200 flex flex-col h-[800px]">
      <div className="p-4 border-b border-earth-100 bg-earth-50 rounded-t-xl flex justify-between items-center">
        <h2 className="text-base font-bold text-earth-800 flex items-center gap-2">
          <Backpack className="w-5 h-5 text-moss-600" />
          My Pack
        </h2>
        <div className="flex gap-2">
            <button
                onClick={() => setViewMode(prev => prev === 'bar' ? 'pie' : 'bar')}
                className="text-xs text-earth-600 hover:text-moss-700 hover:bg-white px-2 py-1.5 border border-transparent hover:border-earth-200 rounded transition-all flex items-center gap-1"
                title="Toggle View"
            >
                {viewMode === 'bar' ? <PieIcon className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
            </button>
            <button
                onClick={onTakeSnapshot}
                className="text-xs text-earth-600 hover:text-moss-700 hover:bg-white px-2 py-1.5 border border-transparent hover:border-earth-200 rounded transition-all flex items-center gap-1"
                title="Save Snapshot"
            >
                <History className="w-4 h-4" />
            </button>
            <button 
                onClick={onClear}
                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1.5 rounded transition-all border border-transparent hover:border-red-100"
                disabled={items.length === 0}
            >
                Clear
            </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="p-5 bg-white border-b border-earth-100">
         <div className="flex items-start justify-between mb-4">
             {/* Weight Block */}
             <div>
                <p className="text-[10px] text-earth-400 uppercase tracking-widest font-bold mb-1">Total Weight</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black text-earth-900 tracking-tight">{formatWeight(totalWeight)}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-earth-500">Base: <span className="font-semibold text-moss-700">{formatWeight(baseWeight)}</span></p>
                    {snapshot && (
                        <span className={`text-[10px] font-bold flex items-center px-1.5 py-0.5 rounded ${totalWeight < snapshot.weight ? 'bg-moss-50 text-moss-700' : 'bg-red-50 text-red-600'}`}>
                            {totalWeight < snapshot.weight ? <TrendingDown className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5 rotate-180" />}
                            {formatWeight(Math.abs(totalWeight - snapshot.weight))}
                        </span>
                    )}
                </div>
            </div>

            {/* Score Block */}
            <div className={`flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 ${getScoreColor(ulScore)} shadow-sm`}>
                 <span className="text-3xl font-black leading-none">{ulScore}</span>
                 <span className="text-[9px] font-bold uppercase tracking-wider mt-1">UL Score</span>
            </div>
         </div>
         
         {/* Charts */}
         <div className="bg-earth-50/50 rounded-lg p-3 border border-earth-100">
            {viewMode === 'bar' ? (
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-earth-500 font-medium uppercase tracking-wide">
                        <span>0 kg</span>
                        <span>Goal: {settings.packStyle}</span>
                        <span>Max {formatWeight(targetMax)}</span>
                    </div>
                    <div className="h-4 w-full bg-earth-200 rounded-full overflow-hidden relative shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out ${getBarColor(weightPercent)}`} 
                            style={{ width: `${weightPercent}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/40" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[140px] w-full flex items-center justify-center">
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
                </div>
            )}
        </div>
      </div>

      {/* Warnings & Alerts */}
      {analysis && (missingCategories.length > 0 || redFlags.length > 0) && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 space-y-2 animate-in slide-in-from-top-2">
              {redFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-800 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{flag}</span>
                  </div>
              ))}
              {missingCategories.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-amber-800 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>Missing: <span className="font-bold">{missingCategories.join(', ')}</span></span>
                  </div>
              )}
          </div>
      )}

      {/* Top Heaviest Items */}
      {items.length > 0 && (
          <div className="bg-white px-5 py-3 border-b border-earth-100">
              <h4 className="text-[10px] font-bold text-earth-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> Heaviest Items
              </h4>
              <div className="space-y-2">
                  {heaviestItems.map((item, idx) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                             <span className="text-earth-400 font-mono w-4 font-bold">{idx + 1}.</span>
                             <span className="text-earth-700 font-medium truncate max-w-[150px]">{item.name}</span>
                          </div>
                          <span className="text-earth-600 font-mono bg-earth-50 px-1.5 py-0.5 rounded border border-earth-100">{formatWeight(item.weight)}</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Strip to Essentials Option */}
      {analysis && essentialItemIds.length > 0 && items.length > essentialItemIds.length && (
          <div className="px-5 py-3 bg-amber-50/50 border-b border-amber-100 flex justify-between items-center">
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                  <Eraser className="w-3.5 h-3.5" /> Pack feels heavy?
              </span>
              <button 
                  onClick={onStripToEssentials}
                  className="text-[10px] font-bold bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-50 hover:border-amber-300 transition-all"
              >
                  Strip Non-Essentials
              </button>
          </div>
      )}

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-earth-50/20">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-earth-400 p-8 text-center">
            <Backpack className="w-16 h-16 mb-4 opacity-10 text-earth-900" />
            <p className="font-bold text-earth-600 text-sm">Your pack is empty</p>
            <p className="text-xs mt-1">Add gear from the library to start planning.</p>
          </div>
        ) : (
          CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (catItems.length === 0) return null;
            return (
              <div key={cat} className="space-y-1">
                <h3 className="text-[10px] font-bold text-earth-400 uppercase px-1 tracking-wider">{cat}</h3>
                <div className="bg-white rounded-xl overflow-hidden border border-earth-100 shadow-sm">
                  {catItems.map(item => {
                    const isEssential = essentialItemIds.includes(item.id);
                    return (
                        <div key={item.id} className="flex justify-between items-center p-3 border-b border-earth-50 last:border-0 hover:bg-earth-50 transition-colors group">
                            <div className="min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-sm text-earth-800 font-semibold truncate">{item.name}</span>
                                    {isEssential ? (
                                        <ShieldCheck className="w-3.5 h-3.5 text-moss-500" title="Essential Safety Item" />
                                    ) : (
                                        <Gem className="w-3.5 h-3.5 text-earth-200 group-hover:text-amber-400 transition-colors" title="Comfort Item" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-earth-500">
                                    <span className="font-mono bg-earth-100 px-1.5 rounded text-[10px] font-medium text-earth-700">{item.weight}g</span>
                                    {item.notes && <span className="truncate italic opacity-70 max-w-[180px]">{item.notes}</span>}
                                </div>
                            </div>
                            <button onClick={() => onRemove(item.id)} className="text-earth-300 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all">
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
      <div className="p-4 border-t border-earth-200 bg-white rounded-b-xl flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <button 
          onClick={onQuickFeedback}
          disabled={items.length === 0 || isThinking}
          className="flex-1 bg-white border border-moss-200 text-moss-700 py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-moss-50 hover:border-moss-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-earth-50"
        >
          <Info className="w-4 h-4" />
          Quick Check
        </button>
        <button 
          onClick={onDeepReview}
          disabled={items.length === 0 || isThinking}
          className="flex-1 bg-earth-800 text-white py-3.5 px-4 rounded-xl text-sm font-bold hover:bg-earth-900 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isThinking ? <span className="animate-pulse">AI Thinking...</span> : <>
            <AlertCircle className="w-4 h-4" /> Deep Review
          </>}
        </button>
      </div>
    </div>
  );
};
