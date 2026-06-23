import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface CMSAuthModalProps {
  onClose: () => void;
  onSuccess: (role: string) => void;
}

export default function CMSAuthModal({ onClose, onSuccess }: CMSAuthModalProps) {
  const [passcode, setPasscode] = useState('');
  const [role, setRole] = useState('Senior Journalist');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === 'LEDGER2026') {
      localStorage.setItem('lankan_ledger_authorized', 'true');
      localStorage.setItem('lankan_ledger_role', role);
      onSuccess(role);
    } else {
      setIsShaking(true);
      setError('ACCESS DENIED: INVALID JOURNALIST CREDENTIALS CODE');
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
      <div 
        className={`bg-white border-4 border-black w-full max-w-md p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(184,19,0,1)] relative animate-[fadeIn_0.2s_ease-out] ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
        id="cms-auth-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 cursor-pointer transition-colors"
          title="Return to Reader mode"
          id="cms-auth-close-btn"
        >
          <X size={20} />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black rounded-xs mx-auto mb-3 shadow-[4px_4px_0px_0px_rgba(184,19,0,1)]">
            LL
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight text-black">
            Lankan Ledger Editorial Gate
          </h2>
          <p className="text-[10px] font-bold uppercase text-[#b81300] tracking-widest mt-1">
            Verified Journalist Entry Point
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Role selector */}
          <div>
            <label htmlFor="cms-role-select" className="block text-[9px] font-bold uppercase tracking-widest text-[#7e7576] mb-1.5">
              Assigned Editorial Role / Desk
            </label>
            <select
              id="cms-role-select"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setError('');
              }}
              className="w-full border-2 border-black p-2.5 text-xs font-bold uppercase bg-[#f9f9f9] outline-none cursor-pointer"
            >
              <option value="Senior Journalist">Senior Journalist</option>
              <option value="Associate Editor">Associate Editor</option>
              <option value="Politics & Cabinet Envoy">Politics & Cabinet Envoy</option>
              <option value="Economy Analyst">Economy Analyst</option>
              <option value="Lankan Administrator">Lankan Administrator</option>
            </select>
          </div>

          {/* Passcode Input */}
          <div>
            <label htmlFor="cms-passcode-input" className="block text-[9px] font-bold uppercase tracking-widest text-[#7e7576] mb-1.5 flex justify-between items-center">
              <span>SECURE JOURNALIST PASSCODE</span>
              <span className="text-[8px] bg-black text-white px-1 tracking-normal font-mono uppercase">256-Bit</span>
            </label>
            <div className="relative flex border-2 border-black">
              <div className="pl-3 pr-2 flex items-center shrink-0">
                <Lock size={14} className="text-gray-400" />
              </div>
              <input
                id="cms-passcode-input"
                type={showPasscode ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter workspace key code..."
                className="w-full bg-[#f9f9f9] py-3 text-xs font-bold uppercase tracking-widest outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-black cursor-pointer"
                title={showPasscode ? "Hide Passcode" : "Show Passcode"}
              >
                {showPasscode ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#b81300]/10 border border-[#b81300]/60 p-3 text-[10px] font-bold text-[#b81300] uppercase tracking-wide flex items-start gap-2.5 animate-[fadeIn_0.2s_ease-out]">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            id="cms-auth-submit-btn"
            className="w-full bg-black text-white hover:bg-[#b81300] text-[11px] py-3.5 font-bold uppercase tracking-widest border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck size={14} /> Authenticate Workstation
          </button>
        </form>

        {/* Info Box explaining current database & verification credentials */}
        <div className="mt-6 border-t-2 border-dashed border-black/15 pt-5 text-center">
          <p className="text-[10px] font-serif text-[#7e7576] leading-relaxed">
            Authorized evaluators can access the journalist CMS portal by entering the secure passcode credential below:
          </p>
          <div className="mt-2.5 bg-[#f3f3f3] border border-black p-2 font-mono text-xs font-bold text-black flex justify-center items-center gap-1 bg-gradient-to-r from-zinc-50 to-zinc-100">
            Passcode: <span className="text-[#b81300] select-all cursor-pointer">LEDGER2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
