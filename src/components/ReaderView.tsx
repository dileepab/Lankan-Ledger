import React, { useState, useMemo, useEffect } from 'react';
import { Article, ViewMode } from '../types';
import { Search, User, RefreshCw, ArrowRight, Play, Globe, Mail, X, ListFilter, SlidersHorizontal, BookOpen, AlertCircle, Bookmark, BookmarkCheck } from 'lucide-react';
import { I18N_DICTIONARY } from '../utils/i18n';
import { formatArticleDate } from '../utils/date';

interface HotComment {
  id: string;
  author: string;
  content: string;
  reactions: number;
  time: string;
}

interface HotPost {
  id: string;
  pageName: string;
  avatarBg: string;
  avatarText: string;
  isVerified?: boolean;
  time: string;
  content: string;
  hashtags: string[];
  articleId?: string;
  reactions: {
    like: number;
    love: number;
    wow: number;
    angry: number;
  };
  totalShares: number;
  userReaction?: 'like' | 'love' | 'wow' | 'angry' | null;
  comments: HotComment[];
  category: 'Politics' | 'Economy' | 'General';
}

interface ReaderViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onSwitchView: (view: ViewMode) => void;
  currentLanguage: 'EN' | 'SI' | 'TA';
  bookmarks: string[];
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
}

