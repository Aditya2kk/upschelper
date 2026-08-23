import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Sparkles, Bookmark, ArrowRight, Filter, Search,
  Globe, Shield, Cpu, TrendingUp, Leaf, Scale, Building2,
  Landmark, Users, Wheat, Heart, Clock, ChevronDown, BookOpen
} from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'POLITY': <Landmark className="w-3.5 h-3.5" />,
  'ECONOMY': <TrendingUp className="w-3.5 h-3.5" />,
  'ENVIRONMENT': <Leaf className="w-3.5 h-3.5" />,
  'SCIENCE_TECH': <Cpu className="w-3.5 h-3.5" />,
  'DEFENCE': <Shield className="w-3.5 h-3.5" />,
  'GEOPOLITICS': <Globe className="w-3.5 h-3.5" />,
  'IR': <Globe className="w-3.5 h-3.5" />,
  'GOVERNANCE': <Building2 className="w-3.5 h-3.5" />,
  'SOCIETY': <Users className="w-3.5 h-3.5" />,
  'AGRICULTURE': <Wheat className="w-3.5 h-3.5" />,
  'ETHICS': <Heart className="w-3.5 h-3.5" />,
  'HISTORY': <BookOpen className="w-3.5 h-3.5" />,
  'CURRENT_AFFAIRS': <Flame className="w-3.5 h-3.5" />,
};

const categoryColors: Record<string, string> = {
  'POLITY': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'ECONOMY': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'ENVIRONMENT': 'bg-green-500/15 text-green-400 border-green-500/30',
  'SCIENCE_TECH': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'DEFENCE': 'bg-red-500/15 text-red-400 border-red-500/30',
  'GEOPOLITICS': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'IR': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'GOVERNANCE': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  'SOCIETY': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  'AGRICULTURE': 'bg-lime-500/15 text-lime-400 border-lime-500/30',
  'ETHICS': 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'HISTORY': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'CURRENT_AFFAIRS': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  category: string;
  importance: 'HIGH' | 'NORMAL';
  gsPaper: string;
  summary: string;
  topics: string[];
}

