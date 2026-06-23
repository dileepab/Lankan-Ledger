import React from 'react';
import { Article } from '../../types';
import { LayoutDashboard, Newspaper, Activity, AlertTriangle, FileCheck, CheckCircle, Clock } from 'lucide-react';

interface CMSDashboardProps {
  articles: Article[];
  activeTab: string;
  onSwitchTab: (tab: 'articles' | 'dashboard' | 'multimedia' | 'analytics' | 'comments' | 'settings') => void;
  activeReadersCount: number;
}

export default function CMSDashboard({ articles, onSwitchTab, activeReadersCount }: CMSDashboardProps) {
  // Aggregate real dynamic stats
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const avgViews = articles.length > 0 ? Math.round(totalViews / articles.length) : 0;
  const draftArticles = articles.filter(a => a.status === 'Draft').length;
  const publishedArticles = articles.filter(a => a.status === 'Published').length;

  // Track articles with translation deficiencies
  const translationDeficiencies = articles.filter(a => !a.sinhalaMapping || !a.tamilMapping);
  
  // Track short articles
  const shortArticles = articles.filter(a => {
    const wordCount = a.content ? a.content.split(/\s+/).length : 0;
    return wordCount < 200;
  });

  return (
    <div className="space-y-6">
      {/* Dynamic Key metrics Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest">Aggregate Traffic</span>
              <Activity size={14} className="text-[#b81300]" />
            </div>
            <h3 className="text-2xl font-black">{totalViews.toLocaleString()}</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Total Article Reads</p>
          </div>
          <div className="border-t border-black/5 pt-2 mt-4 text-[9px] font-mono-data text-zinc-400">
            Avg {avgViews} reads per ledger filing
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest">Live Readers</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <h3 className="text-2xl font-black">{activeReadersCount}</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Active Sessions Now</p>
          </div>
          <div className="border-t border-black/5 pt-2 mt-4 text-[9px] font-mono-data text-zinc-400">
            Real-time analytics fluctuation ±5
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest">Filing Index</span>
              <Newspaper size={14} className="text-[#b81300]" />
            </div>
            <h3 className="text-2xl font-black">{articles.length}</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Total Reports Written</p>
          </div>
          <div className="border-t border-black/5 pt-2 mt-4 text-[9px] text-[#b81300] font-bold uppercase">
            {publishedArticles} Live / {draftArticles} Drafts
          </div>
        </div>

        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest">Policy Compliance</span>
              <FileCheck size={14} className="text-zinc-600" />
            </div>
            <h3 className="text-2xl font-black text-amber-600">
              {translationDeficiencies.length + shortArticles.length === 0 ? '100%' : 'Lacking'}
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Editorial Audit Status</p>
          </div>
          <div className="border-t border-black/5 pt-2 mt-4 text-[9px] font-medium text-zinc-500">
            {translationDeficiencies.length} lack translation IDs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Submissions & Wire feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border-2 border-black p-6">
            <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
              <span>Quick Desk Feed (Recent Reports)</span>
              <button 
                onClick={() => onSwitchTab('articles')} 
                className="text-[10px] text-[#b81300] underline uppercase cursor-pointer"
              >
                Go to Articles
              </button>
            </h3>
            <div className="space-y-4">
              {articles.slice(0, 4).map((art) => (
                <div key={art.id} className="border border-zinc-200 p-3 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[8px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono font-bold uppercase mr-2 inline-block">
                      {art.category}
                    </span>
                    <h4 className="text-xs font-black uppercase tracking-tight mt-1">{art.title}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate max-w-[400px]">{art.subtitle}</p>
                    <div className="flex items-center gap-3 text-[9px] text-zinc-400 mt-2 font-mono">
                      <span>By {art.author}</span>
                      <span>•</span>
                      <span>{art.views} reads</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                      art.status === 'Published' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {art.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ceylon Telegraph / Reuters Wire feed simulator */}
          <div className="bg-white border-2 border-black p-6">
            <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#b81300] rounded-full animate-pulse"></span>
              <span>Wire Service Telex ticker</span>
            </h3>
            <div className="space-y-2.5 font-mono text-[10px] text-zinc-700">
              <div className="flex gap-4 p-1.5 border-b border-black/5">
                <span className="text-[#b81300] font-bold">[COLOMBO WIRES]</span>
                <span className="text-zinc-400">07:14 UTC</span>
                <span>Central Bank governor schedules IMF policy statement for Monday afternoon.</span>
              </div>
              <div className="flex gap-4 p-1.5 border-b border-black/5">
                <span className="text-zinc-500 font-bold">[EXPORT DESK]</span>
                <span className="text-zinc-400">05:30 UTC</span>
                <span>Nuwara Eliya premium tea auctions hit record high prices following supply drop.</span>
              </div>
              <div className="flex gap-4 p-1.5">
                <span className="text-emerald-600 font-bold">[POWER GRID]</span>
                <span className="text-zinc-400">03:45 UTC</span>
                <span>Norochcholai coal power station reports 100% capacity grid availability.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Policies and Warnings Audit Checklist */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-black p-5">
            <h3 className="text-xs font-black uppercase tracking-wider border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#b81300]" />
              <span>Translation Checklist</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mb-3">To comply with inclusive governance, all official ledger reports must be paired with active translation IDs.</p>
            {translationDeficiencies.length > 0 ? (
              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {translationDeficiencies.map((t) => (
                  <div key={t.id} className="p-2 border border-rose-100 bg-rose-50/[0.3] flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase text-zinc-700 truncate">
                      <span>• {t.title}</span>
                    </div>
                    <div className="flex gap-2 text-[8px] font-bold">
                      <span className={t.sinhalaMapping ? 'text-emerald-700' : 'text-rose-600'}>
                        {t.sinhalaMapping ? 'Sinhala ✓' : 'Sinhala ID missing ⚠'}
                      </span>
                      <span className={t.tamilMapping ? 'text-emerald-700' : 'text-rose-600'}>
                        {t.tamilMapping ? 'Tamil ✓' : 'Tamil ID missing ⚠'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs text-center border-dashed border border-emerald-300 font-bold uppercase">
                <CheckCircle size={14} className="mx-auto mb-1" />
                All articles fully translated!
              </div>
            )}
          </div>

          {/* Quick interactive alerts summary */}
          <div className="bg-white border-2 border-black p-5 font-mono text-[9px] space-y-3">
            <h4 className="font-bold border-b border-black pb-1 uppercase">Workstation Audit Logs</h4>
            <div className="space-y-1.5 text-zinc-500">
              <div className="flex items-start gap-1">
                <Clock size={10} className="mt-0.5 shrink-0" />
                <span>[01:38] Seed articles check completed successfully (OK).</span>
              </div>
              <div className="flex items-start gap-1">
                <Clock size={10} className="mt-0.5 shrink-0" />
                <span>[01:41] Synchronized real-time Firestore listener.</span>
              </div>
              <div className="flex items-start gap-1">
                <Clock size={10} className="mt-0.5 shrink-0" />
                <span>[01:51] Applied latest firestore.rules policy gate.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
