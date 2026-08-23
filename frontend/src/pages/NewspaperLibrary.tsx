import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper, Calendar, Download, Eye, Sparkles, Filter,
  FileText, Send, Clock, RefreshCw, Settings,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────
interface NewspaperItem {
  id: string;
  telegramMsgId: number;
  title: string;
  originalFilename: string;
  caption: string;
  editionDate: string;
  displayDate: string;
  language: string;
  pdfUrl: string;
  filename: string;
  fileSize: number;
  fileSizeMB: string;
  fetchedAt: string;
  fetchedTimestamp: string;
  source: string;
}

interface Manifest {
  lastFetch: string | null;
  channel: string;
  totalPapers: number;
  newspapers: NewspaperItem[];
}

// ─── Calendar Component ───────────────────────────────────
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
      className="border border-indigo-500/40 rounded-3xl p-6 w-[360px] max-w-full shadow-2xl shadow-black ring-1 ring-white/10 relative z-[100]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base font-bold text-white tracking-wide">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
          title="Close Calendar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells for days before the 1st */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="w-full aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = toDateStr(day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const hasNewspapers = availableDates.has(dateStr);
          const isFuture = new Date(dateStr) > today;

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => { onSelect(dateStr); onClose(); }}
              className={`
                w-full aspect-square rounded-xl text-xs font-semibold transition-all relative flex items-center justify-center
                ${isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 ring-2 ring-indigo-400'
                  : isToday
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold'
                    : hasNewspapers
                      ? 'bg-slate-800 text-white hover:bg-indigo-600/40 hover:text-indigo-200 cursor-pointer'
                      : isFuture
                        ? 'text-slate-700 cursor-not-allowed'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer'
                }
              `}
            >
              {day}
              {/* Dot indicator for dates with newspapers */}
              {hasNewspapers && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-indigo-600" /> Selected
          </span>
        </div>
        <button
          onClick={() => { onSelect(todayStr); onClose(); }}
          className="px-3 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-xs font-bold text-indigo-300 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

// ─── Format helpers ───────────────────────────────────────
function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const formatted = d.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (dateStr === todayStr) return `Today — ${formatted}`;
  if (dateStr === yesterdayStr) return `Yesterday — ${formatted}`;
  return formatted;
}