const allNews: NewsItem[] = [
  {
    id: '1',
    title: 'India-China Bilateral Dialogue on Border Disengagement Advances in Eastern Ladakh',
    source: 'The Hindu',
    date: '23 Aug 2026',
    category: 'GEOPOLITICS',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'Special Representatives met to review diplomatic and military channels for complete disengagement along LAC. India insists on restoration of status quo ante at Depsang and Demchok.',
    topics: ['LAC', 'India-China Relations', 'National Security'],
  },
  {
    id: '2',
    title: 'India Semiconductor Mission Approves Phase-II Fabrication Plants in Gujarat & Tamil Nadu',
    source: 'Indian Express',
    date: '23 Aug 2026',
    category: 'SCIENCE_TECH',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'Union Cabinet approves ₹45,000 Cr outlay for sub-10nm chip manufacturing and R&D ecosystem. Three fabs to be operational by 2029.',
    topics: ['ISM', 'Make in India', 'Electronics Manufacturing'],
  },
  {
    id: '3',
    title: 'Supreme Court Standardizes Guidelines on Preventive Detention under Article 22',
    source: 'Press Information Bureau',
    date: '23 Aug 2026',
    category: 'POLITY',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'Constitution Bench mandates strict adherence to procedural safeguards and 90-day review limits. Personal liberty cannot be curtailed without compelling grounds.',
    topics: ['Article 22', 'Fundamental Rights', 'Judiciary'],
  },
  {
    id: '4',
    title: 'RBI Monetary Policy Committee Keeps Repo Rate Unchanged at 6.5% Amid Softening Inflation',
    source: 'The Hindu',
    date: '23 Aug 2026',
    category: 'ECONOMY',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'Core CPI inflation stabilized at 3.8% in July. MPC maintains accommodative stance to support growth recovery while keeping inflation within target band.',
    topics: ['RBI', 'Monetary Policy', 'Inflation', 'Interest Rates'],
  },
  {
    id: '5',
    title: 'QUAD Summit 2026: Leaders Announce Indo-Pacific Maritime Domain Awareness Initiative',
    source: 'Indian Express',
    date: '23 Aug 2026',
    category: 'IR',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'PM Modi, Presidents Biden, Albanese, and PM Kishida unveil shared satellite-based surveillance to monitor illegal fishing and maritime security threats.',
    topics: ['QUAD', 'Indo-Pacific', 'Maritime Security'],
  },
  {
    id: '6',
    title: 'National Education Policy 2020: States Report 85% Implementation of Mother-Tongue Instruction',
    source: 'Hindustan Times',
    date: '23 Aug 2026',
    category: 'GOVERNANCE',
    importance: 'NORMAL',
    gsPaper: 'GS-II',
    summary: 'Education Ministry data shows majority of states have adopted regional language instruction up to Grade 5 under NEP framework.',
    topics: ['NEP 2020', 'Education Reform', 'Multilingual Education'],
  },
  {
    id: '7',
    title: 'Western Ghats Receives UNESCO World Heritage Extension for 39 New Serial Sites',
    source: 'The Hindu',
    date: '22 Aug 2026',
    category: 'ENVIRONMENT',
    importance: 'HIGH',
    gsPaper: 'GS-I',
    summary: 'UNESCO expands Western Ghats heritage designation covering biodiversity hotspots across Kerala, Karnataka and Tamil Nadu. Kasturirangan Committee recommendations partly adopted.',
    topics: ['UNESCO', 'Western Ghats', 'Biodiversity', 'Kasturirangan Report'],
  },
  {
    id: '8',
    title: 'ISRO Successfully Tests Reusable Launch Vehicle RLV-TD X3 from Sriharikota',
    source: 'Press Information Bureau',
    date: '22 Aug 2026',
    category: 'SCIENCE_TECH',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'Third test of autonomous landing demonstrated 98.7% trajectory accuracy. India becomes the 4th country to achieve powered autonomous landing for orbital-class reusable rockets.',
    topics: ['ISRO', 'RLV', 'Space Technology', 'Indigenous Tech'],
  },
  {
    id: '9',
    title: 'Parliament Passes Digital Personal Data Protection (Amendment) Bill 2026',
    source: 'Indian Express',
    date: '22 Aug 2026',
    category: 'POLITY',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'Amendment introduces stricter cross-border data transfer norms, mandatory DPO appointment for companies handling >1 Cr data principals, and empowers Data Protection Board with appellate jurisdiction.',
    topics: ['DPDP Act', 'Data Privacy', 'Digital Rights', 'Legislation'],
  },
  {
    id: '10',
    title: 'PM-KISAN Scheme: Government Announces 18th Installment with ₹2,000 Enhanced Benefit',
    source: 'The Hindu',
    date: '22 Aug 2026',
    category: 'AGRICULTURE',
    importance: 'NORMAL',
    gsPaper: 'GS-III',
    summary: 'Enhanced annual income support of ₹8,000 per farmer family approved. Coverage expanded to include landless agricultural workers in 5 pilot states.',
    topics: ['PM-KISAN', 'Agricultural Subsidies', 'Rural Economy'],
  },
  {
    id: '11',
    title: 'India Signs Free Trade Agreement with EU After 16 Years of Negotiations',
    source: 'Hindustan Times',
    date: '22 Aug 2026',
    category: 'ECONOMY',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'Comprehensive FTA covers goods, services, and investment. Tariff elimination on 90% of goods over 10 years. Includes sustainability and labor chapters.',
    topics: ['India-EU FTA', 'International Trade', 'WTO'],
  },
  {
    id: '12',
    title: '16th Finance Commission Submits Interim Report on Fiscal Federalism Restructuring',
    source: 'The Hindu',
    date: '21 Aug 2026',
    category: 'POLITY',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'Recommends increasing states\' share in central tax pool to 44%. Proposes performance-linked grants for urban local bodies and district-level governance.',
    topics: ['Finance Commission', 'Fiscal Federalism', 'Tax Devolution'],
  },
  {
    id: '13',
    title: 'Chandrayaan-4 Sample Return Mission Approved by Union Cabinet',
    source: 'Press Information Bureau',
    date: '21 Aug 2026',
    category: 'SCIENCE_TECH',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'ISRO to attempt robotic lunar sample return from south polar region. Mission budget ₹6,500 Cr with expected launch in Q4 2028.',
    topics: ['Chandrayaan-4', 'ISRO', 'Lunar Exploration'],
  },
  {
    id: '14',
    title: 'India Achieves 200 GW Renewable Energy Installed Capacity Milestone',
    source: 'Indian Express',
    date: '21 Aug 2026',
    category: 'ENVIRONMENT',
    importance: 'NORMAL',
    gsPaper: 'GS-III',
    summary: 'Solar (120 GW) and wind (60 GW) lead the mix. MNRE targets 500 GW non-fossil capacity by 2030 under Paris Agreement commitments.',
    topics: ['Renewable Energy', 'Climate Change', 'Paris Agreement', 'Solar Energy'],
  },
  {
    id: '15',
    title: 'NITI Aayog Releases Multidimensional Poverty Index 2026: Poverty Reduced to 8.2%',
    source: 'The Hindu',
    date: '21 Aug 2026',
    category: 'SOCIETY',
    importance: 'NORMAL',
    gsPaper: 'GS-I',
    summary: 'MPI shows 13.5 Cr people exited multidimensional poverty since 2015. Bihar, UP, and MP show maximum improvement. Urban-rural gap narrows.',
    topics: ['MPI', 'Poverty Reduction', 'NITI Aayog', 'SDGs'],
  },
  {
    id: '16',
    title: 'INS Arighat: India Commissions Second Nuclear-Powered Ballistic Missile Submarine',
    source: 'Hindustan Times',
    date: '21 Aug 2026',
    category: 'DEFENCE',
    importance: 'HIGH',
    gsPaper: 'GS-III',
    summary: 'INS Arighat strengthens India\'s nuclear triad capability. Equipped with K-4 submarine-launched ballistic missiles with 3,500 km range.',
    topics: ['Nuclear Triad', 'Indian Navy', 'Strategic Defence'],
  },
  {
    id: '17',
    title: 'Election Commission Recommends Simultaneous Elections Framework to Law Ministry',
    source: 'The Hindu',
    date: '20 Aug 2026',
    category: 'POLITY',
    importance: 'NORMAL',
    gsPaper: 'GS-II',
    summary: 'Draft framework proposes phased implementation: Lok Sabha + State Assemblies synchronization by 2029. Requires constitutional amendments to Articles 83, 172, 356.',
    topics: ['One Nation One Election', 'Electoral Reform', 'Constitutional Amendment'],
  },
  {
    id: '18',
    title: 'India-Middle East-Europe Economic Corridor (IMEC): First Phase Construction Begins',
    source: 'Indian Express',
    date: '20 Aug 2026',
    category: 'IR',
    importance: 'HIGH',
    gsPaper: 'GS-II',
    summary: 'Port connectivity infrastructure between Mumbai and Haifa initiated. Rail and shipping route to reduce India-Europe goods transit time by 40%.',
    topics: ['IMEC', 'Connectivity', 'Infrastructure', 'Geopolitics'],
  },
  {
    id: '19',
    title: 'National Green Tribunal Orders Complete Ban on Single-Use Plastics Near River Floodplains',
    source: 'The Hindu',
    date: '20 Aug 2026',
    category: 'ENVIRONMENT',
    importance: 'NORMAL',
    gsPaper: 'GS-III',
    summary: 'NGT expands plastic-free zones to include all major river floodplains (Ganga, Yamuna, Narmada, Godavari). Local bodies given 6-month compliance deadline.',
    topics: ['NGT', 'Plastic Pollution', 'River Conservation'],
  },
  {
    id: '20',
    title: 'Cabinet Approves National Urban Digital Mission for Smart City 2.0 Infrastructure',
    source: 'Press Information Bureau',
    date: '20 Aug 2026',
    category: 'GOVERNANCE',
    importance: 'NORMAL',
    gsPaper: 'GS-II',
    summary: 'NUDM integrates urban governance platforms across 500 cities. Unified digital property registry, water supply monitoring, and citizen grievance redressal.',
    topics: ['Smart Cities', 'Urban Governance', 'E-Governance', 'Digital India'],
  },
];

