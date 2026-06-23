/**
 * Custom date utilities for the Lankan Ledger daily news publishing platform.
 * Supports computing relative elapsed times dynamically and localizing dates
 * into English, Sinhala, and Tamil without relying on hardcoded or mock string values.
 */

export function formatArticleDate(publishedAt: string, currentLanguage: 'EN' | 'SI' | 'TA' = 'EN'): string {
  if (!publishedAt) return '';

  // Try to parse the string as a real ISO date or timestamp
  const parsedDate = Date.parse(publishedAt);
  if (isNaN(parsedDate)) {
    // If it's a standard hardcoded legacy mock string like "2 HOURS AGO", return it as-is or translate loosely
    return translateLegacyDateString(publishedAt, currentLanguage);
  }

  const d = new Date(parsedDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.max(0, Math.floor(diffMs / 1000));
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (currentLanguage === 'SI') {
    if (diffSecs < 60) return 'දැන්ම';
    if (diffMins < 60) return `විනාඩි ${diffMins}කට පෙර`;
    if (diffHours < 24) return `පැය ${diffHours}කට පෙර`;

    const isToday = d.getDate() === now.getDate() && 
                    d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();
    if (isToday) {
      return `අද • ${d.toLocaleTimeString('si-LK', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return d.toLocaleDateString('si-LK', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (currentLanguage === 'TA') {
    if (diffSecs < 60) return 'இப்போது';
    if (diffMins < 60) return `${diffMins} நிமிடங்களுக்கு முன்`;
    if (diffHours < 24) return `${diffHours} மணிநேரங்களுக்கு முன்`;

    const isToday = d.getDate() === now.getDate() && 
                    d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();
    if (isToday) {
      return `இன்று • ${d.toLocaleTimeString('ta-LK', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return d.toLocaleDateString('ta-LK', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Default to English
  if (diffSecs < 60) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins} MINS AGO`;
  if (diffHours < 24) {
    const isToday = d.getDate() === now.getDate() && 
                    d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();
    if (isToday) {
      const hours = d.getHours() % 12 || 12;
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
      return `TODAY • ${hours}:${minutes} ${ampm}`;
    }
    return `${diffHours} HOURS AGO`;
  }

  // Full Date format
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
}

/**
 * Fallback translation helper for seeded legacy mock strings.
 */
function translateLegacyDateString(text: string, lang: 'EN' | 'SI' | 'TA'): string {
  const upper = text.toUpperCase().trim();
  
  if (lang === 'SI') {
    if (upper.includes('HOUR') || upper.includes('HOURS')) {
      const num = upper.match(/\d+/)?.[0] || '1';
      return `පැය ${num}කට පෙර`;
    }
    if (upper.includes('YESTERDAY')) return 'ඊයේ';
    if (upper.includes('AGO')) return 'මීට පෙර';
    if (upper.includes('JUST NOW')) return 'දැන්ම';
    return text;
  }

  if (lang === 'TA') {
    if (upper.includes('HOUR') || upper.includes('HOURS')) {
      const num = upper.match(/\d+/)?.[0] || '1';
      return `${num} மணிநேරங்களுக்கு முன்`;
    }
    if (upper.includes('YESTERDAY')) return 'நேற்று';
    if (upper.includes('AGO')) return 'முன்பு';
    if (upper.includes('JUST NOW')) return 'இப்போது';
    return text;
  }

  return text;
}

/**
 * Converts legacy relative/time mock strings (e.g. "2 HOURS AGO", "10:45 AM") into real ISO date strings relative to now.
 */
export function parseLegacyDateToISO(legacyStr: string): string {
  const upper = legacyStr.toUpperCase().trim();
  const now = new Date();
  
  if (upper.includes('JUST NOW') || upper.includes('PENDING SCHEDULE')) {
    return now.toISOString();
  }
  
  if (upper.includes('HOUR') || upper.includes('HOURS')) {
    const hours = parseInt(upper.match(/\d+/)?.[0] || '1', 10);
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  }
  
  if (upper.includes('MIN') || upper.includes('MINS')) {
    const mins = parseInt(upper.match(/\d+/)?.[0] || '1', 10);
    return new Date(now.getTime() - mins * 60 * 1000).toISOString();
  }
  
  if (upper.includes('DAY') || upper.includes('DAYS')) {
    if (upper.includes('YESTERDAY')) {
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    }
    const days = parseInt(upper.match(/\d+/)?.[0] || '1', 10);
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
  }
  
  if (upper.includes('YESTERDAY')) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }
  
  // Format "10:45 AM", "09:30 AM", "08:15 AM"
  if (upper.match(/^\d{1,2}:\d{2}\s*(AM|PM)$/)) {
    const [time, ampm] = upper.split(/\s+/);
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);
    if (targetDate.getTime() > now.getTime()) {
      targetDate.setTime(targetDate.getTime() - 24 * 60 * 60 * 1000);
    }
    return targetDate.toISOString();
  }
  
  return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
}
// Sync trigger: accounts aligned to enable direct sync to AI Studio.

