import React, { useState, useEffect } from 'react';
import { Article, ViewMode } from './types';
import { INITIAL_ARTICLES } from './data';
import BreakingNewsTicker from './components/BreakingNewsTicker';
import ReaderView from './components/ReaderView';
import PortalCMSView from './components/PortalCMSView';
import ArticleModal from './components/ArticleModal';
import CMSAuthModal from './components/CMSAuthModal';
import { BookOpen, SlidersHorizontal, ChevronUp } from 'lucide-react';
import { 
  seedArticlesIfEmpty, 
  subscribeToArticles, 
  saveArticleToFirestore, 
  deleteArticleFromFirestore 
} from './firebase';

export default function App() {
  // Articles state now synchronized in real-time with Firebase Firestore Cloud Database
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);

  // Authorization / credential gateway state
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('lankan_ledger_authorized') === 'true';
  });
  const [authorRole, setAuthorRole] = useState<string>(() => {
    return localStorage.getItem('lankan_ledger_role') || 'Senior Journalist';
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Current view toggle mode ('public' or 'cms' admin)
  const [viewMode, setViewMode] = useState<ViewMode>('public');

  // Selected article for detailed reading modal
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Article target intended for loading into CMS edit state
  const [targetArticleId, setTargetArticleId] = useState<string | null>(null);

  // International ticker language configuration
  const [currentLanguage, setCurrentLanguage] = useState<'EN' | 'SI' | 'TA'>('EN');

  // Trigger scroll-to-top button visibility
  const [isScrolled, setIsScrolled] = useState(false);

  // Synchronized Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('lankan_ledger_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('lankan_ledger_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // Seed database if empty and connect real-time snapshot listener on boot
  useEffect(() => {
    const initFirebaseData = async () => {
      try {
        await seedArticlesIfEmpty();
      } catch (err) {
        console.error("Failed to seed articles:", err);
      }
    };
    initFirebaseData();

    // Subscribe to news feeds
    const unsubscribe = subscribeToArticles((data) => {
      // Sort articles: newly created ones (Timestamp ID >= 1000) come first, descending.
      // Seeded default ones (id 1 to 8) are placed next, in ascending order.
      const sorted = [...data].sort((a, b) => {
        const numA = parseInt(a.id.replace('art-', '')) || 0;
        const numB = parseInt(b.id.replace('art-', '')) || 0;
        
        const isNewA = numA > 1000;
        const isNewB = numB > 1000;
        
        if (isNewA && isNewB) {
          // Both are new articles. Sort descending (newest timestamp first)
          return numB - numA;
        }
        if (isNewA) return -1; // New article A comes before seeded B
        if (isNewB) return 1;  // New article B comes before seeded A
        
        // Both are default seeded articles. Keep their original order (ascending by ID)
        return numA - numB;
      });
      setArticles(sorted);
    });

    return () => unsubscribe();
  }, []);

  // Handle window scroll behavior for back-to-top feature
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save/Update article callback in CMS with true server-side Firestore persistence
  const handleSaveArticle = async (updated: Article) => {
    try {
      await saveArticleToFirestore(updated);
    } catch (err) {
      console.error("Failed to persist article edits to cloud:", err);
    }
  };

  // Delete article callback in CMS with true server-side Firestore persistence
  const handleDeleteArticle = async (id: string) => {
    try {
      await deleteArticleFromFirestore(id);
    } catch (err) {
      console.error("Failed to delete article from cloud:", err);
    }
  };

  // Intercept route mode change to prompt passcode verification for CMS Journalist portal
  const handleSwitchView = (mode: ViewMode) => {
    if (mode === 'cms') {
      setTargetArticleId(null); // Reset when navigating manually
      if (!isAuthorized) {
        setShowAuthModal(true);
      } else {
        setViewMode('cms');
      }
    } else {
      setViewMode('public');
    }
  };

  // Direct switch logic to edit a specific article inside CMS
  const handleEditInCMS = (id: string) => {
    setSelectedArticle(null); // Close detailed reader modal
    setTargetArticleId(id);   // Set the target article to load
    if (!isAuthorized) {
      setShowAuthModal(true);
    } else {
      setViewMode('cms'); // Switch view mode to CMS admin
    }
  };

  // Disconnect the authenticated session/role
  const handleLogout = () => {
    localStorage.removeItem('lankan_ledger_authorized');
    localStorage.removeItem('lankan_ledger_role');
    setIsAuthorized(false);
    setViewMode('public');
  };

  const handleAuthSuccess = (role: string) => {
    setIsAuthorized(true);
    setAuthorRole(role);
    setShowAuthModal(false);
    setViewMode('cms');
  };

  // Handle article selection and increment view count in Firestore for true user-centric analytics
  const handleSelectArticle = async (art: Article) => {
    setSelectedArticle(art);
    try {
      const updated = {
        ...art,
        views: (art.views || 0) + 1
      };
      await saveArticleToFirestore(updated);
    } catch (err) {
      console.error("Failed to automatically increment article views in Firestore:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col relative font-sans">
      
      {/* Top App Bar Breaking News ticker active globally */}
      <BreakingNewsTicker 
        currentLanguage={currentLanguage}
        onLanguageChange={(lang) => setCurrentLanguage(lang)}
      />

      {/* Floating Mode Toggle bar for continuous view state switching */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center bg-black text-white p-1 shadow-2xl border border-zinc-800">
        <button
          onClick={() => handleSwitchView('public')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
            viewMode === 'public' 
              ? 'bg-[#b81300] text-white font-bold' 
              : 'hover:bg-zinc-900 text-zinc-400'
          }`}
          title="Switch to public reader layout view"
          id="mode-toggle-reader"
        >
          <BookOpen size={12} /> Reader Mode
        </button>
        <button
          onClick={() => handleSwitchView('cms')}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
            viewMode === 'cms' 
              ? 'bg-[#b81300] text-white font-bold' 
              : 'hover:bg-zinc-900 text-zinc-400'
          }`}
          title="Switch to journalist CMS panel view"
          id="mode-toggle-cms"
        >
          <SlidersHorizontal size={12} /> CMS Journalist
        </button>
      </div>

      {/* Main View switching based on state */}
      <div className="flex-1">
        {viewMode === 'public' ? (
          <ReaderView 
            articles={articles}
            onSelectArticle={handleSelectArticle}
            onSwitchView={(mode) => handleSwitchView(mode)}
            currentLanguage={currentLanguage}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        ) : (
          <PortalCMSView 
            articles={articles}
            onSaveArticle={handleSaveArticle}
            onDeleteArticle={handleDeleteArticle}
            onSwitchView={(mode) => handleSwitchView(mode)}
            onLogout={handleLogout}
            authorRole={authorRole}
            initialArticleId={targetArticleId}
          />
        )}
      </div>

      {/* Detailed Full News Modal Popup */}
      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onEditInCMS={handleEditInCMS}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Journalist Passcode Credentials Auth Verification Gate Modal */}
      {showAuthModal && (
        <CMSAuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Dynamic Back to Top interactive indicator */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-50 p-3 bg-black hover:bg-[#b81300] text-white border border-zinc-800 shadow-2xl transition-all duration-300 transform cursor-pointer ${
          isScrolled ? 'translate-y-0 opacity-100 visible' : 'translate-y-6 opacity-0 invisible'
        }`}
        title="Scroll back to top of the report"
      >
        <ChevronUp size={16} />
      </button>

    </div>
  );
}
