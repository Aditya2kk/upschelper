import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Newspaper,
  GraduationCap,
  FileText,
  Search,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Globe,
  Shield,
  Cpu,
  CheckCircle2,
  Calendar,
  Zap,
  BookOpen,
  Building2,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ALL_NEWS_ITEMS, NewsItem, getAllNews } from '../services/newsData';
import { fetchRealtimeBreakingNews } from '../services/realtimeNewsService';

export const HomeDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchPrompt, setSearchPrompt] = useState('');
  const [newsList, setNewsList] = useState<NewsItem[]>(getAllNews());
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);

  React.useEffect(() => {
    fetchRealtimeBreakingNews().then((items) => setNewsList(items));
    
    // Auto-refresh when tab gains focus
    const onFocus = () => {
      fetchRealtimeBreakingNews(true).then((items) => setNewsList(items));
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Lock scroll when reading article
  React.useEffect(() => {
    if (readingArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [readingArticle]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      navigate(`/ai/research?q=${encodeURIComponent(searchPrompt.trim())}`);
    }
  };

  const sampleNews = newsList.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Hero Welcome & AI Prompt Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI-Powered Aspirant Assistant</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Good afternoon, <span className="gradient-text">{user?.name || 'Aspirant'}</span>
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Here is your curated daily UPSC intelligence briefing for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
            </div>
          </div>

          {/* Center Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder='Ask anything: "Summarize India-China border disengagement in GS-II format"'
                value={searchPrompt}
                onChange={(e) => setSearchPrompt(e.target.value)}
                className="w-full pl-5 pr-32 py-4 rounded-2xl bg-slate-950/80 border border-indigo-500/40 text-white placeholder-slate-500 text-sm md:text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 shadow-xl backdrop-blur-xl"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
              >
                <span>Ask AI</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Quick Access Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/newspapers')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer border border-slate-800 flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">Newspapers</h3>
            <p className="text-xs text-slate-400 mt-1">Official PDFs & e-papers</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/upsc')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer border border-slate-800 flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">UPSC Hub</h3>
            <p className="text-xs text-slate-400 mt-1">Prelims & Mains briefs</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/ai/research')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer border border-slate-800 flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">AI Research</h3>
            <p className="text-xs text-slate-400 mt-1">Hybrid RAG Q&A</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/documents')}
          className="glass-panel p-5 rounded-2xl glass-panel-hover cursor-pointer border border-slate-800 flex flex-col justify-between group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-base">My Documents</h3>
            <p className="text-xs text-slate-400 mt-1">Upload & analyze PDFs</p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Today's News + Daily Brief Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Top News */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Today's Important UPSC News</h2>
            </div>
            <button
              onClick={() => navigate('/news')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {sampleNews.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.gsPaper}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{item.source} • {item.date}</span>
                  </div>
                  {item.importance === 'HIGH' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      HIGH RELEVANCE
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-100 text-base leading-snug hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => setReadingArticle(item)}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <button
                    onClick={() => setReadingArticle(item)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Read Full Analysis</span>
                  </button>

                  <button
                    onClick={() => navigate(`/ai/research?q=${encodeURIComponent(item.title)}`)}
                    className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>AI Prep</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Daily Brief & Practice Widget */}
        <div className="space-y-6">
          {/* Daily Brief Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Daily UPSC Brief</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                10 TOP HEADLINES
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-synthesized current affairs briefing covering Polity, Economy, Environment, and Defence.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Indo-Pacific Maritime Exercise:</span> 14 Navies participate in QUAD-led drills off Visakhapatnam.
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">RBI MPC Minutes:</span> Core Inflation stabilizes at 3.8%; Repo rate unchanged.
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/news')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>View All Live News</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick AI Question Generator Spotlight */}
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Zap className="w-4 h-4" />
              <h3 className="font-bold text-white text-sm">Practice MCQs & Mains</h3>
            </div>

            <p className="text-xs text-slate-300">
              Generate instant Prelims MCQs or Mains Answer structures from today's headlines.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/ai/research?q=Generate%205%20Prelims%20MCQs%20from%20today%27s%20news')}
                className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold text-center transition-colors"
              >
                Prelims Quiz
              </button>
              <button
                onClick={() => navigate('/ai/research?q=Give%20me%20today%27s%20Mains%20question%20and%20model%20answer')}
                className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold text-center transition-colors"
              >
                Mains Answers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── FULL ARTICLE READER MODAL ───────────────────────── */}
      {readingArticle && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
          <div className="absolute inset-0 bg-transparent cursor-pointer" onClick={() => setReadingArticle(null)} />

          <div
            style={{ backgroundColor: '#0b0f19' }}
            className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-3xl border border-indigo-500/50 shadow-2xl shadow-black ring-1 ring-white/10 flex flex-col overflow-hidden bg-slate-950 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {readingArticle.gsPaper}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {readingArticle.source} • {readingArticle.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/ai/research?q=${encodeURIComponent(readingArticle.title)}`)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Research</span>
                </button>
                <button
                  onClick={() => setReadingArticle(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                  title="Close Reader"
                >
                  <span className="text-base font-bold leading-none">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-200 flex-1">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {readingArticle.title}
                </h1>
                {readingArticle.syllabusTheme && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-300">Syllabus Mapping:</span>{' '}
                      {readingArticle.syllabusTheme}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-300 font-normal">
                {(readingArticle.fullArticle || readingArticle.summary || readingArticle.title)
                  .split('\n\n')
                  .map((block: string, blockIdx: number) => {
                    const lines = block.split('\n').map((l: string) => l.trim()).filter(Boolean);
                    return (
                      <div key={blockIdx} className="space-y-2">
                        {lines.map((line: string, lIdx: number) => {
                          if (line.startsWith('### ')) {
                            return (
                              <h3
                                key={lIdx}
                                className="text-base font-bold text-indigo-300 tracking-wide pt-3 pb-1 border-b border-indigo-500/20 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                                <span>{line.replace('### ', '')}</span>
                              </h3>
                            );
                          }
                          if (/^\d+\.\s+/.test(line)) {
                            const match = line.match(/^(\d+\.\s+)(.*)/);
                            const num = match ? match[1] : '';
                            const content = match ? match[2] : line;
                            const parts = content.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <div key={lIdx} className="pl-3 my-1.5 flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
                                <span className="text-indigo-400 font-bold shrink-0">{num}</span>
                                <div>
                                  {parts.map((p: string, pIdx: number) =>
                                    p.startsWith('**') && p.endsWith('**') ? (
                                      <strong key={pIdx} className="font-bold text-white">
                                        {p.slice(2, -2)}
                                      </strong>
                                    ) : (
                                      p
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            const raw = line.replace(/^[-*]\s+/, '');
                            const parts = raw.split(/(\*\*[^*]+\*\*)/g);
                            return (
                              <div key={lIdx} className="pl-3 my-1.5 flex items-start gap-2 text-slate-300 text-sm leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2" />
                                <div>
                                  {parts.map((p: string, pIdx: number) =>
                                    p.startsWith('**') && p.endsWith('**') ? (
                                      <strong key={pIdx} className="font-bold text-white">
                                        {p.slice(2, -2)}
                                      </strong>
                                    ) : (
                                      p
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                          const parts = line.split(/(\*\*[^*]+\*\*)/g);
                          return (
                            <p key={lIdx} className="text-slate-300 leading-relaxed text-sm">
                              {parts.map((p: string, pIdx: number) =>
                                p.startsWith('**') && p.endsWith('**') ? (
                                  <strong key={pIdx} className="font-bold text-white">
                                    {p.slice(2, -2)}
                                  </strong>
                                ) : (
                                  p
                                )
                              )}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })}
              </div>

              {Array.isArray(readingArticle.prelimsPoints) && readingArticle.prelimsPoints.length > 0 && (
                <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Prelims Key Facts & Pointers</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {readingArticle.prelimsPoints.map((point: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(readingArticle.mainsPoints) && readingArticle.mainsPoints.length > 0 && (
                <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-extrabold uppercase tracking-wider">
                    <Building2 className="w-4 h-4" />
                    <span>Mains Analytical Dimensions & Perspectives</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {readingArticle.mainsPoints.map((point: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {readingArticle.mainsQuestion && (
                <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-950/30 to-slate-900 border border-purple-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-extrabold uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>UPSC Model Mains Question for Practice</span>
                  </div>
                  <p className="text-xs font-semibold text-purple-200 italic leading-relaxed">
                    "{readingArticle.mainsQuestion}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
