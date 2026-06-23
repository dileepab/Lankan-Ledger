import React, { useState, useEffect } from 'react';
import { Article, ViewMode } from '../types';
import { 
  FileText, LayoutDashboard, Film, BarChart2, MessageSquare, Settings as SettingsIcon, 
  Plus, Check, Eye, Save, Trash2, ArrowLeftRight, HelpCircle, RefreshCw, Image as ImageIcon,
  Tag, Link as LinkIcon, Bold, Italic, Underline, Heading1, Heading2, Quote, PlayCircle, Radio
} from 'lucide-react';

// Import newly refactored modular sub-components for alternative CMS workspaces
import CMSDashboard from './cms/CMSDashboard';
import CMSMultimedia from './cms/CMSMultimedia';
import CMSAnalytics from './cms/CMSAnalytics';
import CMSComments from './cms/CMSComments';
import CMSSettings from './cms/CMSSettings';

interface PortalCMSViewProps {
  articles: Article[];
  onSaveArticle: (article: Article) => void;
  onDeleteArticle?: (id: string) => void;
  onSwitchView: (view: ViewMode) => void;
  onLogout?: () => void;
  authorRole?: string;
  initialArticleId?: string | null;
}

export default function PortalCMSView({
  articles,
  onSaveArticle,
  onDeleteArticle,
  onSwitchView,
  onLogout,
  authorRole = 'Senior Journalist',
  initialArticleId
}: PortalCMSViewProps) {
  // Navigation sidebar item state
  const [activeTab, setActiveTab] = useState<'articles' | 'dashboard' | 'multimedia' | 'analytics' | 'comments' | 'settings'>('dashboard');

  // Compute active readers count deterministically based on actual article view statistics (actual traffic telemetry)
  const activeReadersCount = Math.max(
    12,
    Math.round(articles.reduce((sum, a) => sum + (a.views || 0), 0) / 100)
  );

  // Fetch initial customized byline credentials from Local Storage
  const [bylineName, setBylineName] = useState(() => {
    return localStorage.getItem('lankan_ledger_byline') || '';
  });

  // Currently editing article ID (defaults to initialArticleId or first article)
  const [selectedArticleId, setSelectedArticleId] = useState<string>(
    initialArticleId || (articles[0]?.id || '')
  );

  // Sync selected article ID if initialArticleId changes
  useEffect(() => {
    if (initialArticleId) {
      setSelectedArticleId(initialArticleId);
      setActiveTab('articles');
    }
  }, [initialArticleId]);
  
  // Local state form fields synced to selectedArticle
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Article['category']>('Economy');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [sinhalaMapping, setSinhalaMapping] = useState('');
  const [tamilMapping, setTamilMapping] = useState('');
  const [status, setStatus] = useState<Article['status']>('Draft');
  const [author, setAuthor] = useState('');

  // Save/Notification flags
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  // AI Desk Co-Pilot Integration Engine
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{ suggestedSubtitle: string; suggestedTags: string[] } | null>(null);

  const triggerAICopilot = async () => {
    if (!headline || !content) return;
    setIsAskingAI(true);
    setAiSuggestions(null);

    try {
      const response = await fetch('/api/gemini/co-pilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: headline,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error('Desk co-pilot server returned non-ok status.');
      }

      const data = await response.json();
      setAiSuggestions(data);
      
      setNotificationMsg('Gemini Desk analysis complete! Editorial recommendations loaded.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error(err);
      setNotificationMsg('Failed to sync. Please ensure GEMINI_API_KEY is configured.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3500);
    } finally {
      setIsAskingAI(false);
    }
  };

  // Interactive preloaded image choices
  const PRESET_IMAGES = [
    { name: 'Colombo Port', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz5pd1kDAVNUym6uHVY9Jm48hEXzGUCps2upqwhMuhh3cCyQ_BRqXguh-Vt6T15-RQncEnab4vOSzp1eaDA3SAtT7TnQ28rr_9dywAslUQ7s4ftwGcCd9KJGjsaDJzLIRmKWwf4KD4jDRGlLYoqdVbnCvYHgc6ynN2XeOtWJv1XkAgtKfVEFEH-dSsjal_yPtSmT4MyWC1MkkuUGWD0ANw2WnnxIbnHq6xMhwUr94eXb3_vgVgtetSxYk1NJH-XU4stF9XRj5vBpk' },
    { name: 'Tea Plantation', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfxCzmN9JRvlXVzKeItJCPiFpM7sMss7qspTZJzWGKh9AKs6wNeO_zUCygrVL6YUoQxDGJKdznF1lp3loqfXqqsZwJOGNKwub4beZ-1m9lmFj3zJJU9qtzWJQOUnZ1TlNeafz5h5RcQCcWv1Z8-N8ybaoYQ4L2qa8lCbWW2W3PoPnYwohKEcByGigHeTfHpKPX3gH1ilO97anTmMmN8OO_rEeeniIT83wAmt3QQWuSV95OHW6D4JFACl8KXSKagEc6D6rB0oKrtB0' },
    { name: 'Stock Ticker', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyV3EiEs3B3atcGA22X0aNXhAUe-2Ot5X0KxEOEIYprDv0vjNI_22mBC2-9AL6UzfhSsHDV7_Xlqo3QTRn4ZAp4aTr4zRc79234qDb1ytMjmkDTqPRj-Mr3DNsLiumQAKPPHd_ukY_1Lv9SEhQie0slaevH1JhAqN0iOVriddprl3sklwPag4RVn9xv4BbbCUnltx-nD3y6OX8q_j0JwGwMqBBYinsFSk6N3BtE2qkgAGr-bjzIH0poALQzzLZ7pgQjhrcR26mL1M' },
    { name: 'Supermarket Corridor', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcvVW46VP93ZR4TZ1mtA-nRGsUxNMLNQklhBnT1mCrxjyegzvDgpcB3S4wyTYFynBeZp6URpJH7LQGpr5Yv_SRcMw0WOtRj2cexQxyZZFhdEz7gWDBkKbHbkH5a8-UUPS7GddCIOWOWwtX9Cb4ErcbHASYCU-e8qb1qWPEY80xT0lIwDl9YBd-TqOECfYobLi8dTL3QEW4Cp7WioyNGrlHAHTedCVI9Sysu2r_HAxASO8OUTilna-Ujn8KtPcwBEOwz116jRvxo1I' },
    { name: 'Solar Rooftops', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdrms_m7MclsxwZmYOQ42YT2myqwoTrW0fgD3aiFkzkyad7MjZfzQVHveuXwERVrSjLhguXgRt_EccK49DCApUzfKMqD2mNf2s6OwBgVvu7SYdSSJbktYa7mSdBfMTgLoYHuxpElVZZULem9jr1bZyD-AteoQkfFzzXa1sOJEHibW4cVkDZc19tIvlEoXnqPSutzda5zSUawNxUNLEwJzp5qAW5a9kHHinpMXxAcX6GTLOwb6Qu0nN-AuwwXFybHL6b6Ua-1WPFFM' }
  ];

  // Load article into local state when selected active edits target changes
  useEffect(() => {
    const art = articles.find(a => a.id === selectedArticleId);
    if (art) {
      setHeadline(art.title);
      setSubheadline(art.subtitle);
      setContent(art.content);
      setCategory(art.category);
      setTags(art.tags || []);
      setFeaturedImage(art.image || PRESET_IMAGES[0].url);
      setImageCaption(art.imageCaption || '');
      setSinhalaMapping(art.sinhalaMapping || '');
      setTamilMapping(art.tamilMapping || '');
      setStatus(art.status);
      setAuthor(art.author || authorRole || 'Desk Editor');
      setSaveStatus('saved');
    }
  }, [selectedArticleId, articles]);

  // Set fields to dirty when updated locally
  const onFieldChange = () => {
    if (saveStatus === 'saved') {
      setSaveStatus('dirty');
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('saving');

    const existingArt = articles.find(a => a.id === selectedArticleId);
    let finalPublishedAt = 'PENDING SCHEDULE';
    if (status === 'Published') {
      if (existingArt && existingArt.publishedAt && existingArt.publishedAt !== 'JUST NOW' && existingArt.publishedAt !== 'PENDING SCHEDULE') {
        finalPublishedAt = existingArt.publishedAt;
      } else {
        finalPublishedAt = new Date().toISOString();
      }
    }

    const updatedArticle: Article = {
      id: selectedArticleId,
      title: headline,
      subtitle: subheadline,
      content,
      category,
      tags,
      publishedAt: finalPublishedAt,
      author: author || 'Senior Staff Writer',
      image: featuredImage,
      imageCaption: imageCaption,
      sinhalaMapping,
      tamilMapping,
      status,
      views: existingArt?.views || 0,
      readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 200))} min`
    };

    onSaveArticle(updatedArticle);

    // Simulated short save delay
    setTimeout(() => {
      setSaveStatus('saved');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(`Saved at ${time}`);
      setNotificationMsg('Report saved successfully. Changes uploaded into Live Reader Database!');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 500);
  };

  const handleCreateNewArticle = () => {
    const newId = `art-${Date.now()}`;
    const newArt: Article = {
      id: newId,
      title: 'Draft: Enter Editorial Headline here',
      subtitle: 'Enter brief executive summary statement of this press release.',
      content: 'Write your comprehensive news report text here...',
      category: 'Politics',
      tags: ['Sri Lanka', 'New Article'],
      publishedAt: 'PENDING SCHEDULE',
      author: authorRole,
      image: PRESET_IMAGES[2].url, // stock
      imageCaption: 'Media filing image credit / Lankan Ledger.',
      status: 'Draft',
      views: 0,
      readTime: '1 min'
    };

    onSaveArticle(newArt);
    setSelectedArticleId(newId);
    setSaveStatus('dirty');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete: "${headline}"?`)) {
      if (onDeleteArticle) {
        onDeleteArticle(selectedArticleId);
        // Switch to another article
        const remaining = articles.filter(a => a.id !== selectedArticleId);
        if (remaining.length > 0) {
          setSelectedArticleId(remaining[0].id);
        }
      }
    }
  };

  // Add tag dynamically
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()];
        setTags(newTags);
        onFieldChange();
      }
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    onFieldChange();
  };

  // Quick rich editor insert assists
  const insertToolbarTag = (prefix: string, suffix: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'Sample Text') + suffix;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setSaveStatus('dirty');
    
    // Focus back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'Sample Text').length);
    }, 50);
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased min-h-screen flex flex-col pt-8">
      
      {/* Top Banner Warning Notification */}
      {showNotification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-black text-white text-xs border-2 border-black p-3 text-center flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all max-w-[90vw]">
          <Check size={14} className="text-[#b81300]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Main CMS Layout wrapper */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] w-full mx-auto relative">
        
        {/* Dynamic Sidebar Navigation Menu */}
        <aside className="w-full lg:w-60 bg-[#e2e2e2] border-r-2 border-b-2 lg:border-b-0 border-black p-6 flex flex-col gap-6 shrink-0">
          <div className="p-2 border-b border-black/10">
            <h1 className="text-xl font-black uppercase italic leading-none tracking-tighter text-black">Lankan Ledger</h1>
            <p className="text-[10px] font-bold uppercase opacity-60 mt-1 tracking-widest">Journalist Portal</p>
          </div>

          <nav className="flex-1 py-4 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'dashboard' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'dashboard' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Desk Overview</span>
              {activeTab === 'dashboard' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'articles' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'articles' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Articles ({articles.length})</span>
              {activeTab === 'articles' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('multimedia')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'multimedia' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'multimedia' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Multimedia Studio</span>
              {activeTab === 'multimedia' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'analytics' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'analytics' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Analytics Hub</span>
              {activeTab === 'analytics' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'comments' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'comments' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Comments Moderation</span>
              {activeTab === 'comments' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase relative transition-all cursor-pointer text-left ${
                activeTab === 'settings' 
                  ? 'bg-black text-white' 
                  : 'text-black opacity-50 hover:opacity-100'
              }`}
            >
              <div className={`w-2 h-2 ${activeTab === 'settings' ? 'bg-white' : 'border border-black'}`}></div>
              <span>Workstation Settings</span>
              {activeTab === 'settings' && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#b81300]"></div>
              )}
            </button>

            <div className="h-px bg-black/10 my-2"></div>

            <button
              type="button"
              onClick={() => onSwitchView('public')}
              className="w-full px-4 py-3 flex items-center gap-3 text-[12px] font-bold uppercase text-[#b81300] opacity-85 hover:opacity-100 hover:bg-black/5 transition-all cursor-pointer text-left"
            >
              <div className="w-2 h-2 border border-[#b81300]"></div>
              <span>Reader Front</span>
            </button>
          </nav>

          {/* Quick Drawer list to SELECT which article to edit */}
          <div className="bg-white border-2 border-black p-4 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a1c1c] mb-2 border-b border-black pb-1.5">Select Report</p>
            <div className="max-h-[140px] overflow-y-auto space-y-1">
              {articles.map((art) => {
                const isCurrent = art.id === selectedArticleId;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left text-[10px] font-bold uppercase tracking-wide truncate p-1.5 block border transition-all ${
                      isCurrent 
                        ? 'border-black bg-black text-white' 
                        : 'border-transparent hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    • {art.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-black space-y-2 mt-auto">
            <button
              onClick={handleCreateNewArticle}
              className="w-full bg-black text-white py-3 text-[11px] font-bold uppercase tracking-widest border border-black hover:bg-white hover:text-black transition-colors cursor-pointer"
            >
              + New Article
            </button>
            
            {/* Active Writer Authentication & Lock Option */}
            <div className="pt-4 border-t border-black/10 flex flex-col gap-2 bg-black/[0.02] p-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-black select-none truncate">
                  {authorRole}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full bg-[#b81300] hover:bg-black text-white text-[9px] font-bold uppercase tracking-widest py-2 border border-black transition-all cursor-pointer text-center"
                  title="Securely lock workstation session and log out"
                >
                  Lock Workstation
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main CMS Board */}
        <main className="flex-1 p-4 md:p-8 bg-white flex flex-col md:overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <CMSDashboard 
              articles={articles} 
              activeTab={activeTab} 
              onSwitchTab={(tab) => {
                if (tab === 'articles') {
                  setActiveTab('articles');
                }
              }} 
              activeReadersCount={activeReadersCount}
            />
          )}

          {activeTab === 'multimedia' && (
            <CMSMultimedia onNotify={(msg) => {
              setNotificationMsg(msg);
              setShowNotification(true);
              setTimeout(() => setShowNotification(false), 3000);
            }} />
          )}

          {activeTab === 'analytics' && (
            <CMSAnalytics 
              articles={articles} 
              activeReadersCount={activeReadersCount}
              onNotify={(msg) => {
                setNotificationMsg(msg);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }} 
            />
          )}

          {activeTab === 'comments' && (
            <CMSComments 
              articles={articles} 
              bylineName={bylineName} 
              pressRole={authorRole}
              onNotify={(msg) => {
                setNotificationMsg(msg);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }} 
            />
          )}

          {activeTab === 'settings' && (
            <CMSSettings 
              bylineName={bylineName} 
              pressRole={authorRole}
              onNotify={(msg) => {
                setNotificationMsg(msg);
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
              }} 
            />
          )}

          {activeTab === 'articles' && (
            <>
              {/* Top Tool Bar / Editor Header */}
          <div className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-4 md:px-8 shrink-0 mb-6 gap-2">
            <div className="flex flex-col">
              <h2 className="text-lg font-black uppercase tracking-tighter">Edit Article</h2>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                {saveStatus === 'saved' ? `System status: Cloud Synced (${lastSavedTime})` : 'System status: Unsaved changes'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Draft / Published switcher pill directly in toolbar */}
              <div className="hidden sm:flex bg-[#f3f3f3] border border-black p-1">
                <button
                  type="button"
                  onClick={() => { setStatus('Draft'); onFieldChange(); }}
                  className={`px-4 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    status === 'Draft' 
                      ? 'bg-black text-white' 
                      : 'text-black opacity-50 hover:opacity-80'
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => { setStatus('Published'); onFieldChange(); }}
                  className={`px-4 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    status === 'Published' 
                      ? 'bg-black text-white' 
                      : 'text-black opacity-50 hover:opacity-80'
                  }`}
                >
                  Published
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSwitchView('public')}
                className="border border-black px-4 md:px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                className="bg-[#b81300] text-white px-5 md:px-8 py-2 text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
              >
                Save
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="border-2 border-black p-1.5 text-[#b81300] hover:bg-[#b81300] hover:text-white transition-colors"
                title="Delete Report"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Form and sidebar column split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Title and Content inputs */}
            <form onSubmit={handleSave} className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Headline block */}
              <div className="bg-white border-2 border-black p-6">
                <div className="mb-4">
                  <label htmlFor="headline" className="text-[10px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">
                    Headline
                  </label>
                  <input
                    id="headline"
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => { setHeadline(e.target.value); onFieldChange(); }}
                    className="w-full text-2xl font-black uppercase tracking-tighter border-none focus:ring-0 p-0 outline-none focus:outline-none"
                    placeholder="ENTER HEADLINE..."
                  />
                </div>

                <div className="border-t border-black/10 pt-4">
                  <label htmlFor="subheadline" className="text-[10px] font-bold uppercase text-gray-500 mb-2 block tracking-widest">
                    Subheadline / Executive Summary Statement
                  </label>
                  <textarea
                    id="subheadline"
                    required
                    rows={2}
                    value={subheadline}
                    onChange={(e) => { setSubheadline(e.target.value); onFieldChange(); }}
                    className="w-full text-sm font-serif text-[#1a1c1c] border-none focus:outline-none focus:ring-0 p-0 outline-none resize-none"
                    placeholder="Brief summary of the report..."
                  ></textarea>

                  {/* Co-Pilot action trigger button */}
                  <div className="border-t border-dashed border-black/15 pt-3 mt-3 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[9px] font-mono font-bold text-[#7e7576]">⚡ AI Newsroom Assistant (Gemini 2.5 Flash)</span>
                    <button
                      type="button"
                      onClick={triggerAICopilot}
                      disabled={isAskingAI || !headline || !content}
                      className="bg-black hover:bg-[#b81300] text-white disabled:bg-zinc-100 disabled:text-zinc-400 disabled:cursor-not-allowed border border-black py-1 px-3 text-[9px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {isAskingAI ? (
                        <>🗲 Syncing Newsroom...</>
                      ) : (
                        <>✨ Run AI Desk Co-Pilot</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Copilot Suggestions Dialog Banner */}
              {aiSuggestions && (
                <div className="bg-[#fffbeb] border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-[fadeIn_0.15s_ease-out]">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2 mb-3">
                    <span className="text-[10px] font-bold tracking-widest text-[#b81300] uppercase font-mono flex items-center gap-1">
                      ✨ Co-Pilot Desk Insights
                    </span>
                    <button 
                      type="button"
                      onClick={() => setAiSuggestions(null)} 
                      className="text-xs font-bold hover:text-[#b81300] font-mono p-1 px-2 border border-black bg-white cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-[#7e7576] uppercase block tracking-wider mb-1">Recommended Captivating Subtitle</span>
                      <p className="text-xs font-serif italic text-zinc-850 leading-relaxed bg-white border border-black/10 p-2.5 pl-3.5 border-l-3 border-l-[#b81300]">
                        "{aiSuggestions.suggestedSubtitle}"
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSubheadline(aiSuggestions.suggestedSubtitle);
                          setSaveStatus('dirty');
                          setNotificationMsg('Subtitle applied successfully!');
                          setShowNotification(true);
                          setTimeout(() => setShowNotification(false), 2000);
                        }}
                        className="mt-2 bg-black hover:bg-[#b81300] text-white px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer font-bold"
                      >
                        Apply Recommended Subtitle
                      </button>
                    </div>

                    <div className="border-t border-black/10 pt-3">
                      <span className="text-[9px] font-mono font-bold text-[#7e7576] uppercase block tracking-wider mb-1 font-bold">Suggested SEO Classification Tags</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {aiSuggestions.suggestedTags.map((tg, i) => (
                          <span key={i} className="text-[9px] bg-white border border-black font-bold text-black px-2 py-0.5 uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                            {tg}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const uniqNewTags = Array.from(new Set([...tags, ...aiSuggestions.suggestedTags]));
                          setTags(uniqNewTags);
                          setSaveStatus('dirty');
                          setNotificationMsg('Tags successfully appended!');
                          setShowNotification(true);
                          setTimeout(() => setShowNotification(false), 2000);
                        }}
                        className="mt-3 bg-black hover:bg-[#b81300] text-white px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors cursor-pointer font-bold"
                      >
                        Append All Suggested Tags
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Rich text editor with Custom Rich Toolbar */}
              <div className="bg-white border-2 border-black flex flex-col overflow-hidden">
                
                {/* Simulated Custom Rich Toolbar */}
                <div className="h-10 border-b border-black bg-[#f9f9f9] flex items-center justify-between px-4 gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => insertToolbarTag('**', '**')}
                      className="font-serif italic font-bold text-lg hover:text-[#b81300] cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertToolbarTag('*', '*')}
                      className="font-serif italic text-lg hover:text-[#b81300] cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertToolbarTag('<u>', '</u>')}
                      className="font-serif underline text-lg hover:text-[#b81300] cursor-pointer"
                      title="Underline"
                    >
                      U
                    </button>

                    <div className="w-px h-4 bg-black/20"></div>

                    <button
                      type="button"
                      onClick={() => insertToolbarTag('\n# ', '\n')}
                      className="text-[10px] font-bold uppercase hover:text-[#b81300] cursor-pointer"
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertToolbarTag('\n## ', '\n')}
                      className="text-[10px] font-bold uppercase hover:text-[#b81300] cursor-pointer"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertToolbarTag('\n> ', '\n')}
                      className="text-[10px] font-bold uppercase hover:text-[#b81300] cursor-pointer"
                      title="Quote Block"
                    >
                      Quote
                    </button>
                  </div>

                  <div className="text-[10px] text-zinc-500 font-mono-data uppercase">
                    Markdown assist
                  </div>
                </div>

                {/* Editor Area */}
                <div className="p-6">
                  <textarea
                    id="content-textarea"
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => { setContent(e.target.value); onFieldChange(); }}
                    className="w-full text-base font-serif leading-relaxed text-gray-800 border-none outline-none focus:outline-none resize-y min-h-[260px]"
                    placeholder="The central bank committee met today..."
                  ></textarea>
                </div>
              </div>

              {/* Author metadata panel */}
              <div className="bg-white border-2 border-black p-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Author / Desk Attribution</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="author" className="block text-[9px] font-bold uppercase text-gray-500 mb-1.5">BYLINE AUTHOR NAME</label>
                    <input
                      id="author"
                      type="text"
                      value={author}
                      onChange={(e) => { setAuthor(e.target.value); onFieldChange(); }}
                      className="w-full bg-[#f9f9f9] border border-black p-2 text-xs focus:ring-1 focus:ring-black outline-none font-bold"
                    />
                  </div>
                  <div className="text-xs text-[#7e7576] flex items-center justify-center p-2 border border-dashed border-black bg-[#f9f9f9]">
                    Attribution is compiled directly into the daily RSS-feed metadata.
                  </div>
                </div>
              </div>

            </form>

            {/* Right Column: Classification metadata sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Classification Box */}
              <div className="bg-white border-2 border-black p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Classification</h3>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="category" className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Primary Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => { setCategory(e.target.value as Article['category']); onFieldChange(); }}
                      className="w-full border border-black p-2 flex justify-between items-center text-[11px] font-bold uppercase cursor-pointer bg-[#f9f9f9] outline-none"
                    >
                      <option value="Politics">Politics</option>
                      <option value="Economy">Economy</option>
                      <option value="World">World</option>
                      <option value="Sports">Sports</option>
                      <option value="Tech">Tech</option>
                      <option value="Culture">Culture</option>
                      <option value="Agri-Business">Agri-Business</option>
                      <option value="Energy">Energy</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">
                      Publication Status
                    </div>
                    <div className="flex gap-1">
                      {(['Draft', 'Scheduled', 'Published'] as Article['status'][]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => { setStatus(st); onFieldChange(); }}
                          className={`flex-1 text-center py-1 text-[9px] font-bold uppercase border transition-all cursor-pointer ${
                            status === st 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-zinc-600 border-zinc-200 hover:bg-[#f9f9f9]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags manager */}
                  <div>
                    <label htmlFor="tags" className="text-[9px] font-bold uppercase text-gray-500 mb-1 block">Tags (Press Enter)</label>
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="w-full bg-[#f9f9f9] border border-black p-2 text-xs focus:outline-none font-bold placeholder-zinc-400"
                      placeholder="e.g. Budget, Tea, IMF"
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tg) => (
                        <span 
                          key={tg}
                          className="text-[9px] bg-black text-white px-2 py-1 uppercase flex items-center gap-1.5"
                        >
                          {tg}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tg)}
                            className="hover:text-red-400 ml-1 font-bold"
                            title={`Remove tag ${tg}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {tags.length === 0 && (
                        <span className="text-[10px] text-zinc-400 italic">No tags associated.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image Manager */}
              <div className="bg-white border-2 border-black p-5 flex flex-col">
                <h3 className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Featured Media</h3>
                
                {/* Cover Image preview */}
                <div className="aspect-video bg-zinc-200 border border-black relative overflow-hidden mb-3">
                  {featuredImage ? (
                    <img 
                      src={featuredImage} 
                      alt="Selected cover preview" 
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                      <ImageIcon size={18} />
                      <span className="text-[9px] font-bold uppercase mt-1">No cover chosen</span>
                    </div>
                  )}
                </div>

                {/* Preset choices in slick grid */}
                <div className="mb-4">
                  <span className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Preset Options</span>
                  <div className="grid grid-cols-5 gap-1">
                    {PRESET_IMAGES.map((img, idx) => {
                      const isSelected = img.url === featuredImage;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => { setFeaturedImage(img.url); onFieldChange(); }}
                          className={`w-full aspect-video border overflow-hidden relative ${
                            isSelected ? 'ring-2 ring-[#b81300] border-transparent' : 'border-zinc-300 hover:brightness-75'
                          }`}
                          title={img.name}
                        >
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            className="object-cover w-full h-full"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom URL Cover Input option */}
                <div className="mb-4">
                  <label htmlFor="featuredImage" className="block text-[9px] font-bold uppercase text-gray-500 mb-1">
                    Custom CDN Image URL
                  </label>
                  <input
                    id="featuredImage"
                    type="url"
                    value={featuredImage}
                    onChange={(e) => { setFeaturedImage(e.target.value); onFieldChange(); }}
                    className="w-full bg-[#f9f9f9] border border-black p-2 text-[10px] focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Image caption */}
                <div>
                  <label htmlFor="img_caption" className="block text-[9px] font-bold uppercase text-gray-500 mb-1">
                    Caption / Credit
                  </label>
                  <input
                    id="img_caption"
                    type="text"
                    value={imageCaption}
                    onChange={(e) => { setImageCaption(e.target.value); onFieldChange(); }}
                    className="w-full text-[10px] border border-black p-2 bg-[#f9f9f9] outline-none"
                    placeholder="Enter credit citation..."
                  />
                </div>
              </div>

              {/* Language Linkage maps */}
              <div className="bg-white border-2 border-black p-5">
                <h3 className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-2 mb-4">Translations</h3>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <label htmlFor="sinhala_id" className="block text-[9px] font-bold uppercase text-gray-500 mb-1">SINHALA ID</label>
                    <input
                      id="sinhala_id"
                      type="text"
                      value={sinhalaMapping}
                      onChange={(e) => { setSinhalaMapping(e.target.value); onFieldChange(); }}
                      placeholder="e.g. art-sinhala-xyz"
                      className="w-full bg-[#f9f9f9] border border-black p-2 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="tamil_id" className="block text-[9px] font-bold uppercase text-gray-500 mb-1">TAMIL ID (தமிழ்)</label>
                    <input
                      id="tamil_id"
                      type="text"
                      value={tamilMapping}
                      onChange={(e) => { setTamilMapping(e.target.value); onFieldChange(); }}
                      placeholder="e.g. art-tamil-xyz"
                      className="w-full bg-[#f9f9f9] border border-black p-2 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

            </aside>

          </div>

          <div className="h-16"></div>
            </>
          )}
        </main>
      </div>

    </div>
  );
}
