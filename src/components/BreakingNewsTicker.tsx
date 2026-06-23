import React, { useState, useEffect } from 'react';

interface BreakingNewsTickerProps {
  onLanguageChange?: (lang: 'EN' | 'SI' | 'TA') => void;
  currentLanguage?: 'EN' | 'SI' | 'TA';
}

export default function BreakingNewsTicker({
  onLanguageChange,
  currentLanguage = 'EN'
}: BreakingNewsTickerProps) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tickerMessages = {
    EN: "Live Updates: Economic reforms package announced in parliament. Secondary market yields show immediate reaction. | Colombo Port City development attracts regional maritime interest. | Nuwara Eliya organic Ceylon tea auctions witness steady bidding.",
    SI: "සජීවී යාවත්කාලීන කිරීම්: ආර්ථික ප්‍රතිසංස්කරණ පැකේජය පාර්ලිමේන්තුවට ඉදිරිපත් කෙරේ. ද්විතීයික වෙළෙඳපොළ ප්‍රතිලාභ ක්ෂණික ප්‍රතිචාර දක්වයි.",
    TA: "நேரடி அறிவிப்புகள்: பொருளாதார சீர்திருத்தங்கள் நாடாளுமன்றத்தில் அறிவிக்கப்பட்டன. வட்டி விகிதங்கள் சாதகமான நிலையை எட்டியுள்ளன."
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[60] flex items-center h-8 px-4 bg-black text-white overflow-hidden border-b border-zinc-800">
      <div className="flex items-center justify-between w-full max-w-[1280px] mx-auto">
        <div className="flex items-center gap-4 flex-1">
          <span className="bg-[#b81300] text-white px-2 py-0.5 font-label-caps text-[10px] tracking-wider animate-pulse uppercase flex-shrink-0">
            BREAKING
          </span>
          <div className="flex-1 overflow-hidden whitespace-nowrap relative h-5">
            <span className="absolute animate-marquee text-[#e2e2e2] font-body-sm text-[12px] pt-0.5">
              {tickerMessages[currentLanguage]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-4 ml-4 border-l border-zinc-800">
          <span className="hidden sm:inline font-mono-data text-[11px] text-zinc-400">
            TIME: {timeStr} LKR
          </span>
          <div className="flex items-center gap-1.5 font-label-caps text-[11px] text-zinc-400">
            <button
              onClick={() => onLanguageChange?.('EN')}
              className={`hover:text-white transition-colors uppercase ${currentLanguage === 'EN' ? 'text-white font-bold' : ''}`}
            >
              EN
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => onLanguageChange?.('SI')}
              className={`hover:text-white transition-colors ${currentLanguage === 'SI' ? 'text-white font-bold' : ''}`}
            >
              සිංහල
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => onLanguageChange?.('TA')}
              className={`hover:text-white transition-colors ${currentLanguage === 'TA' ? 'text-white font-bold' : ''}`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