const gsFilters = ['ALL', 'GS-I', 'GS-II', 'GS-III', 'GS-IV'];
const categoryFilters = [
  'ALL', 'POLITY', 'ECONOMY', 'ENVIRONMENT', 'SCIENCE_TECH',
  'DEFENCE', 'GEOPOLITICS', 'IR', 'GOVERNANCE', 'SOCIETY',
  'AGRICULTURE', 'ETHICS', 'HISTORY', 'CURRENT_AFFAIRS'
];

export const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGS, setSelectedGS] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showOnlyHigh, setShowOnlyHigh] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = allNews.filter((item) => {
    if (selectedGS !== 'ALL' && item.gsPaper !== selectedGS) return false;
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (showOnlyHigh && item.importance !== 'HIGH') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.topics.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>UPSC-Relevant Current Affairs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Important News Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            AI-curated news articles tagged by GS Paper, topic relevance, and importance for UPSC preparation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search news by topic, keyword, or headline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">GS Paper:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gsFilters.map((gs) => (
              <button
                key={gs}
                onClick={() => setSelectedGS(gs)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedGS === gs
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {gs}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyHigh}
                onChange={(e) => setShowOnlyHigh(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500/50"
              />
              <span className="text-xs font-semibold text-rose-400">High Relevance Only</span>
            </label>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                selectedCategory === cat
                  ? (categoryColors[cat] || 'bg-indigo-600 text-white') + ' border'
                  : 'bg-slate-800/40 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              {cat !== 'ALL' && categoryIcons[cat]}
              {cat === 'ALL' ? 'All Topics' : cat.replace('_', ' & ')}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-xs text-slate-400">
        Showing <span className="font-bold text-white">{Math.min(visibleCount, filtered.length)}</span> of{' '}
        <span className="font-bold text-white">{filtered.length}</span> articles
        {selectedGS !== 'ALL' && <span className="text-indigo-400"> • {selectedGS}</span>}
        {selectedCategory !== 'ALL' && <span className="text-indigo-400"> • {selectedCategory.replace('_', ' ')}</span>}
      </div>

      {/* News List */}
      <div className="space-y-4">
        {visible.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.gsPaper}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border flex items-center gap-1 ${categoryColors[item.category] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {categoryIcons[item.category]}
                  {item.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 font-medium">{item.source} • {item.date}</span>
              </div>
              {item.importance === 'HIGH' && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse">
                  HIGH RELEVANCE
                </span>
              )}
            </div>

            <h3
              className="font-bold text-slate-100 text-base leading-snug hover:text-indigo-400 cursor-pointer transition-colors"
              onClick={() => navigate(`/news/${item.id}`)}
            >
              {item.title}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              {item.summary}
            </p>

            {/* Topic Tags */}
            <div className="flex flex-wrap gap-1.5">
              {item.topics.map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/50"
                >
                  #{topic}
                </span>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
              <button
                onClick={() => navigate(`/ai/analysis/${item.id}`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UPSC AI Analysis</span>
              </button>

              <button className="text-slate-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {visibleCount < filtered.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center gap-2 border border-slate-700 transition-all hover:border-indigo-500/50"
          >
            <ChevronDown className="w-4 h-4" />
            <span>Load More Articles ({filtered.length - visibleCount} remaining)</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <Search className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-400">No articles found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      )}
    </div>
  );
};