export default function ReaderView({
  articles,
  onSelectArticle,
  onSwitchView,
  currentLanguage,
  bookmarks,
  onToggleBookmark
}: ReaderViewProps) {
  const t = (key: string): string => {
    return I18N_DICTIONARY[currentLanguage]?.[key] || key;
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('Home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState<boolean>(false);
  const [showAllReports, setShowAllReports] = useState<boolean>(false);

  // Auto-reset showAllReports when either selectedCategory or searchQuery changes
  useEffect(() => {
    setShowAllReports(false);
  }, [selectedCategory, searchQuery]);

  // States for FB Hot Sub tab
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'fb_hot'>('news');
  const [toastMsg, setToastMsg] = useState<string>('');
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);

  // Dynamic interval ticker to force chronological re-rendering of relative timestamps (e.g. JUST NOW -> 1 MINS AGO)
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 15000); // Ticks every 15 seconds to ensure absolute precision
    return () => clearInterval(timer);
  }, []);

  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const isBookmarked = bookmarks.includes(id);
    onToggleBookmark(id, e);
    setToastMsg(isBookmarked ? t('remove_shelf_msg') : t('pin_shelf_msg'));
    setTimeout(() => setToastMsg(''), 2500);
  };

  const [hotPosts, setHotPosts] = useState<HotPost[]>([
    {
      id: 'hp-1',
      pageName: 'Transparency Sri Lanka',
      avatarBg: '#b81300',
      avatarText: 'TS',
      isVerified: true,
      time: '2 hours ago',
      content: `🚨 PRESS FREEDOM DEBATE: The Broadcasting Authority Bill has officially passed, throwing the media landscape into intense controversy. Opposition members walked out claiming this will lead to systemic licensing hurdles, while government advocates insist it protects the public from high-density disinformation. Who is in the right?`,
      hashtags: ['BroadcastingBill', 'MediaFreedom', 'LankaPolitics'],
      articleId: 'art-3', 
      reactions: { like: 1240, love: 142, wow: 310, angry: 890 },
      totalShares: 432,
      userReaction: null,
      category: 'Politics',
      comments: [
        { id: 'hc-1-1', author: 'Sajith Alwis', content: 'Censorship by any other name. Setting up a state commission to review licenses right before elections is extremely suspicious.', reactions: 112, time: '1h ago' },
        { id: 'hc-1-2', author: 'Dilani Samarasinghe', content: 'Honestly, the amount of fake news on Facebook and YouTube channels has gone out of hand. Some regulation was inevitable.', reactions: 58, time: '45m ago' },
        { id: 'hc-1-3', author: 'Tharindu Perera', content: 'But who controls the regulators? That is the real issue. We cannot trust any political appointee to decide what is "fake news".', reactions: 93, time: '30m ago' }
      ]
    },
    {
      id: 'hp-2',
      pageName: 'Lanka Finance Review',
      avatarBg: '#0f172a',
      avatarText: 'LF',
      isVerified: true,
      time: '4 hours ago',
      content: `📈 IMF Review finishes successfully! But as foreign reserves rise and the Rupee stabilizes, the cost of living remains the top complaint across family groups. Direct tax adjustments on fuel and electricity are hitting middle-income households. Can macro stability save micro budgets?`,
      hashtags: ['IMFReforms', 'LKR', 'CostOfLiving', 'SriLankaBusiness'],
      articleId: 'art-1', 
      reactions: { like: 843, love: 55, wow: 89, angry: 254 },
      totalShares: 189,
      userReaction: null,
      category: 'Economy',
      comments: [
        { id: 'hc-2-1', author: 'Fathima Riza', content: 'LKR at 300 is great for imports, but prices at the supermarket haven\'t dropped even by a single rupee. Corporate profits are soaring.', reactions: 67, time: '3h ago' },
        { id: 'hc-2-2', author: 'Naveen De Silva', content: 'Necessary reforms. Without IMF guidelines we would have been back in the 2022 fuel queues. Praise where it is due.', reactions: 84, time: '2h ago' }
      ]
    },
    {
      id: 'hp-3',
      pageName: 'Colombo Street Voice',
      avatarBg: '#1e3a8a',
      avatarText: 'SV',
      isVerified: false,
      time: '12 hours ago',
      content: `💸 Port City Colombo launches its tax exemption program of up to 25 years for offshore banks and tech developers. While this might turn Colombo into the next Dubai/Singapore, public forums are asking why local small business startups in Western Province only receive high interest rates and tax weights. Is this fair?`,
      hashtags: ['PortCityColombo', 'FDI', 'LocalStartups', 'WesternProvince'],
      reactions: { like: 1560, love: 120, wow: 420, angry: 980 },
      totalShares: 567,
      userReaction: null,
      category: 'Politics',
      comments: [
        { id: 'hc-3-1', author: 'Roshan Abeysekera', content: 'Local startups are starved of venture capital, but multi-million dollar casinos get 25 years tax holidays. Utter madness.', reactions: 215, time: '10h ago' },
        { id: 'hc-3-2', author: 'Devinda Wijesinghe', content: 'It raises the global status of Colombo. Offshore capital has to start somewhere, they will eventually employ thousands of local engineers.', reactions: 41, time: '8h ago' },
        { id: 'hc-3-3', author: 'Mohamed Shiyam', content: 'Both should be supported. We need tax exemptions for our tech startups to prevent brain drain.', reactions: 130, time: '6h ago' }
      ]
    },
    {
      id: 'hp-4',
      pageName: 'Lanka Agro Watch',
      avatarBg: '#047857',
      avatarText: 'AW',
      isVerified: true,
      time: '1 day ago',
      content: `🍃 Ceylon Tea exports hit a five-year peak in Q3! High bidding rates in Colombo Auctions means massive revenues for exporters. However, grassroots groups on Facebook are raising awareness on whether this wealth translates to fair wages for the tea pluckers down in Hatton and Nuwara Eliya.`,
      hashtags: ['CeylonTea', 'EstateWages', 'NuwaraEliya', 'Grassroots'],
      articleId: 'art-2', 
      reactions: { like: 940, love: 312, wow: 60, angry: 95 },
      totalShares: 220,
      userReaction: null,
      category: 'General',
      comments: [
        { id: 'hc-4-1', author: 'Arul Loganathan', content: 'Thank you for raising this. Tea pluckers are still fighting for basic wage hikes despite export peaks. Standard export corporates take major margins.', reactions: 110, time: '20h ago' },
        { id: 'hc-4-2', author: 'Kumara Perera', content: 'Ceylon Tea is our pride. Glad to see export figures recovering post-fertilizer crisis.', reactions: 48, time: '18h ago' }
      ]
    }
  ]);

  // Reset subtab if category changes to something other than Home or Politics
  useEffect(() => {
    if (selectedCategory !== 'Home' && selectedCategory !== 'Politics') {
      setActiveSubTab('news');
    }
  }, [selectedCategory]);

  const displayedHotPosts = useMemo(() => {
    if (selectedCategory === 'Politics') {
      return hotPosts.filter(p => p.category === 'Politics');
    }
    return hotPosts;
  }, [hotPosts, selectedCategory]);

  const handleReactToPost = (postId: string, reactionType: 'like' | 'love' | 'wow' | 'angry') => {
    setHotPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const reactionsCopy = { ...post.reactions };
        let updatedReaction: typeof post.userReaction = reactionType;
        
        if (post.userReaction === reactionType) {
          reactionsCopy[reactionType] = Math.max(0, reactionsCopy[reactionType] - 1);
          updatedReaction = null;
        } else {
          if (post.userReaction) {
            reactionsCopy[post.userReaction] = Math.max(0, reactionsCopy[post.userReaction] - 1);
          }
          reactionsCopy[reactionType] = reactionsCopy[reactionType] + 1;
        }
        
        return {
          ...post,
          reactions: reactionsCopy,
          userReaction: updatedReaction
        };
      }
      return post;
    }));
    setActiveReactionPicker(null);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    setHotPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `hc-custom-${Date.now()}`,
              author: t('anonymous_reader'),
              content: text.trim(),
              reactions: 0,
              time: 'Just now'
            }
          ]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setToastMsg(t('comment_sync_msg'));
    setTimeout(() => setToastMsg(''), 3000);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSharePost = (postId: string) => {
    const dummyLink = `${window.location.origin}/feed/fb-trending/${postId}`;
    navigator.clipboard.writeText(dummyLink).then(() => {
      setToastMsg(t('copied_clip_msg'));
      setTimeout(() => setToastMsg(''), 3000);
    }).catch(() => {
      setToastMsg(t('formulated_social_msg'));
      setTimeout(() => setToastMsg(''), 3000);
    });
  };

  // Categories list
  const categories = ['Home', 'Politics', 'Economy', 'World', 'Sports', 'Tech', 'Culture', 'Agri-Business', 'Energy'];

  // Filtered articles based on active category selection and search terms
  const filteredArticles = useMemo(() => {
    let result = articles.filter(a => a.status === 'Published');
    
    if (selectedCategory !== 'Home') {
      result = result.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(q) || 
        a.subtitle.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [articles, selectedCategory, searchQuery]);

  // Extract designated positions dynamically so that edits in CMS reflect instantly in layout!
  // Hero: The latest published article (since articles are sorted descending)
  const heroArticle = useMemo(() => {
    return filteredArticles[0];
  }, [filteredArticles]);

  // nuwara eliya tea (Agri-Business highlight): The latest published Agri-Business article (excluding hero)
  const teaArticle = useMemo(() => {
    return filteredArticles.find(a => a.category === 'Agri-Business' && a.id !== heroArticle?.id);
  }, [filteredArticles, heroArticle]);

  // Controversy Bill (Politics highlight): The latest published Politics article (excluding hero)
  const billArticle = useMemo(() => {
    return filteredArticles.find(a => a.category === 'Politics' && a.id !== heroArticle?.id);
  }, [filteredArticles, heroArticle]);

  // Stock Market (Economy & Commerce Highlight 1): The latest published Economy article (excluding hero)
  const stockArticle = useMemo(() => {
    return filteredArticles.find(a => a.category === 'Economy' && a.id !== heroArticle?.id);
  }, [filteredArticles, heroArticle]);

  // Supermarket (Economy & Commerce Highlight 2): The second latest published Economy article (excluding hero and highlight 1)
  const supermarketArticle = useMemo(() => {
    return filteredArticles.find(a => a.category === 'Economy' && a.id !== heroArticle?.id && a.id !== stockArticle?.id);
  }, [filteredArticles, heroArticle, stockArticle]);

  // Solar Rooftops (Energy Highlight): The latest published Energy article (excluding hero)
  const solarArticle = useMemo(() => {
    return filteredArticles.find(a => a.category === 'Energy' && a.id !== heroArticle?.id);
  }, [filteredArticles, heroArticle]);

  // Exclude all highlighted articles from the default Home "Latest News" feed sidebar to avoid duplication
  const sidebarArticles = useMemo(() => {
    const highlightIds = new Set([
      heroArticle?.id,
      teaArticle?.id,
      billArticle?.id,
      stockArticle?.id,
      supermarketArticle?.id,
      solarArticle?.id
    ].filter(Boolean));
    return filteredArticles.filter(a => !highlightIds.has(a.id));
  }, [filteredArticles, heroArticle, teaArticle, billArticle, stockArticle, supermarketArticle, solarArticle]);

  const mostReadArticles = useMemo(() => {
    return [...articles]
      .filter(a => a.status === 'Published')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 3);
  }, [articles]);

  const handleRefreshFeed = () => {
    setSearchQuery('');
    setSelectedCategory('Home');
    setShowAllReports(false);
  };

  const handleViewAllReports = () => {
    setShowAllReports(true);
    setSearchQuery('');
    setSelectedCategory('Home');
  };

  const handleSidebarMostReadClick = (title: string) => {
    // Look up matching if exists, or generate dynamic mock article
    const match = articles.find(a => a.title.toLowerCase().includes(title.toLowerCase().slice(0, 10)));
    if (match) {
      onSelectArticle(match);
    } else {
      // open a beautifully structured placeholder
      onSelectArticle({
        id: 'most-read-temp',
        title: title,
        subtitle: 'Special Live Report by the Lankan Ledger foreign affairs and national interest desk.',
        content: `COLOMBO — Public discussions surrounding this development continue to scale high attention as various key operators express intense stances.\n\nOpposition leaders argue that direct regulatory interventions could reduce market flexibility, while state ministers assure that long-term stabilization remains paramount.\n\nThe Lankan Ledger will update this report live as official updates appear in Parliament later today.`,
        category: 'Politics',
        tags: ['Current Affairs', 'Debate', 'Lanka News'],
        publishedAt: 'JUST NOW',
        author: 'Dulan Selvanayagam',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi4Bv3Xews485T2LrNLMtzGlnLBwpDjTaTTS0rzS2gh_FEbc8xYtZpBO3JgkRtf373fwGTNWF8hDZ4ufpSS2sULgcm02YjRy6sX70TWufgGxdt85HstUTYchJfpBD-X6diAo4I8bia0zkJEmtggk5njzHDkpzkpVPXsScG0ClLqFQ10rDoCz6IP855jmcVyrzgbrPGlUVRYBVBGRkXqPhMa_FAqfUkxGXluRZJxhXgOHBfvF9lo-pyiPP8XIZC_M6SjU694klWoxE',
        status: 'Published',
        views: 7300,
        readTime: '3 min'
      });
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans antialiased min-h-screen">
      
      {/* Bookmarks Overlay Shelf Drawer */}
      {isBookmarkDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" id="bookmarks-shelf-drawer">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setIsBookmarkDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-80 md:w-96 bg-white border-l-4 border-black p-6 flex flex-col shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] animate-[slideInRight_0.15s_ease-out] h-full">
              <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="fill-[#b81300] text-[#b81300]" size={18} />
                  <h3 className="text-sm font-black uppercase tracking-tight text-black">{t('saved_shelf')} ({bookmarks.length})</h3>
                </div>
                <button 
                  onClick={() => setIsBookmarkDrawerOpen(false)}
                  className="p-1 px-2 border border-black hover:bg-[#b81300] hover:text-white transition-all text-xs font-bold font-mono"
                  title="Close Shelf"
                >
                  {t('esc')}
                </button>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {bookmarks.length === 0 ? (
                  <div className="py-20 text-center text-zinc-400 font-serif italic text-xs">
                    {t('saved_shelf_empty')}
                  </div>
                ) : (
                  articles.filter(art => bookmarks.includes(art.id)).map(art => (
                    <div 
                      key={art.id} 
                      onClick={() => { onSelectArticle(art); setIsBookmarkDrawerOpen(false); }}
                      className="border-2 border-black bg-white p-3.5 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative group"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleBookmark(art.id); }}
                        className="absolute top-2 right-2 text-zinc-400 hover:text-[#b81300] p-1 text-sm font-bold transition-colors"
                        title={t('remove_bookmark')}
                      >
                        ×
                      </button>
                      <span className="text-[9px] font-mono font-bold uppercase text-[#b81300] bg-[#b81300]/5 px-1.5 py-0.5">
                        {t(art.category)}
                      </span>
                      <h4 className="text-[12px] font-black uppercase tracking-tight text-black mt-2 line-clamp-2 pr-4 leading-tight">
                        {art.title}
                      </h4>
                      <p className="text-[9px] text-zinc-500 line-clamp-1 mt-1.5 font-mono">
                        {formatArticleDate(art.publishedAt, currentLanguage)} • {art.readTime || "3 min"} {t('minutes_read')}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-black pt-4 mt-4 text-[10px] text-center text-zinc-400 font-mono">
                {t('read_later_service')}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Banner Branding / Portal quick switch */}
      <div className="bg-black text-white py-1.5 px-4 text-center text-xs font-label-caps border-b border-zinc-800 flex justify-between items-center max-w-[1280px] mx-auto mt-8">
        <span className="hidden md:inline text-zinc-400">{t('realtime_synced_frontpage')}</span>
        <span className="text-[#eeeeee]">{t('you_are_in')} <strong className="text-[#b81300] underline">{t('reader_view')}</strong></span>
        <button
          onClick={() => onSwitchView('cms')}
          className="bg-[#b81300] hover:bg-white hover:text-black text-white px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider float-right transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>{t('journalist_portal')}</span> ✎
        </button>
      </div>

      {/* TopAppBar (Center-aligned) */}
      <header className="border-b-2 border-black bg-white sticky top-0 md:top-8 z-40 transition-shadow">
        <div className="flex flex-col w-full max-w-[1280px] mx-auto px-4 md:px-12 pt-4 pb-2">
          
          <div className="flex justify-between items-center">
            {/* Quick date display */}
            <div className="w-28 hidden md:block text-[11px] font-mono-data text-[#7e7576]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>

            {/* Giant Branding Logo */}
            <h1 
              onClick={() => setSelectedCategory('Home')}
              className="font-display font-bold text-[32px] md:text-[54px] uppercase tracking-tighter text-black select-none text-center cursor-pointer hover:opacity-90"
            >
              LANKAN LEDGER
            </h1>

            {/* Top Toolbar */}
            <div className="flex items-center space-x-3.5">
              <div className="relative flex items-center">
                {isSearchOpen && (
                  <input
                    type="text"
                    placeholder={t('search_articles')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-black bg-white px-2.5 py-1 text-xs rounded-none focus:outline-none w-36 md:w-56 focus:ring-1 focus:ring-black mr-2 animate-[fadeIn_0.15s_ease-out]"
                    autoFocus
                  />
                )}
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1 hover:text-[#b81300] transition-colors"
                  title="Search articles"
                >
                  <Search size={18} />
                </button>
              </div>

              <button 
                onClick={() => setIsBookmarkDrawerOpen(!isBookmarkDrawerOpen)}
                className="p-1 hover:text-[#b81300] transition-colors relative"
                title={`${bookmarks.length} Saved Articles`}
              >
                <Bookmark size={18} className={bookmarks.length > 0 ? "fill-[#b81300] text-[#b81300]" : ""} />
                {bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                    {bookmarks.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => onSwitchView('cms')}
                className="p-1 hover:text-[#b81300] transition-colors relative"
                title="Go to CMS Portal"
              >
                <User size={18} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#b81300] border border-white rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Navigation Category Bar (Desktop) */}
          <nav className="flex justify-between md:justify-center items-center md:space-x-7 pt-4 md:pb-2 overflow-x-auto border-t border-black/10 select-none no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[12px] font-label-caps uppercase pb-1.5 transition-all flex-shrink-0 cursor-pointer ${
                    isActive 
                      ? 'text-[#b81300] font-bold border-b-2 border-[#b81300]' 
                      : 'text-black hover:text-[#b81300]'
                  }`}
                >
                  {t(cat)}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-12 mt-6 mb-16 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Global Search Bar */}
        <div className="w-full mb-8" id="global-search-container">
          <div className="relative border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center">
            <div className="pl-4 pr-2 text-black/55 shrink-0">
              <Search size={18} className="text-black" />
            </div>
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-white text-sm font-sans py-3.5 pr-4 placeholder-gray-400 outline-none focus:outline-none text-black font-semibold"
            />
            {searchQuery && (
              <button
                type="button"
                id="global-search-clear-btn"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-xs font-bold uppercase text-[#b81300] hover:text-black border-l border-zinc-200 cursor-pointer shrink-0 transition-colors"
                title="Clear Search"
              >
                {t('clear')}
              </button>
            )}
            <div className="hidden md:flex items-center gap-2 bg-black text-white shrink-0 px-4 py-4 border-l-2 border-black text-[9px] font-bold uppercase tracking-widest select-none">
              <span>{t('realtime_index')}</span>
              <span className="w-2 h-2 rounded-full bg-[#b81300] animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Billboard Ad */}
        <div className="w-full mb-8 flex flex-col items-center justify-center border-2 border-black bg-[#e2e2e2] h-[90px] md:h-[130px] p-5 relative text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="absolute top-1 left-2 font-bold text-[8px] uppercase tracking-widest text-[#7e7576]">{t('sponsored_advertisement')}</span>
          <p className="text-[#1a1c1c] font-bold text-[14px] md:text-[16px] uppercase tracking-widest leading-none">
            {t('port_city_title')}
          </p>
          <p className="text-[11px] text-[#4c4546] hidden sm:block mt-1.5 max-w-2xl font-serif">
            {t('port_city_desc')}
          </p>
          <span className="absolute bottom-1 right-2 text-[8px] font-mono text-[#7e7576] font-bold">970 x 250 BOARD</span>
        </div>

        {/* Current Search/Filter Notification */}
        {(selectedCategory !== 'Home' || searchQuery || showAllReports) && (
          <div className="bg-white border-2 border-black p-4 mb-6 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                {showAllReports ? t('all_archives') : t('filter_active')}
              </span>
              <p className="text-xs text-[#4c4546] font-serif">
                {showAllReports ? (
                  <>Showing <strong className="text-black font-sans">all publications</strong> synchronized in the live database ({filteredArticles.length} total).</>
                ) : (
                  <>
                    Showing results for Category <strong className="text-black font-sans">"{t(selectedCategory)}"</strong>
                    {searchQuery && <> and search <strong className="text-black font-sans">"{searchQuery}"</strong></>}
                    . found <strong className="text-black font-sans">{filteredArticles.length}</strong> matching reports.
                  </>
                )}
              </p>
            </div>
            <button 
              onClick={handleRefreshFeed}
              className="font-bold text-[10px] uppercase text-[#b81300] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> {showAllReports ? t('clear_archives_label') : t('clear_filters')}
            </button>
          </div>
        )}

        {/* Sub-tabs for Home & Politics: Editorial Reports vs. FB Hot */}
        {(selectedCategory === 'Home' || selectedCategory === 'Politics') && !searchQuery && (
          <div className="flex border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden rounded-none select-none">
            <button
              onClick={() => setActiveSubTab('news')}
              className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all cursor-pointer text-center ${
                activeSubTab === 'news'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-zinc-50'
              }`}
            >
              {t('editorial_reports')}
            </button>
            <button
              onClick={() => setActiveSubTab('fb_hot')}
              className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                activeSubTab === 'fb_hot'
                  ? 'bg-[#b81300] text-white'
                  : 'bg-white text-[#b81300] hover:bg-zinc-50 border-l border-black'
              }`}
            >
              {t('fb_hot_buzz')} <span className="text-[10px] bg-black text-white px-1.5 py-0.5 font-bold animate-pulse">{t('live_feed')}</span>
            </button>
          </div>
        )}

        {filteredArticles.length === 0 && activeSubTab === 'news' ? (
          /* Empty search fallbacks */
          <div className="bg-white border-2 border-black p-12 text-center my-6 max-w-2xl mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle size={36} className="mx-auto text-black mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight text-black mb-2">{t('no_published_reports')}</h3>
            <p className="text-xs text-[#4c4546] font-serif max-w-md mx-auto mb-6 leading-relaxed">
              {t('no_published_desc')}
            </p>
            <button
              onClick={() => onSwitchView('cms')}
              className="bg-[#b81300] text-white border-2 border-black px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-black transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
            >
              {t('write_in_cms')}
            </button>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            {selectedCategory === 'Home' && !searchQuery && heroArticle && activeSubTab === 'news' && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 border-b-2 border-black pb-8">
                
                {/* Main Featured Hero Column */}
                <article 
                  onClick={() => onSelectArticle(heroArticle)}
                  className="lg:col-span-8 flex flex-col group cursor-pointer select-none"
                >
                  <div className="w-full aspect-video bg-zinc-100 border-2 border-black relative overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      alt={heroArticle.title} 
                      className="object-cover w-full h-full group-hover:scale-[1.01] transition-transform duration-500" 
                      src={heroArticle.image}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                      {t('featured_report')}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-bold text-[10px] tracking-widest text-[#b81300] uppercase">
                      {t(heroArticle.category)}
                    </span>
                    <span className="text-[#cfc4c5] text-xs">•</span>
                    <span className="font-mono text-[10px] font-bold text-[#7e7576] uppercase">
                      {formatArticleDate(heroArticle.publishedAt, currentLanguage)}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black group-hover:text-[#b81300] transition-colors mb-3 leading-none">
                    {heroArticle.title}
                  </h2>
                  
                  <p className="font-serif text-sm md:text-base text-[#4c4546] line-clamp-3 leading-relaxed">
                    {heroArticle.subtitle}
                  </p>
                </article>

                {/* Secondary Heroes (Side column) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Tea Plantation */}
                  {teaArticle && (
                    <article 
                      onClick={() => onSelectArticle(teaArticle)}
                      className="flex flex-col group cursor-pointer border-b border-black/10 pb-5"
                    >
                      <div className="w-full aspect-[16/9] bg-zinc-100 border-2 border-black overflow-hidden mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <img 
                          alt={teaArticle.title} 
                          className="object-cover w-full h-full group-hover:scale-[1.01] transition-transform duration-500" 
                          src={teaArticle.image}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-bold text-[9px] tracking-widest text-[#4c4546] uppercase mb-1">
                        {t(teaArticle.category)}
                      </span>
                      <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-black group-hover:text-[#b81300] transition-colors leading-tight">
                        {teaArticle.title}
                      </h3>
                    </article>
                  )}

                  {/* Broadcasting Bill Controversy */}
                  {billArticle && (
                    <article 
                      onClick={() => onSelectArticle(billArticle)}
                      className="flex flex-col group cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="font-bold text-[10px] tracking-widest text-[#b81300] uppercase">
                          {t(billArticle.category)}
                        </span>
                        <span className="text-[#cfc4c5] text-xs">•</span>
                        <span className="font-mono text-[10px] font-bold text-[#7e7576] uppercase">
                          {formatArticleDate(billArticle.publishedAt, currentLanguage)}
                        </span>
                      </div>
                      <h3 className="text-base font-black uppercase tracking-tight text-black group-hover:text-[#b81300] transition-colors leading-tight mb-2">
                        {billArticle.title}
                      </h3>
                      <p className="font-serif text-xs text-[#4c4546] line-clamp-2 leading-relaxed">
                        {billArticle.subtitle}
                      </p>
                    </article>
                  )}
                </div>
              </section>
            )}

            {/* 3 Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Column 1: News Feed (Dynamic Adaptive Layout) */}
              <div className={`${
                showAllReports || selectedCategory !== 'Home' || searchQuery
                  ? 'lg:col-span-12'
                  : 'lg:col-span-3 lg:border-r lg:border-black/20 lg:pr-6'
              } flex flex-col`}>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-black border-t-2 border-black pt-2 mb-4 flex justify-between items-center">
                  <span>
                    {showAllReports 
                      ? t('all_synchronized_reports') 
                      : selectedCategory !== 'Home' 
                        ? `${t(selectedCategory)}` 
                        : searchQuery 
                          ? `${t('search_articles')} "${searchQuery}"` 
                          : t('latest_news')}
                  </span>
                  <RefreshCw size={13} className="text-[#b81300] cursor-pointer hover:rotate-180 transition-all duration-300 animate-spin-once" onClick={handleRefreshFeed} />
                </h3>

                <div className={
                  showAllReports || selectedCategory !== 'Home' || searchQuery
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-3"
                }>
                  {(showAllReports || selectedCategory !== 'Home' || searchQuery ? filteredArticles : sidebarArticles).slice(0, (showAllReports || selectedCategory !== 'Home' || searchQuery) ? undefined : 100).map((art) => (
                    showAllReports || selectedCategory !== 'Home' || searchQuery ? (
                      /* Beautiful Full Card for List/Search Mode */
                      <article
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="group cursor-pointer border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 flex flex-col justify-between h-full select-none"
                      >
                        <div>
                          {/* Image banner */}
                          <div className="w-full aspect-[16/10] bg-zinc-100 border border-black overflow-hidden mb-3 relative">
                            <img
                              alt={art.title}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                              src={art.image}
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5">
                              {t(art.category)}
                            </div>
                            <button
                              onClick={(e) => handleToggleBookmark(art.id, e)}
                              className="absolute top-2 right-2 bg-white/95 border border-black hover:bg-black hover:text-white p-1 text-black font-bold h-6 w-6 flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
                              title={bookmarks.includes(art.id) ? t('remove_bookmark') : t('save_report')}
                            >
                              <Bookmark size={11} className={bookmarks.includes(art.id) ? "fill-[#b81300] text-[#b81300]" : ""} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[9px] text-[#b81300] font-bold uppercase">
                              {formatArticleDate(art.publishedAt, currentLanguage)}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono font-bold">
                              👁 {art.views?.toLocaleString() || '0'} {t('views_stat')}
                            </span>
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-tight text-black group-hover:text-[#b81300] transition-colors line-clamp-2 leading-snug mb-2 font-sans">
                            {art.title}
                          </h4>
                          <p className="font-serif text-xs text-[#4c4546] line-clamp-3 leading-relaxed mb-4">
                            {art.subtitle}
                          </p>
                        </div>
                        <div className="border-t border-black/10 pt-3 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          <span>{t('by_author')} {art.author.replace('Senior ', '')}</span>
                          <span className="bg-[#b81300]/10 text-[#b81300] px-2 py-0.5 text-[8px] font-mono rounded-none">
                            {art.readTime}
                          </span>
                        </div>
                      </article>
                    ) : (
                      /* Simple Sidebar layout */
                      <article 
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="group cursor-pointer border-b border-black/10 pb-3 last:border-0 hover:bg-[#eee] transition-all p-2 -mx-2"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[9px] text-[#b81300] font-bold uppercase">
                            {formatArticleDate(art.publishedAt, currentLanguage)}
                          </span>
                          <span className="text-[8px] font-bold bg-black text-white px-1.5 uppercase">
                            {t(art.category)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold leading-snug text-black group-hover:text-[#b81300] transition-colors line-clamp-3 font-sans">
                          {art.title}
                        </h4>
                      </article>
                    )
                  ))}
                </div>

                {/* Return button if filtered list active */}
                {(showAllReports || selectedCategory !== 'Home' || searchQuery) && (
                  <div className="mt-12 text-center w-full">
                    <button
                      onClick={handleRefreshFeed}
                      className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#b81300] transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] active:translate-y-0.5 active:translate-x-0.5 font-sans"
                    >
                      {t('back_to_primary_feed')}
                    </button>
                  </div>
                )}

                {!(showAllReports || selectedCategory !== 'Home' || searchQuery) && (
                  <button 
                    onClick={handleViewAllReports}
                    className="mt-6 w-full border-2 border-black text-black font-bold uppercase py-2.5 text-[10px] tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:translate-x-0.5"
                  >
                    {t('view_all_reports')} <ArrowRight size={12} />
                  </button>
                )}
              </div>

              {/* Column 2: Economy & Business Main Area or FB Hot Buzz Feed (6 cols) */}
              {!(showAllReports || selectedCategory !== 'Home' || searchQuery) && (
                <div className="lg:col-span-6 flex flex-col lg:px-2">
                  {(selectedCategory === 'Home' || selectedCategory === 'Politics') && activeSubTab === 'fb_hot' ? (
                  // FB Hot Buzz Social Media Feed Layout
                  <div className="flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
                    <div className="border-t-2 border-black pt-2 mb-2 flex items-center justify-between">
                      <h3 className="text-[14px] font-black uppercase tracking-tight text-[#b81300] flex items-center gap-1.5 select-none">
                        <span className="w-2.5 h-2.5 bg-[#b81300] rounded-full animate-pulse inline-block"></span>
                        🔥 {t('fb_hot_buzz')} Sri Lanka
                      </h3>
                      <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 uppercase tracking-wider select-none font-bold">
                        {displayedHotPosts.length} {t('active_debates')}
                      </span>
                    </div>

                    {displayedHotPosts.map((post) => {
                      const isExpanded = !!expandedComments[post.id];
                      const draftComment = commentInputs[post.id] || '';
                      
                      // Calculate total reaction values
                      const totalReactions = post.reactions.like + post.reactions.love + post.reactions.wow + post.reactions.angry;
                      
                      // Resolve connected article
                      const linkedArticle = post.articleId ? articles.find(a => a.id === post.articleId) : null;

                      return (
                        <div key={post.id} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          
                          {/* Post Header */}
                          <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full text-white font-black text-sm flex items-center justify-center border-2 border-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                style={{ backgroundColor: post.avatarBg }}
                              >
                                {post.avatarText}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-sm text-black tracking-tight hover:underline cursor-pointer">{post.pageName}</span>
                                  {post.isVerified && (
                                    <span className="text-blue-600 select-none cursor-help font-bold" title="Verified Social Buzz channel. Checked of authenticity.">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono block leading-none mt-0.5">{post.time} • FB Live Index</span>
                              </div>
                            </div>
                            <span className="text-[9px] font-black bg-[#b81300]/10 text-[#b81300] border border-[#b81300]/35 px-2 py-1 uppercase tracking-wider">
                              {t(post.category)}
                            </span>
                          </div>

                          {/* Post Body Text */}
                          <p className="text-sm text-black leading-relaxed mb-4 font-sans font-medium">
                            {post.content}
                          </p>

                          {/* Hashtags */}
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {post.hashtags.map(tg => (
                              <button
                                key={tg}
                                onClick={() => {
                                  setSearchQuery(tg);
                                  // Switch to news tab to see matching editorial articles
                                  setActiveSubTab('news');
                                }}
                                className="text-xs font-bold text-[#b81300] hover:underline cursor-pointer"
                              >
                                #{tg}
                              </button>
                            ))}
                          </div>

                          {/* Linked Article Card Attachment */}
                          {linkedArticle && (
                            <div 
                              onClick={() => onSelectArticle(linkedArticle)}
                              className="border border-black hover:bg-neutral-50 bg-white cursor-pointer overflow-hidden flex flex-col sm:flex-row gap-3 p-3 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title="Click to view related investigative report"
                            >
                              <div className="w-full sm:w-28 h-20 bg-zinc-100 overflow-hidden shrink-0 border border-black/10">
                                <img
                                  src={linkedArticle.image}
                                  alt={linkedArticle.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="flex flex-col justify-center font-sans">
                                <span className="text-[8px] font-black uppercase text-[#b81300] tracking-wider mb-0.5">{t(linkedArticle.category)} PERSPECTIVE</span>
                                <h4 className="text-xs font-black uppercase tracking-tight text-black line-clamp-2 leading-tight hover:text-[#b81300]">
                                  {linkedArticle.title}
                                </h4>
                                <span className="text-[9px] text-[#7e7576] font-mono leading-none mt-1">Lankan Ledger • {formatArticleDate(linkedArticle.publishedAt, currentLanguage)}</span>
                              </div>
                            </div>
                          )}

                          {/* Social Stats Area */}
                          <div className="flex justify-between items-center text-xs text-zinc-500 border-t border-b border-black/10 py-2.5 mb-3 select-none">
                            <div className="flex items-center gap-1.5">
                              <span className="flex -space-x-1">
                                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] border border-white font-bold">👍</span>
                                <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] border border-white font-bold">❤️</span>
                                <span className="w-5 h-5 rounded-full bg-yellow-500 text-white flex items-center justify-center text-[10px] border border-white font-bold">😮</span>
                                <span className="w-5 h-5 rounded-full bg-indigo-900 text-white flex items-center justify-center text-[10px] border border-white font-bold">😡</span>
                              </span>
                              <span className="font-bold text-black/85 font-mono">{totalReactions.toLocaleString()} {t('engagement_counts')}</span>
                            </div>
                            <div className="flex gap-2.5 font-mono text-[11px] font-semibold text-black/60">
                              <span>{post.comments.length} {t('comments')}</span>
                              <span>•</span>
                              <span>{post.totalShares} {t('shares')}</span>
                            </div>
                          </div>

                          {/* Quick Reactions Bar & Buttons */}
                          <div className="flex justify-between items-center relative gap-1.5">
                            {/* React Button & Popover */}
                            <div className="relative">
                              <button
                                onClick={() => setActiveReactionPicker(activeReactionPicker === post.id ? null : post.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase border border-black cursor-pointer transition-all ${
                                  post.userReaction
                                    ? 'bg-[#b81300] text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white hover:bg-neutral-50 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                                }`}
                              >
                                {post.userReaction === 'like' && '👍 Like'}
                                {post.userReaction === 'love' && '❤️ Love'}
                                {post.userReaction === 'wow' && '😮 Wow'}
                                {post.userReaction === 'angry' && '😡 Angry'}
                                {!post.userReaction && <span>🔥 {t('react_button')}</span>}
                              </button>

                              {/* Hover popover for quick emojis */}
                              {activeReactionPicker === post.id && (
                                <div className="absolute top-10 left-0 bg-white border-2 border-black p-2 flex gap-3 z-30 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-[fadeIn_0.15s_ease-out]">
                                  {[
                                    { type: 'like', char: '👍', label: 'Like' },
                                    { type: 'love', char: '❤️', label: 'Love' },
                                    { type: 'wow', char: '😮', label: 'Wow' },
                                    { type: 'angry', char: '😡', label: 'Angry' },
                                  ].map(reactOpt => (
                                    <button
                                      key={reactOpt.type}
                                      onClick={() => handleReactToPost(post.id, reactOpt.type as any)}
                                      className="text-2xl hover:scale-125 hover:rotate-6 transition-transform cursor-pointer p-0.5"
                                      title={reactOpt.label}
                                    >
                                      {reactOpt.char}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Comment Accordion Trigger */}
                            <button
                              onClick={() => toggleComments(post.id)}
                              className={`flex-1 flex justify-center items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase bg-white hover:bg-neutral-50 text-black border border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all`}
                            >
                              💬 {t('comments')} ({post.comments.length})
                            </button>

                            {/* Share button */}
                            <button
                              onClick={() => handleSharePost(post.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase bg-white hover:bg-neutral-50 text-black border border-black cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                            >
                              🔗 {t('share_button')}
                            </button>
                          </div>

                          {/* Comments Thread Open Accordion */}
                          {isExpanded && (
                            <div className="border-t border-black/15 pt-4 mt-4 animate-[fadeIn_0.2s_ease-out]">
                              <h5 className="font-mono text-[9px] uppercase font-bold text-zinc-500 mb-3 border-b border-dashed border-black/10 pb-1">{t('discussion_thread')}</h5>
                              
                              <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                                {post.comments.map((cm) => (
                                  <div key={cm.id} className="bg-neutral-50 border border-black/10 p-3 rounded-none relative">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-xs text-black">{cm.author}</span>
                                      <span className="text-[9px] text-zinc-400 font-mono font-bold">{cm.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-800 leading-relaxed font-sans">{cm.content}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Interactive input area */}
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder={t('join_discussion_placeholder')}
                                  value={draftComment}
                                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(post.id);
                                  }}
                                  className="flex-1 bg-white border border-black text-xs p-2.5 rounded-none outline-none focus:ring-1 focus:ring-black font-semibold"
                                />
                                <button
                                  onClick={() => handleAddComment(post.id)}
                                  className="bg-black text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-[#b81300] cursor-pointer"
                                >
                                  {t('post_button')}
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Standard Economy & Business layout
                  <>
                    <h3 className="text-[14px] font-black uppercase tracking-tight text-black border-t-2 border-black pt-2 mb-4">
                      {t('economy_and_commerce_focus')}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      {/* Stock Market Card Option */}
                      {stockArticle && (
                        <article 
                          onClick={() => onSelectArticle(stockArticle)}
                          className="group cursor-pointer flex flex-col border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                        >
                          <div className="aspect-video bg-zinc-100 overflow-hidden mb-3 border border-black/10">
                            <img 
                              alt="Stock digital screen" 
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                              src={stockArticle.image}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h4 className="font-sans font-bold text-sm text-black group-hover:text-[#b81300] leading-snug line-clamp-3">
                            {stockArticle.title}
                          </h4>
                          <p className="text-[9px] text-[#7e7576] font-mono font-bold mt-2 uppercase">
                            {t(stockArticle.category)} • {formatArticleDate(stockArticle.publishedAt, currentLanguage)}
                          </p>
                        </article>
                      )}

                      {/* FMCG Retail Supermarket */}
                      {supermarketArticle && (
                        <article 
                          onClick={() => onSelectArticle(supermarketArticle)}
                          className="group cursor-pointer flex flex-col border-2 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                        >
                          <div className="aspect-video bg-zinc-100 overflow-hidden mb-3 border border-black/10">
                            <img 
                              alt="Retail corridor" 
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                              src={supermarketArticle.image}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h4 className="font-sans font-bold text-sm text-black group-hover:text-[#b81300] leading-snug line-clamp-3">
                            {supermarketArticle.title}
                          </h4>
                          <p className="text-[9px] text-[#7e7576] font-mono font-bold mt-2 uppercase">
                            {t(supermarketArticle.category)} • {formatArticleDate(supermarketArticle.publishedAt, currentLanguage)}
                          </p>
                        </article>
                      )}
                    </div>

                    {/* In-feed Ad Banner */}
                    <div className="w-full my-4 flex flex-col items-center justify-center border-2 border-black bg-[#e2e2e2] h-[95px] relative text-center px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="absolute top-1 left-2 font-bold text-[8px] uppercase tracking-widest text-[#7e7576]">{t('sponsored_cooperative')}</span>
                      <p className="text-[#b81300] font-bold text-xs uppercase tracking-widest">
                        {t('solar_grid_title')}
                      </p>
                      <p className="text-[10px] text-zinc-900 mt-1 font-serif">
                        {t('solar_grid_desc')}
                      </p>
                      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-[#7e7576] font-bold">{t('native_sponsor')}</span>
                    </div>

                    {/* Horizontal Solar Article or extra */}
                    {solarArticle && (
                      <article 
                        onClick={() => onSelectArticle(solarArticle)}
                        className="group cursor-pointer flex flex-col sm:flex-row gap-4 mt-4 border-t border-black/10 pt-4"
                      >
                        <div className="w-full sm:w-1/3 aspect-[4/3] bg-zinc-100 overflow-hidden flex-shrink-0 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <img 
                            alt="Solar energy arrays" 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                            src={solarArticle.image}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col justify-center font-sans">
                          <span className="font-bold text-[9px] tracking-widest text-[#b81300] uppercase mb-1">
                            {t(solarArticle.category)}
                          </span>
                          <h4 className="text-base font-black uppercase tracking-tight text-black group-hover:text-[#b81300] leading-tight mb-2 line-clamp-2">
                            {solarArticle.title}
                          </h4>
                          <p className="text-xs font-serif text-[#4c4546] line-clamp-2 leading-relaxed">
                            {solarArticle.subtitle}
                          </p>
                        </div>
                      </article>
                    )}
                  </>
                )}
              </div>
              )}

              {/* Column 3: Sidebar Feed (3 cols) */}
              {!(showAllReports || selectedCategory !== 'Home' || searchQuery) && (
                <div className="lg:col-span-3 flex flex-col lg:border-l lg:border-black/20 lg:pl-6">
                
                {/* Visual Square Ad */}
                <div className="w-full aspect-square mb-6 flex flex-col items-center justify-center border-2 border-black bg-[#e2e2e2] relative text-center p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="absolute top-1 left-2 font-bold text-[8px] uppercase tracking-widest text-[#7e7576]">{t('sponsored_platform')}</span>
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-sm mb-2 rounded-full">
                    LL
                  </div>
                  <p className="text-xs font-black uppercase text-black">Lankan Ledger Daily</p>
                  <p className="text-[11px] text-[#4c4546] font-serif mt-1.5 leading-tight">
                    {t('trusted_journalism')}
                  </p>
                  <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#b81300] border-b-2 border-black hover:opacity-80 cursor-pointer">
                    {t('buy_premium_access')}
                  </button>
                  <span className="absolute bottom-1 right-2 text-[8px] font-mono text-[#7e7576] font-bold">MPU 300 x 250</span>
                </div>

                {/* Most Read Interactive Section */}
                <div className="bg-white p-5 border-2 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-[12px] font-black uppercase tracking-wider text-black mb-4 border-b border-black pb-2">
                    {t('most_read_in_colombo')}
                  </h3>
                  <ol className="list-decimal list-inside space-y-3 font-serif animate-fadeIn">
                    {mostReadArticles.map((art) => (
                      <li 
                        key={art.id}
                        onClick={() => onSelectArticle(art)}
                        className="border-b border-black/10 pb-2 last:border-0 cursor-pointer hover:text-[#b81300] transition-colors"
                      >
                        <span className="text-xs font-bold pl-1 font-sans leading-snug">
                          {art.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Multimedia Widget with fully integrated visual overlay */}
                <div className="border-t-2 border-black pt-3">
                  <h3 className="text-[12px] font-black uppercase tracking-wider text-black mb-3 flex items-center gap-1.5">
                    <span className="text-[#b81300] font-black">●</span> {t('multimedia_report')}
                  </h3>
                  
                  <div className="relative w-full aspect-video bg-black border-2 border-black overflow-hidden group cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      alt="Press Conference microphones" 
                      className="object-cover w-full h-full opacity-70 group-hover:opacity-90 transition-opacity" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi4Bv3Xews485T2LrNLMtzGlnLBwpDjTaTTS0rzS2gh_FEbc8xYtZpBO3JgkRtf373fwGTNWF8hDZ4ufpSS2sULgcm02YjRy6sX70TWufgGxdt85HstUTYchJfpBD-X6diAo4I8bia0zkJEmtggk5njzHDkpzkpVPXsScG0ClLqFQ10rDoCz6IP855jmcVyrzgbrPGlUVRYBVBGRkXqPhMa_FAqfUkxGXluRZJxhXgOHBfvF9lo-pyiPP8XIZC_M6SjU694klWoxE"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div 
                      onClick={() => setShowVideoPlayer(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors"
                    >
                      <span className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={20} className="ml-1 text-[#b81300]" />
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black via-black/90 to-transparent text-left">
                      <h4 className="text-white font-sans font-bold text-[11px] leading-tight">
                        Watch: Finance Minister outlines tax adjustment amendments and budget thresholds.
                      </h4>
                    </div>
                  </div>
                </div>

              </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Embedded Video Player Simulator */}
      {showVideoPlayer && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-black border-2 border-white w-full max-w-2xl text-white overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <button 
              onClick={() => setShowVideoPlayer(false)}
              className="absolute top-2 right-2 text-zinc-400 hover:text-white p-2 z-10 bg-black/60 rounded-full"
              title="Close Player"
            >
              <X size={16} />
            </button>
            <div className="p-4 bg-zinc-900 border-b-2 border-black flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#b81300]">{t('live_press_briefing')}</h3>
              <span className="text-[10px] bg-[#b81300] px-2 py-0.5 tracking-widest uppercase font-bold animate-pulse">{t('livestream')}</span>
            </div>
            
            {/* Simulation Canvas */}
            <div className="aspect-video bg-zinc-950 flex flex-col items-center justify-center p-12 relative border-b-2 border-black">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
              <p className="text-xs text-zinc-400 text-center font-serif">{t('loading_conference_rec')}</p>
              <p className="text-[11px] text-zinc-600 mt-1 font-mono">{t('audio_feed_notice')}</p>
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/80 p-2 rounded-xs border border-zinc-800 text-[10px]">
                <span className="bg-green-600 w-2 h-2 rounded-full inline-block animate-ping"></span>
                <span>{t('speaker_title')}</span>
                <span className="text-zinc-500 font-bold font-mono">1080p HD</span>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-900 text-xs flex justify-between">
              <button 
                onClick={() => setShowVideoPlayer(false)}
                className="bg-white text-black font-bold uppercase tracking-widest px-4 py-2 text-[10px] cursor-pointer"
              >
                {t('exit_broadcast')}
              </button>
              <span className="text-zinc-400 font-serif italic flex items-center">{t('broadcast_copyright')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-white border-t-4 border-black mt-20">
        <div className="w-full max-w-[1280px] mx-auto py-12 px-4 md:px-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-2 border-black pb-6">
            <div className="font-black text-2xl text-black uppercase tracking-tighter mb-4 md:mb-0">
              LANKAN LEDGER
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
              <a className="hover:text-black hover:underline decoration-[#b81300] transition-colors" href="#">{t('about_us')}</a>
              <a className="hover:text-black hover:underline decoration-[#b81300] transition-colors" href="#">{t('editorial_code')}</a>
              <a className="hover:text-black hover:underline decoration-[#b81300] transition-colors" href="#">{t('advertising')}</a>
              <a className="hover:text-black hover:underline decoration-[#b81300] transition-colors" href="#">{t('contact_desk')}</a>
              <a className="hover:text-black hover:underline decoration-[#b81300] transition-colors" href="#">{t('privacy_policy')}</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-zinc-500 text-[11px] font-mono gap-4">
            <p className="text-center md:text-left">
              {t('registered_colombo')}
            </p>
            <div className="flex space-x-4">
              <span className="hover:text-black transition-colors cursor-pointer" title="International Grid">
                <Globe size={16} />
              </span>
              <span className="hover:text-black transition-colors cursor-pointer" title="Direct Email">
                <Mail size={16} />
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification for Social Interactions */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black text-white border-2 border-[#b81300] px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 text-xs font-bold uppercase tracking-wider animate-bounce select-none rounded-none">
          🔥 {toastMsg}
        </div>
      )}
    </div>
  );
}
