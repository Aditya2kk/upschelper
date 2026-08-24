import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Sparkles, Bookmark, Filter, Search,
  Globe, Shield, Cpu, TrendingUp, Leaf, Building2,
  Landmark, Users, Wheat, Heart, Clock, ChevronDown, BookOpen,
  Calendar, ChevronLeft, ChevronRight, X, RotateCcw
} from 'lucide-react';
import { ALL_NEWS_ITEMS, NewsItem, getAvailableNewsDates } from '../services/newsData';

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  availableDates: Set<string>;
  onClose: () => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ selectedDate, onSelect, availableDates, onClose }) => {
  const initial = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  };

  const toDateStr = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div
      style={{ backgroundColor: '#0f172a' }}
      className="border border-indigo-500/40 rounded-3xl p-5 w-[340px] max-w-full shadow-2xl shadow-black ring-1 ring-white/10 relative z-50"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-bold text-white tracking-wide">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
          title="Close Calendar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const hasNews = availableDates.has(dateStr);
          const isFuture = new Date(dateStr) > today;

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => { onSelect(dateStr); onClose(); }}
              className={`
                w-full aspect-square rounded-xl text-xs font-semibold transition-all relative flex items-center justify-center
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400 font-bold'
                  : isToday
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                    : hasNews
                      ? 'bg-slate-800 text-white hover:bg-indigo-600/40 hover:text-indigo-200 cursor-pointer'
                      : isFuture
                        ? 'text-slate-700 cursor-not-allowed'
                        : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 cursor-pointer'
                }
              `}
            >
              {day}
              {hasNews && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> News Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> Selected
          </span>
        </div>
        <button
          onClick={() => { onSelect(todayStr); onClose(); }}
          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-bold text-indigo-300 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

function formatDateHeading(dateStr: string): string {
  if (dateStr === 'ALL') return 'All Current Affairs (Recent)';
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const formatted = d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (dateStr === todayStr) return `Today — ${formatted}`;
  if (dateStr === yesterdayStr) return `Yesterday — ${formatted}`;
  return formatted;
}

const gsFilters = ['ALL', 'GS-I', 'GS-II', 'GS-III', 'GS-IV'];
const categoryFilters = [
  'ALL', 'POLITY', 'ECONOMY', 'ENVIRONMENT', 'SCIENCE_TECH',
  'DEFENCE', 'GEOPOLITICS', 'IR', 'GOVERNANCE', 'SOCIETY',
  'AGRICULTURE', 'ETHICS', 'HISTORY', 'CURRENT_AFFAIRS'
];

export const NewsFeed: React.FC = () => {
  const navigate = useNavigate();
  const availableDatesList = useMemo(() => getAvailableNewsDates(), []);
  const availableDatesSet = useMemo(() => new Set(availableDatesList), [availableDatesList]);
  
  // Default to today if available, else latest available news date
  const defaultDate = availableDatesList.length > 0 ? availableDatesList[0] : '2026-08-24';
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [selectedDate, setSelectedDate] = useState<string>(
    availableDatesSet.has(todayStr) ? todayStr : defaultDate
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGS, setSelectedGS] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showOnlyHigh, setShowOnlyHigh] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  // Navigate to previous/next day
  const goDay = (offset: number) => {
    if (selectedDate === 'ALL') {
      setSelectedDate(todayStr);
      return;
    }
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    if (d <= new Date()) {
      const nextDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setSelectedDate(nextDateStr);
    }
  };

  const filtered = ALL_NEWS_ITEMS.filter((item) => {
    // Date filter
    if (selectedDate !== 'ALL' && item.dateIso !== selectedDate) return false;
    // GS Paper filter
    if (selectedGS !== 'ALL' && item.gsPaper !== selectedGS) return false;
    // Category filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    // High importance filter
    if (showOnlyHigh && item.importance !== 'HIGH') return false;
    // Search query filter
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Daily UPSC Current Affairs & Editorial Analysis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Today's News & Analysis
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated daily current affairs tagged by GS Paper (GS-I to GS-IV), syllabus themes, and exam relevance.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Updated Daily · 24 Aug 2026</span>
        </div>
      </div>

      {/* ─── Date Navigator Bar ───────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative z-30">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Prev/Next Day + Current Date Display */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => goDay(-1)}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center min-w-[220px]">
              <h2 className="text-base font-bold text-white">
                {formatDateHeading(selectedDate)}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {filtered.length} article{filtered.length !== 1 ? 's' : ''} for this date
              </p>
            </div>

            <button
              onClick={() => goDay(1)}
              disabled={selectedDate >= todayStr || selectedDate === 'ALL'}
              className={`p-2 rounded-xl transition-colors ${
                selectedDate >= todayStr || selectedDate === 'ALL'
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Date filter actions + Calendar Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* All Dates toggle */}
            <button
              onClick={() => setSelectedDate(selectedDate === 'ALL' ? todayStr : 'ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                selectedDate === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{selectedDate === 'ALL' ? 'Viewing All Dates' : 'All Dates'}</span>
            </button>

            {/* Calendar button with dropdown */}
            <div className="relative z-50">
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  calendarOpen
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>

              {/* Dropdown positioned directly below Calendar button */}
              {calendarOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCalendarOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <CalendarPicker
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                      availableDates={availableDatesSet}
                      onClose={() => setCalendarOpen(false)}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Today shortcut */}
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4">
        {/* Search Input */}
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
        {selectedDate !== 'ALL' && <span className="text-emerald-400"> • {selectedDate}</span>}
      </div>

      {/* News List */}
      <div className="space-y-4 relative z-10">
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
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  HIGH RELEVANCE
                </span>
              )}
            </div>

            <h3
              className="font-bold text-slate-100 text-base leading-snug hover:text-indigo-400 cursor-pointer transition-colors"
              onClick={() => navigate(`/ai/research?q=${encodeURIComponent(item.title)}`)}
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
                onClick={() => navigate(`/ai/research?q=${encodeURIComponent(item.title)}`)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>UPSC AI Analysis & Model Answer</span>
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
        <div className="text-center py-16 space-y-3 glass-panel rounded-2xl border border-slate-800">
          <Search className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-400">No articles for this date or filter</h3>
          <p className="text-sm text-slate-500">Try selecting another date from the calendar or switching to "All Dates".</p>
          <button
            onClick={() => setSelectedDate('ALL')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all mt-2"
          >
            View All Current Affairs
          </button>
        </div>
      )}
    </div>
  );
};
