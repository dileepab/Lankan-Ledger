import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { subscribeToArticleComments, addCommentToFirestore } from '../../firebase';
import { MessageSquare, ThumbsUp, Send, User, RefreshCw } from 'lucide-react';

interface CMSCommentsProps {
  articles: Article[];
  onNotify: (msg: string) => void;
  bylineName: string;
  pressRole: string;
}

export default function CMSComments({ articles, onNotify, bylineName, pressRole }: CMSCommentsProps) {
  const [selectedArtId, setSelectedArtId] = useState<string>(articles[0]?.id || '');
  const [commentsList, setCommentsList] = useState<Array<{ name: string; text: string; date: string }>>([]);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize real-time snapshot comments for selectedArticleId
  useEffect(() => {
    if (!selectedArtId) return;

    setIsLoading(true);
    const unsubscribe = subscribeToArticleComments(selectedArtId, (loaded) => {
      setIsLoading(false);
      setCommentsList(loaded || []);
    });

    return () => unsubscribe();
  }, [selectedArtId]);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedArtId) return;

    setIsSubmitting(true);
    const displayName = bylineName.trim() || 'Desk Staff Correspondent';
    const roleString = `${displayName} (${pressRole})`;

    const newComment = {
      name: roleString,
      text: replyText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
    };

    try {
      await addCommentToFirestore(selectedArtId, newComment);
      setReplyText('');
      setIsSubmitting(false);
      onNotify('Official editorial comment reply posted back to live reader view!');
    } catch (err) {
      console.error("Failed to post comment:", err);
      setIsSubmitting(false);
      alert("Error submitting comment reply. Check Firestore database rule permissions.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Moderation Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/10 pb-4 gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
            <MessageSquare size={16} className="text-[#b81300]" />
            <span>Reader Comments & Feedback Audit</span>
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">
            Read, audit, and append staff byline responses to public feedback.
          </p>
        </div>

        {/* Dropdown to select Article */}
        <div className="w-full sm:w-auto">
          <label htmlFor="article-select-comments" className="text-[8px] font-bold uppercase text-zinc-400 mb-1.5 block">Audit report feedback stream</label>
          <select
            id="article-select-comments"
            value={selectedArtId}
            onChange={(e) => setSelectedArtId(e.target.value)}
            className="w-full sm:w-80 border-2 border-black bg-white p-2 text-xs font-bold uppercase outline-none focus:ring-0 cursor-pointer text-zinc-800"
          >
            {articles.map((art) => (
              <option key={art.id} value={art.id}>
                {art.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Comment stream */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#1a1c1c]">
                Live feedback stream ({commentsList.length})
              </h4>
              {isLoading && <RefreshCw size={12} className="animate-spin text-zinc-400" />}
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              {commentsList.map((comm, idx) => {
                const isEditorial = comm.name.includes('(') || comm.name.toLowerCase().includes('ledger') || comm.name.toLowerCase().includes('editor') || comm.name.toLowerCase().includes('journalist');
                return (
                  <div 
                    key={idx} 
                    className={`p-4 border ${
                      isEditorial 
                        ? 'border-l-4 border-l-[#b81300] border-zinc-300 bg-red-50/[0.1]' 
                        : 'border-zinc-200 bg-[#fefefe]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase">
                      <span className={`flex items-center gap-1.5 ${isEditorial ? 'text-[#b81300] font-black' : 'text-zinc-700'}`}>
                        <User size={10} />
                        {comm.name}
                        {isEditorial && (
                          <span className="text-[7px] bg-[#b81300]/10 border border-[#b81300]/20 text-[#b81300] px-1 py-px rounded font-mono">
                            STAFF BYLINE
                          </span>
                        )}
                      </span>
                      <span className="text-zinc-400 font-mono-data text-[8px]">{comm.date}</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-serif mt-2 leading-relaxed">
                      {comm.text}
                    </p>
                  </div>
                );
              })}

              {commentsList.length === 0 && (
                <div className="p-12 text-center text-zinc-400 font-serif italic text-sm">
                  No public comments recorded under this ledger indexing.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Write official Staff response */}
        <div className="lg:col-span-4">
          <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-2 mb-4 flex items-center gap-1.5">
              <span>Respond as Staff</span>
            </h4>
            <p className="text-[10px] text-zinc-500 mb-4 font-serif leading-relaxed">
              Submit an verified staff representative response directly to the live reader catalog.
            </p>

            <form onSubmit={handlePostReply} className="space-y-4">
              <div>
                <label className="block text-[8px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  RESPONDING BYLINE
                </label>
                <div className="p-2 border border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-600 truncate">
                  {bylineName || 'Desk Representative'}
                </div>
              </div>

              <div>
                <label htmlFor="reply_byline_role_box" className="block text-[8px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  DESIGNATED ROLE
                </label>
                <div id="reply_byline_role_box" className="p-2 border border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-600 truncate">
                  {pressRole}
                </div>
              </div>

              <div>
                <label htmlFor="staff-reply-text" className="block text-[8px] font-mono font-bold uppercase text-zinc-400 mb-1">
                  REPLY TEXT
                </label>
                <textarea
                  id="staff-reply-text"
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full text-xs font-serif leading-relaxed p-2.5 border border-black bg-[#fbfbfb] focus:ring-1 focus:ring-black outline-none resize-none"
                  placeholder="Draft official statement response..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#b81300] text-white p-2.5 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send size={10} />
                <span>{isSubmitting ? 'STREAMING REPLY...' : 'SEND LIVE RESPONSE'}</span>
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}

// Sync trigger: accounts aligned to enable direct sync to AI Studio.

