import React from 'react';
import { Bookmark, Trash2, ExternalLink, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SavedArticles: React.FC = () => {
  const navigate = useNavigate();

  const savedList = [
    {
      id: '1',
      title: 'India-China Bilateral Dialogue on Border Disengagement Advances in Eastern Ladakh',
      sourceName: 'The Hindu',
      savedAt: '23 Aug 2026',
      gsPaper: 'GS-II',
      category: 'GEOPOLITICS',
    },
    {
      id: '2',
      title: 'India Semiconductor Mission Approves Phase-II Fabrication Plants',
      sourceName: 'Indian Express',
      savedAt: '23 Aug 2026',
      gsPaper: 'GS-III',
      category: 'SCIENCE_TECH',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
          <Bookmark className="w-3.5 h-3.5" />
          <span>Personal Library</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Saved Articles & Notes</h1>
        <p className="text-sm text-slate-400 mt-1">Review your bookmarked articles and AI summaries for revision.</p>
      </div>

      <div className="space-y-4">
        {savedList.map((item) => (
          <div key={item.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                  {item.gsPaper}
                </span>
                <span className="text-xs text-slate-400">{item.sourceName} • Saved on {item.savedAt}</span>
              </div>
              <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/ai/analysis/${item.id}`)}
                className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                title="View AI Analysis"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
