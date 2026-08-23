import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const HomeDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchPrompt, setSearchPrompt] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPrompt.trim()) {
      navigate(`/ai/research?q=${encodeURIComponent(searchPrompt.trim())}`);
    }
  };

  const sampleNews = [
    {
      id: '1',
      title: 'India-China Bilateral Dialogue on Border Disengagement Advances in Eastern Ladakh',
      source: 'The Hindu',
      date: '23 Aug 2026',
      category: 'GEOPOLITICS',
      importance: 'HIGH',
      gsPaper: 'GS-II',
      summary: 'Special Representatives met to review diplomatic and military channels for complete disengagement along LAC.',
    },
    {
      id: '2',
      title: 'India Semiconductor Mission Approves Phase-II Fabrication Plants in Gujarat & Tamil Nadu',
      source: 'Indian Express',
      date: '23 Aug 2026',
      category: 'SCIENCE_TECH',
      importance: 'HIGH',
      gsPaper: 'GS-III',
      summary: 'Union Cabinet approves ₹45,000 Cr outlay for sub-10nm chip manufacturing and R&D ecosystem.',
    },
    {
      id: '3',
      title: 'Supreme Court Standardizes Guidelines on Preventive Detention under Article 22',
      source: 'Press Information Bureau',
      date: '23 Aug 2026',
      category: 'POLITY',
      importance: 'HIGH',
      gsPaper: 'GS-II',
      summary: 'Constitution Bench mandates strict adherence to procedural safeguards and 90-day review limits.',
    },
    {
      id: '4',
      title: 'RBI Monetary Policy Committee Keeps Repo Rate Unchanged at 6.5% Amid Softening Inflation',
      source: 'The Hindu',
      date: '23 Aug 2026',
      category: 'ECONOMY',
      importance: 'HIGH',
      gsPaper: 'GS-III',
      summary: 'Core CPI inflation stabilized at 3.8% in July. MPC maintains accommodative stance to support growth recovery.',
    },
    {
      id: '5',
      title: 'QUAD Summit 2026: Leaders Announce Indo-Pacific Maritime Domain Awareness Initiative',
      source: 'Indian Express',
      date: '23 Aug 2026',
      category: 'IR',
      importance: 'HIGH',
      gsPaper: 'GS-II',
      summary: 'PM Modi, Presidents Biden, Albanese, and PM Kishida unveil shared satellite-based surveillance for maritime security.',
    },
    {
      id: '6',
      title: 'Western Ghats Receives UNESCO World Heritage Extension for 39 New Serial Sites',
      source: 'The Hindu',
      date: '22 Aug 2026',
      category: 'ENVIRONMENT',
      importance: 'HIGH',
      gsPaper: 'GS-I',
      summary: 'UNESCO expands Western Ghats heritage designation covering biodiversity hotspots across Kerala, Karnataka and Tamil Nadu.',
    },
    {
      id: '7',
      title: 'ISRO Successfully Tests Reusable Launch Vehicle RLV-TD X3 from Sriharikota',
      source: 'Press Information Bureau',
      date: '22 Aug 2026',
      category: 'SCIENCE_TECH',
      importance: 'HIGH',
      gsPaper: 'GS-III',
      summary: 'Third test demonstrated 98.7% trajectory accuracy. India becomes the 4th country to achieve powered autonomous landing.',
    },
    {
      id: '8',
      title: 'India Signs Free Trade Agreement with EU After 16 Years of Negotiations',
      source: 'Hindustan Times',
      date: '22 Aug 2026',
      category: 'ECONOMY',
      importance: 'HIGH',
      gsPaper: 'GS-III',
      summary: 'Comprehensive FTA covers goods, services, and investment. Tariff elimination on 90% of goods over 10 years.',
    },
  ];

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

                <h3 className="font-bold text-slate-100 text-base leading-snug hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => navigate(`/news/${item.id}`)}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.summary}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                  <button
                    onClick={() => navigate(`/ai/analysis/${item.id}`)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>UPSC AI Analysis</span>
                  </button>

                  <button className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save</span>
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
              onClick={() => navigate('/upsc/daily-brief')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>Read Full Daily Brief</span>
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
              Generate 10 instant Prelims MCQs or Mains Answer structures from today's headlines.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/upsc/prelims')}
                className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold text-center transition-colors"
              >
                Prelims Quiz
              </button>
              <button
                onClick={() => navigate('/upsc/mains')}
                className="py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold text-center transition-colors"
              >
                Mains Answers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
