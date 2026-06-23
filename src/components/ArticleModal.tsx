import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { X, Calendar, User, Eye, Clock, MessageSquare, Send, Check, Volume2, Play, Pause, Square } from 'lucide-react';
import { subscribeToArticleComments, addCommentToFirestore } from '../firebase';
import { I18N_DICTIONARY } from '../utils/i18n';
import { formatArticleDate } from '../utils/date';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
  onEditInCMS?: (id: string) => void;
  currentLanguage?: 'EN' | 'SI' | 'TA';
}

export default function ArticleModal({ article, onClose, onEditInCMS, currentLanguage = 'EN' }: ArticleModalProps) {
  // Multilingual & Translation States
  const [activeLang, setActiveLang] = useState<'EN' | 'SI' | 'TA'>(currentLanguage);

  const t = (key: string): string => {
    return I18N_DICTIONARY[activeLang]?.[key] || key;
  };

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Audio Companion Broadcasting States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [translations, setTranslations] = useState<Record<'SI' | 'TA', { title: string; subtitle: string; content: string } | null>>({
    SI: null,
    TA: null
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  useEffect(() => {
    // If the main news app changes languages, sync the active view language in modal
    if (currentLanguage) {
      setActiveLang(currentLanguage);
    }
  }, [currentLanguage]);

  useEffect(() => {
    const fetchTranslation = async () => {
      if (activeLang === 'EN') return;
      if (translations[activeLang]) return; // already translated in this session

      setIsTranslating(true);
      setTranslationError(null);

      try {
        const response = await fetch('/api/gemini/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: article.title,
            subtitle: article.subtitle,
            content: article.content,
            targetLanguage: activeLang
          })
        });

        if (!response.ok) {
          throw new Error('News wire returned error status.');
        }

        const data = await response.json();
        setTranslations(prev => ({
          ...prev,
          [activeLang]: {
            title: data.title || article.title,
            subtitle: data.subtitle || article.subtitle,
            content: data.content || article.content
          }
        }));
      } catch (err) {
        console.error("Translation Client Error:", err);
        setTranslationError(t('news_wire_error'));
      } finally {
        setIsTranslating(false);
      }
    };

    fetchTranslation();
  }, [activeLang, article.id]);

  useEffect(() => {
    // Standard safety cleanup to stop reading if model closes or hot swaps
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id]);

  // Derived content variables based on current language
  const displayTitle = activeLang === 'EN' ? article.title : (translations[activeLang]?.title || article.title);
  const displaySubtitle = activeLang === 'EN' ? article.subtitle : (translations[activeLang]?.subtitle || article.subtitle);
  const displayContent = activeLang === 'EN' ? article.content : (translations[activeLang]?.content || article.content);

  const startSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown characters from editorial texts
    const cleanText = `${displayTitle}. ${displaySubtitle}. ${displayContent}`
      .replace(/[\*\_#>`~\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice based on activeLang
    if (activeLang === 'SI') {
      utterance.lang = 'si-LK';
    } else if (activeLang === 'TA') {
      utterance.lang = 'ta-LK';
    } else {
      utterance.lang = 'en-US';
    }

    const voices = window.speechSynthesis.getVoices();
    let optimalVoice;
    if (activeLang === 'SI') {
      optimalVoice = voices.find(v => v.lang.toLowerCase().includes('si')) || voices.find(v => v.lang.toLowerCase().includes('hi')) || voices[0];
    } else if (activeLang === 'TA') {
      optimalVoice = voices.find(v => v.lang.toLowerCase().includes('ta')) || voices.find(v => v.lang.toLowerCase().includes('hi')) || voices[0];
    } else {
      optimalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('India') || v.name.includes('Great Britain'))) || voices[0];
    }

    if (optimalVoice) {
      utterance.voice = optimalVoice;
    }
    
    utterance.rate = activeLang === 'EN' ? 1.0 : 0.95; // Sri Lankan languages are spoken slightly slower for extreme clarity
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    setIsPlayingAudio(true);
    setIsPausedAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPausedAudio(true);
    setIsPlayingAudio(false);
  };

  const stopSpeech = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };
  const [comments, setComments] = useState<Array<{ name: string; text: string; date: string }>>([
    {
      name: 'Dr. Rohan Alwis',
      text: 'Highly insightful breakdown. The restructuring of the state enterprises is indeed a critical factor that needs immediate focus.',
      date: '1 hour ago'
    },
    {
      name: 'Nilani Fernando',
      text: 'Excited about the positive economic outlook! Hopefully, this translates to tangible cost reductions at the retail level soon.',
      date: '30 mins ago'
    }
  ]);

  // Sync comments in real-time with Firestore subcollection
  useEffect(() => {
    const unsubscribe = subscribeToArticleComments(article.id, (loadedComments) => {
      setComments(loadedComments || []);
    });

    return () => unsubscribe();
  }, [article.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    const newComment = {
      name: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
    };

    try {
      await addCommentToFirestore(article.id, newComment);
      setCommentName('');
      setCommentText('');
    } catch (err) {
      console.error("Failed to add comment to Firestore", err);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(article.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-[#f9f9f9] text-[#1a1c1c] border-2 border-black w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative animate-[fadeIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner header inside modal */}
        <div className="bg-black text-white px-6 py-3 flex items-center justify-between border-b-2 border-black sticky top-0 z-10">
          <span className="font-bold text-[10px] tracking-widest uppercase text-zinc-300">
            {t('lankan_ledger_special_report')}
          </span>
          <button 
            onClick={onClose} 
            className="hover:text-[#b81300] transition-colors p-1 cursor-pointer"
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content area */}
        <div className="p-6 md:p-8 flex-1">
          {/* AI Translation Switcher bar inside modal */}
          <div className="bg-zinc-100 border-2 border-black p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
            <span className="font-mono text-[9px] uppercase font-bold tracking-widest text-[#7e7576]">
              🌐 {t('translation_bureau')}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveLang('EN')}
                className={`px-3 py-1 text-[10px] uppercase font-bold border-2 transition-all cursor-pointer ${
                  activeLang === 'EN'
                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]'
                    : 'bg-white text-black border-black hover:bg-zinc-200'
                }`}
              >
                EN (English)
              </button>
              <button
                onClick={() => setActiveLang('SI')}
                className={`px-3 py-1 text-[10px] uppercase font-bold border-2 transition-all cursor-pointer ${
                  activeLang === 'SI'
                    ? 'bg-[#b81300] text-white border-[#b81300] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]'
                    : 'bg-white text-black border-black hover:bg-zinc-200'
                }`}
              >
                සිංහල (Sinhala)
              </button>
              <button
                onClick={() => setActiveLang('TA')}
                className={`px-3 py-1 text-[10px] uppercase font-bold border-2 transition-all cursor-pointer ${
                  activeLang === 'TA'
                    ? 'bg-[#b81300] text-white border-[#b81300] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]'
                    : 'bg-white text-black border-black hover:bg-zinc-200'
                }`}
              >
                தமிழ் (Tamil)
              </button>
            </div>
          </div>

          {/* Translating loader indicator */}
          {isTranslating && (
            <div className="bg-[#fffbeb] border-2 border-black p-4 mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-3 animate-pulse">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#b81300] flex items-center gap-2">
                📡 {t('telegram_wire_translating')}
              </span>
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-[#b81300] animate-spin"></div>
            </div>
          )}

          {/* Translation error message with retry trigger */}
          {translationError && (
            <div className="bg-red-50 border-2 border-red-900 text-red-950 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-mono font-bold">{translationError === 'Our translation engine was unable to parse this report. Click retry to attempt again.' ? t('news_wire_error') : translationError}</span>
              <button
                onClick={() => {
                  setTranslations(prev => ({ ...prev, [activeLang]: null }));
                }}
                className="bg-red-900 hover:bg-black text-white p-1.5 px-3.5 text-[9px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Category & meta metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-[#b81300] text-white px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                {t(article.category)}
              </span>
              <span className="text-zinc-400 text-xs">•</span>
              <span className="font-mono text-xs font-bold text-[#7e7576]">
                {formatArticleDate(article.publishedAt, activeLang)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={copyId}
                className="text-xs border border-black hover:bg-[#eeeeee] transition-all px-2.5 py-1 font-mono font-bold flex items-center gap-1 text-black bg-[#f9f9f9]"
                title="Copy Article UUID ID"
              >
                {copied ? <Check size={12} className="text-[#b81300]" /> : null}
                {copied ? t('copied') : `ID: ${article.id}`}
              </button>
              
              {onEditInCMS && (
                <button
                  onClick={() => onEditInCMS(article.id)}
                  className="bg-black text-white text-[11px] font-bold hover:bg-[#b81300] transition-colors px-3 py-1 uppercase tracking-wider cursor-pointer"
                >
                  {t('edit_in_cms')}
                </button>
              )}
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black leading-snug mb-4 select-text">
            {displayTitle}
          </h1>

          {/* Subtitle */}
          {displaySubtitle && (
            <p className="font-serif text-[15px] md:text-[18px] text-[#4c4546] font-normal border-l-4 border-[#b81300] pl-4 mb-6 italic leading-relaxed">
              {displaySubtitle}
            </p>
          )}

          {/* Author metadata panel */}
          <div className="bg-[#e2e2e2] border-2 border-black p-4 flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs uppercase">
                {article.author ? article.author.charAt(0) : 'E'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-black">{article.author || t('senior_journalist')}</p>
                <p className="text-[10px] uppercase font-bold text-[#7e7576]">{t('editorial_desk_colombo')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono font-bold text-[#4c4546]">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {article.readTime || t('default_read_time')}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={12} /> {article.views.toLocaleString()} {t('views_stat')}
              </span>
            </div>
          </div>

          {/* Audio Companion Broadcast Console */}
          <div className="border-2 border-black bg-zinc-950 text-white p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4 select-none">
            <style>{`
              @keyframes heightExpand {
                0%, 100% { height: 4px; }
                50% { height: 16px; }
              }
              .bar-anim {
                animation: heightExpand 1s ease-in-out infinite;
              }
            `}</style>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className={`p-2 rounded-none border border-zinc-850 ${isPlayingAudio ? "bg-[#b81300] text-white animate-pulse" : "bg-black text-zinc-400"}`}>
                <Volume2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#b81300]">{t('lankan_ledger_broadcasting')}</span>
                <span className="text-xs font-bold font-sans uppercase tracking-tight text-white mt-0.5 animate-pulse">
                  {isPlayingAudio 
                    ? `🔴 ${activeLang} ${t('live_audio_broadcasting')}` 
                    : isPausedAudio 
                      ? `⏸ ${t('broadcast_transmission_paused')}` 
                      : `📻 ${t('listen_to_article')} (${activeLang})`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Animated Audio Equalizer Waveform Bars */}
              {isPlayingAudio && (
                <div className="hidden sm:flex items-end gap-1 h-5 px-3">
                  <div className="w-1 bg-[#b81300] bar-anim" style={{ animationDelay: "0s" }}></div>
                  <div className="w-1 bg-white bar-anim" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1 bg-[#b81300] bar-anim" style={{ animationDelay: "0.4s" }}></div>
                  <div className="w-1 bg-white bar-anim" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 bg-[#b81300] bar-anim" style={{ animationDelay: "0.3s" }}></div>
                </div>
              )}

              <div className="flex gap-1.5 w-full md:w-auto">
                {!isPlayingAudio ? (
                  <button
                    onClick={startSpeech}
                    className="flex-grow md:flex-none flex items-center justify-center gap-1.5 bg-white text-black hover:bg-[#b81300] hover:text-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-black cursor-pointer transition-all"
                    title="Play audio broadcast"
                  >
                    <Play size={10} className="fill-current text-current" /> {t('play_button')}
                  </button>
                ) : (
                  <button
                    onClick={pauseSpeech}
                    className="flex-grow md:flex-none flex items-center justify-center gap-1.5 bg-zinc-850 text-white hover:bg-white hover:text-black px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-zinc-700 cursor-pointer transition-all"
                    title="Pause broadcast"
                  >
                    <Pause size={10} className="fill-current text-current" /> {t('pause_button')}
                  </button>
                )}

                {(isPlayingAudio || isPausedAudio) && (
                  <button
                    onClick={stopSpeech}
                    className="flex-grow md:flex-none flex items-center justify-center gap-1.5 bg-[#b81300] text-white hover:bg-red-700 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-black cursor-pointer transition-all"
                    title="Stop broadcast audio"
                  >
                    <Square size={10} className="fill-current text-current" /> {t('stop_button')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {article.image && (
            <figure className="mb-6 border-2 border-black p-2 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <img 
                src={article.image} 
                alt={displayTitle} 
                className="w-full aspect-video object-cover"
                referrerPolicy="no-referrer"
              />
              {article.imageCaption && (
                <figcaption className="text-xs text-[#4c4546] mt-2 italic font-serif border-t-2 border-black pt-2 bg-[#f9f9f9] p-3">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Main content body text */}
          <div className="font-serif text-[#1a1c1c] text-base leading-relaxed space-y-4 mb-8 whitespace-pre-wrap selection:bg-[#b81300] selection:text-white select-text">
            {displayContent}
          </div>

          {/* Translation Mapping link if any */}
          {(article.sinhalaMapping || article.tamilMapping) && (
            <div className="bg-[#e2e2e2] border-2 border-black p-4 mb-8">
              <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2">{t('linked_translation_indexes')}</h4>
              <div className="flex flex-wrap gap-2">
                {article.sinhalaMapping && (
                  <span className="bg-white border border-black px-2.5 py-1 text-[10px] font-mono font-bold text-black uppercase">
                     සිංහල: {article.sinhalaMapping}
                  </span>
                )}
                {article.tamilMapping && (
                  <span className="bg-white border border-black px-2.5 py-1 text-[10px] font-mono font-bold text-black uppercase">
                    தமிழ்: {article.tamilMapping}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="border-t-2 border-black pt-6 mt-8">
            <h3 className="text-sm font-black uppercase tracking-wider text-black mb-4 flex items-center gap-2">
              <MessageSquare size={16} className="text-[#b81300]" />
              {t('reader_responses')} ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="bg-white border-2 border-black p-5 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h4 className="text-[10px] font-bold uppercase text-[#7e7576] tracking-widest mb-3">{t('join_ledger_debate')}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t('your_name_placeholder')}
                  required
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-black p-2 text-xs font-bold focus:outline-none"
                />
                <span className="text-[11px] text-[#7e7576] flex items-center italic font-serif leading-tight">
                  {t('comments_audited_notice')}
                </span>
              </div>
              <textarea
                placeholder={t('share_perspective_placeholder')}
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-black p-2 text-xs focus:outline-none mb-3 resize-none font-serif"
              ></textarea>
              <button
                type="submit"
                className="bg-black hover:bg-[#b81300] text-white px-5 py-2.5 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send size={12} /> {t('post_response')}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={index} className="border-b border-black/10 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black uppercase tracking-wide text-black">{comment.name}</span>
                    <span className="text-[10px] font-mono font-bold text-[#7e7576]">{comment.date}</span>
                  </div>
                  <p className="text-xs md:text-sm font-serif text-[#4c4546] leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer info inside modal */}
        <div className="bg-[#e2e2e2] border-t-2 border-black py-3 px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7e7576]">
            {t('editorial_board_policy_notice')}
          </p>
        </div>
      </div>
    </div>
  );
}