// ─── Main Component ──────────────────────────────────────
export const NewspaperLibrary: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => { loadManifest(); }, []);

  const loadManifest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/newspapers/manifest.json');
      if (res.ok) {
        const data: Manifest = await res.json();
        setManifest(data);
        setError(null);
      } else {
        setError('not-configured');
      }
    } catch {
      setError('not-configured');
    } finally {
      setLoading(false);
    }
  };

  const newspapers = manifest?.newspapers || [];

  // Dates that have newspapers (for calendar dots)
  const availableDates = useMemo(
    () => new Set(newspapers.map((n) => n.editionDate)),
    [newspapers]
  );

  // Filter by selected date and language
  const filteredPapers = newspapers.filter((p) => {
    if (p.editionDate !== selectedDate) return false;
    if (selectedLanguage !== 'ALL' && p.language !== selectedLanguage) return false;
    return true;
  });

  const handleDownload = (paper: NewspaperItem) => {
    const link = document.createElement('a');
    link.href = paper.pdfUrl;
    link.download = paper.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReadPdf = (paper: NewspaperItem) => {
    window.open(paper.pdfUrl, '_blank');
  };

  // Navigate to previous/next day
  const goDay = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    if (d <= new Date()) {
      setSelectedDate(d.toISOString().split('T')[0]);
    }
  };

  // ─── Setup Guide ────────────────────────────────────────
  if (error === 'not-configured') {
    return (
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Setup Required</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Newspaper & Journal Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your Telegram account to auto-fetch newspaper PDFs from public channels.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 space-y-6 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Send className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connect Telegram Channel</h2>
              <p className="text-sm text-slate-400 mt-1">
                Follow these steps to auto-fetch newspapers from <span className="text-blue-400 font-semibold">@abvcdsdf</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-semibold text-slate-200 text-sm">Get Telegram API Credentials</h3>
              </div>
              <p className="text-xs text-slate-400 ml-8">
                Go to <a href="https://my.telegram.org/apps" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300">my.telegram.org/apps</a> → Log in → Create application → Copy <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px]">API_ID</code> and <code className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px]">API_HASH</code>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-semibold text-slate-200 text-sm">Configure & Authenticate</h3>
              </div>
              <div className="ml-8 p-3 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-300 space-y-1">
                <div><span className="text-slate-500"># Add API_ID & API_HASH to .env then:</span></div>
                <div>cd telegram-service</div>
                <div>npm run auth</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                <h3 className="font-semibold text-slate-200 text-sm">Fetch & Auto-Schedule</h3>
              </div>
              <div className="ml-8 p-3 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-emerald-300 space-y-1">
                <div>npm run fetch &nbsp;&nbsp;<span className="text-slate-500"># one-time download</span></div>
                <div>npm start &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># daily auto-fetch 6:30AM</span></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => loadManifest()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>I've set it up — Refresh Library</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Main Library View ─────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Sourced from Telegram · @{manifest?.channel || 'abvcdsdf'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Newspaper Library
          </h1>
        </div>
        <button
          onClick={() => loadManifest()}
          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-2 transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync</span>
        </button>
      </div>

      {/* ─── Date Navigator Bar ───────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 relative z-30">
        <div className="flex items-center justify-between gap-4">
          {/* Left: prev/next day arrows + current date */}
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
                {filteredPapers.length} newspaper{filteredPapers.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <button
              onClick={() => goDay(1)}
              disabled={selectedDate >= todayStr}
              className={`p-2 rounded-xl transition-colors ${
                selectedDate >= todayStr
                  ? 'text-slate-700 cursor-not-allowed'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Calendar toggle + language filter */}
          <div className="flex items-center gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>

            <div>
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  calendarOpen
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar</span>
              </button>

              {/* Centered Modal Overlay — Immune to Stacking Context Bleed */}
              {calendarOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
                  {/* Backdrop click handler */}
                  <div
                    className="fixed inset-0 -z-10"
                    onClick={() => setCalendarOpen(false)}
                  />
                  <CalendarPicker
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    availableDates={availableDates}
                    onClose={() => setCalendarOpen(false)}
                  />
                </div>
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

      {/* ─── Newspaper Cards Grid ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPapers.map((paper) => (
          <div
            key={paper.id}
            className="glass-panel rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group overflow-hidden"
          >
            {/* Card Body */}
            <div className="p-5 space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Send className="w-2.5 h-2.5" />
                  Telegram
                </span>
                <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {paper.fetchedAt}
                </span>
              </div>

              <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-300 transition-colors">
                {paper.title}
              </h3>

              {paper.caption && (
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {paper.caption}
                </p>
              )}
              
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  {paper.fileSizeMB} MB
                </span>
                <span>{paper.language}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-5 pb-5 pt-0 flex items-center gap-2">
              <button
                onClick={() => handleReadPdf(paper)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>Read PDF</span>
              </button>
              <button
                onClick={() => handleDownload(paper)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors" title="Ask AI about this newspaper">
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPapers.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <Newspaper className="w-14 h-14 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-400">
            No newspapers for {formatDateHeading(selectedDate)}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {newspapers.length === 0
              ? 'No newspapers fetched yet. Run "npm run fetch" in the telegram-service folder.'
              : 'No papers available for this date. Use the calendar to browse other dates, or click "Today" to go back.'}
          </p>
          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="mx-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Go to Today</span>
            </button>
          )}
        </div>
      )}

      {/* Footer stats */}
      {manifest && (
        <div className="text-center text-[11px] text-slate-600 pt-4">
          {manifest.totalPapers} total papers in library
          {manifest.lastFetch && (
            <> · Last synced {new Date(manifest.lastFetch).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</>
          )}
        </div>
      )}
    </div>
  );
};
