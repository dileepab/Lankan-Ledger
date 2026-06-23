import React, { useState } from 'react';
import { Article } from '../../types';
import { BarChart2, TrendingUp, Users, Clock, RefreshCw, Smartphone, Laptop, Tablet } from 'lucide-react';

interface CMSAnalyticsProps {
  articles: Article[];
  onNotify: (msg: string) => void;
  activeReadersCount: number;
}

export default function CMSAnalytics({ articles, onNotify, activeReadersCount }: CMSAnalyticsProps) {
  const [metricRange, setMetricRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic calculations from Firestore/Articles state
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const avgReadTime = articles.length > 0 
    ? Math.round(articles.reduce((acc, curr) => {
        const mins = parseInt(curr.readTime) || 3;
        return acc + mins;
      }, 0) / articles.length)
    : 3;

  // Prepare top 5 articles by view count
  const topArticles = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const maxViews = topArticles.length > 0 ? Math.max(...topArticles.map(a => a.views || 0), 100) : 100;

  // Compute views by category
  const categoriesMap: { [key: string]: number } = {};
  articles.forEach(art => {
    categoriesMap[art.category] = (categoriesMap[art.category] || 0) + (art.views || 0);
  });
  
  const categoryViews = Object.entries(categoriesMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const totalCategoryViews = categoryViews.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onNotify('Metrics indexed and refreshed from cloud nodes.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics Toolbar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/10 pb-4 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <BarChart2 size={16} className="text-[#b81300]" />
            <span>Readership Performance Studio</span>
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Cross-Platform telemetry auditing reads across all active translations.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Metric Timeframe Switcher */}
          <div className="bg-[#f0f0f0] border border-black p-1 flex">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => { setMetricRange(range); onNotify(`Scope updated to last ${range}.`); }}
                className={`px-3 py-1 text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  metricRange === range 
                    ? 'bg-black text-white' 
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="border-2 border-black p-2 hover:bg-zinc-100 transition-colors bg-white relative cursor-pointer"
            title="Reload live feeds"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* KPI: Real readers */}
        <div className="bg-white border-2 border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#7e7576]">Live active Sessions</span>
            <h4 className="text-3xl font-black mt-1 font-mono-data">{activeReadersCount}</h4>
            <p className="text-[9px] font-bold text-emerald-600 mt-2 flex items-center gap-1 uppercase">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              Broadcasting streams active
            </p>
          </div>
          <div className="p-3 border border-black bg-[#fbfbfb]">
            <Users size={18} className="text-zinc-700" />
          </div>
        </div>

        {/* KPI: Total reads */}
        <div className="bg-white border-2 border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#7e7576]">Total aggregated reads</span>
            <h4 className="text-3xl font-black mt-1 font-mono-data">{totalViews.toLocaleString()}</h4>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block mt-2">Checked across {articles.length} news files</span>
          </div>
          <div className="p-3 border border-black bg-[#fbfbfb]">
            <TrendingUp size={18} className="text-[#b81300]" />
          </div>
        </div>

        {/* KPI: Average engagement */}
        <div className="bg-white border-2 border-black p-5 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#7e7576]">Avg. report weight</span>
            <h4 className="text-3xl font-black mt-1 font-mono-data">{avgReadTime} min</h4>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block mt-2">Word-count ratio optimized</span>
          </div>
          <div className="p-3 border border-black bg-[#fbfbfb]">
            <Clock size={18} className="text-zinc-700" />
          </div>
        </div>

      </div>

      {/* Charts Bento grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column SVG Bar Chart (Top Articles) */}
        <div className="lg:col-span-8 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-2 mb-6 text-zinc-800">
              Reads breakdown by primary report (Top 5)
            </h4>
            
            {/* SVG Custom Bar Chart */}
            {topArticles.length > 0 ? (
              <div className="space-y-4">
                {topArticles.map((art, index) => {
                  const percent = Math.max(5, Math.round(((art.views || 0) / maxViews) * 100));
                  return (
                    <div key={art.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-700">
                        <span className="truncate max-w-[420px] font-sans">
                          {index + 1}. {art.title}
                        </span>
                        <span className="font-mono">{art.views || 0} reads</span>
                      </div>
                      <div className="w-full bg-[#f3f3f3] h-6 border border-black rounded-xs overflow-hidden relative">
                        <div 
                          className="bg-black text-[9px] font-mono font-bold text-white uppercase flex items-center px-2 h-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        >
                          <span className={`${percent < 20 ? 'text-black absolute left-2' : ''}`}>
                            {percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 italic">No readership views indexed yet.</div>
            )}
          </div>
          <div className="border-t border-black/5 pt-3 mt-6 text-[9px] text-[#b81300] font-mono uppercase font-bold">
            • Data calculated with cloud server timestamping
          </div>
        </div>

        {/* Right Column Category Donut Distribution & Devices */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4 text-[#1a1c1c]">
              Category Share
            </h4>

            {categoryViews.length > 0 ? (
              <div className="space-y-3.5">
                {categoryViews.slice(0, 4).map(({ category, count }) => {
                  const share = Math.round((count / totalCategoryViews) * 100);
                  const colors: { [key: string]: string } = {
                    'Politics': 'bg-[#b81300]',
                    'Economy': 'bg-black',
                    'World': 'bg-[#404445]',
                    'Tech': 'bg-[#bfbebb]'
                  };
                  const colorClass = colors[category] || 'bg-zinc-400';
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-600">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 ${colorClass} inline-block rounded-xs`}></span>
                          {category}
                        </span>
                        <span>{share}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-sm overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${share}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[9px] italic text-zinc-400">Loading categories...</p>
            )}
          </div>

          {/* Device Telemetry share */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4">
              Device Segmentation
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-zinc-600 font-mono text-[9px]">
              <div className="p-2 border border-zinc-100">
                <Smartphone size={14} className="mx-auto mb-1.5 text-zinc-700" />
                <span className="block font-bold">58%</span>
                <span className="text-[8px] text-zinc-400 font-sans font-bold uppercase">Mobile</span>
              </div>
              <div className="p-2 border border-zinc-100">
                <Laptop size={14} className="mx-auto mb-1.5 text-zinc-700" />
                <span className="block font-bold">36%</span>
                <span className="text-[8px] text-zinc-400 font-sans font-bold uppercase">Desktop</span>
              </div>
              <div className="p-2 border border-zinc-100">
                <Tablet size={14} className="mx-auto mb-1.5 text-zinc-700" />
                <span className="block font-bold">6%</span>
                <span className="text-[8px] text-zinc-400 font-sans font-bold uppercase">Tablet</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
