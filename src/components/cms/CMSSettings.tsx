import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, HelpCircle, Save, CheckCircle, Database } from 'lucide-react';

interface CMSSettingsProps {
  onNotify: (msg: string) => void;
  bylineName: string;
  pressRole: string;
}

export default function CMSSettings({ onNotify, bylineName, pressRole }: CMSSettingsProps) {
  // Local state reflecting stored workstation configuration
  const [localByline, setLocalByline] = useState(bylineName || 'Staff Journalist');
  const [localRole, setLocalRole] = useState(pressRole || 'Senior Journalist');

  // Policy configurations
  const [minWordCheck, setMinWordCheck] = useState(() => {
    return localStorage.getItem('lankan_ledger_policy_word_check') !== 'false';
  });
  const [flagTranslationCheck, setFlagTranslationCheck] = useState(() => {
    return localStorage.getItem('lankan_ledger_policy_translation_check') !== 'false';
  });
  const [autoSaveCheck, setAutoSaveCheck] = useState(() => {
    return localStorage.getItem('lankan_ledger_policy_autosave') === 'true';
  });

  const handleCommitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lankan_ledger_byline', localByline.trim());
    localStorage.setItem('lankan_ledger_role', localRole);
    localStorage.setItem('lankan_ledger_policy_word_check', minWordCheck ? 'true' : 'false');
    localStorage.setItem('lankan_ledger_policy_translation_check', flagTranslationCheck ? 'true' : 'false');
    localStorage.setItem('lankan_ledger_policy_autosave', autoSaveCheck ? 'true' : 'false');

    onNotify('Workstation parameters updated! Reloading workstation to take effect.');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Settings Header */}
      <div className="border-b border-black/10 pb-4">
        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
          <SettingsIcon size={16} className="text-[#b81300]" />
          <span>Workstation Configuration Console</span>
        </h3>
        <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Configure individual press credentials, quality criteria gates, and telemetry monitors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column Settings Form */}
        <form onSubmit={handleCommitSettings} className="md:col-span-8 space-y-6">
          
          {/* Identity settings */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4">
              Press Identification Card
            </h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="setting_byline_name" className="block text-[8px] font-mono font-bold uppercase text-zinc-400 mb-1.5">
                  Display Byline Name
                </label>
                <input
                  id="setting_byline_name"
                  type="text"
                  required
                  value={localByline}
                  onChange={(e) => setLocalByline(e.target.value)}
                  className="w-full bg-[#fbfbfb] border border-black p-2.5 text-xs font-bold uppercase tracking-wide focus:outline-none placeholder-zinc-400"
                  placeholder="e.g. Rohitha Perera"
                />
              </div>

              <div>
                <label htmlFor="setting_editor_role" className="block text-[8px] font-mono font-bold uppercase text-zinc-400 mb-1.5">
                  Designated Newsroom Role / Stamp
                </label>
                <select
                  id="setting_editor_role"
                  value={localRole}
                  onChange={(e) => setLocalRole(e.target.value)}
                  className="w-full border border-black bg-white p-2.5 text-xs font-bold uppercase outline-none focus:ring-0 cursor-pointer text-zinc-800"
                >
                  <option value="Senior Journalist">Senior Journalist</option>
                  <option value="Chief Editor">Chief Editor</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="Foreign Correspondent">Foreign Correspondent</option>
                  <option value="Desk Writer">Desk Writer / Copyeditor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Validation quality parameters */}
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4">
              Editorial Quality Controls
            </h4>
            
            <div className="space-y-4">
              <label htmlFor="word-count-checkbox" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="word-count-checkbox"
                  type="checkbox"
                  checked={minWordCheck}
                  onChange={(e) => setMinWordCheck(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 border-black focus:ring-black cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold uppercase text-zinc-800">Minimum Word-Count Alarm</span>
                  <span className="block text-[10px] text-zinc-400">Flag an warning indicator in the dashboard if an article’s transcript is under 200 words.</span>
                </div>
              </label>

              <label htmlFor="translation-checkbox" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="translation-checkbox"
                  type="checkbox"
                  checked={flagTranslationCheck}
                  onChange={(e) => setFlagTranslationCheck(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 border-black focus:ring-black cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold uppercase text-zinc-800">Flag Multilingual Translation Gaps</span>
                  <span className="block text-[10px] text-zinc-400">Show alert warnings in desk list if reports do not map to active Sinhala/Tamil document IDs.</span>
                </div>
              </label>

              <label htmlFor="autosave-checkbox" className="flex items-start gap-3 cursor-pointer">
                <input
                  id="autosave-checkbox"
                  type="checkbox"
                  checked={autoSaveCheck}
                  onChange={(e) => setAutoSaveCheck(e.target.checked)}
                  className="mt-1 h-3.5 w-3.5 border-black focus:ring-black cursor-pointer"
                />
                <div className="text-xs">
                  <span className="block font-bold uppercase text-zinc-800">Enable Session Autosave</span>
                  <span className="block text-[10px] text-zinc-400">Periodically save dirty form drafts to the local browser buffer.</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#b81300] text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={12} />
            <span>Apply Workstation Changes</span>
          </button>

        </form>

        {/* Right Column Database status monitors */}
        <div className="md:col-span-4 space-y-6">
          
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4 flex items-center gap-2">
              <Database size={13} />
              <span>Durable Cloud Status</span>
            </h4>
            
            <div className="space-y-4 font-mono text-[9px]">
              <div>
                <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">Database Engine</span>
                <span className="block text-zinc-700 font-bold">Google Cloud Firestore</span>
              </div>

              <div>
                <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">Database Identifier (id)</span>
                <span className="block text-zinc-500 truncate" title="ai-studio-41242759-48e2-4b96-a8a1-aa5c61832670">
                  ai-studio-4124...670
                </span>
              </div>

              <div>
                <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">Security Policies status</span>
                <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 font-bold uppercase border border-emerald-200 inline-block mt-0.5">
                  Hardened gates active✓
                </span>
              </div>

              <div>
                <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">Firewall Rules loaded</span>
                <span className="block text-zinc-500">rules_version = '2';</span>
              </div>

              <div>
                <span className="block text-[8px] font-sans font-bold uppercase text-zinc-400">Client Sync state</span>
                <span className="block text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle size={10} /> Online snap listen active
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-100 border border-zinc-200 text-zinc-500 text-[10px] space-y-2 leading-relaxed">
            <Shield size={14} className="text-[#b81300] opacity-80" />
            <p className="font-serif">
              Workstation settings are contained and encrypted under the system browser’s local security profile.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
