import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Database,
  Users,
  FileText,
  Activity
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [sources, setSources] = useState([
    {
      id: 'src-1',
      name: 'The Hindu Official Daily PDF (Development Telegram)',
      type: 'TELEGRAM',
      channelUrl: 'https://t.me/abvcdsdf',
      channelId: '@abvcdsdf',
      authorizedDistribution: false,
      active: true,
      pollInterval: 30,
      lastFetched: '10 mins ago',
    },
    {
      id: 'src-2',
      name: 'PIB National News Feed',
      type: 'RSS',
      rssUrl: 'https://pib.gov.in/rss/RssFeed.aspx',
      authorizedDistribution: true,
      active: true,
      pollInterval: 60,
      lastFetched: '25 mins ago',
    },
  ]);

  const [newChannelUrl, setNewChannelUrl] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pollInterval, setPollInterval] = useState(30);

  const handleAddTelegramSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelUrl.trim() || !newChannelName.trim()) return;

    const newSrc = {
      id: `src-${Date.now()}`,
      name: newChannelName,
      type: 'TELEGRAM',
      channelUrl: newChannelUrl,
      channelId: newChannelUrl.replace('https://t.me/', '@'),
      authorizedDistribution: isAuthorized,
      active: true,
      pollInterval: pollInterval,
      lastFetched: 'Never',
    };

    setSources([newSrc, ...sources]);
    setNewChannelUrl('');
    setNewChannelName('');
    setIsAuthorized(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Source & Ingestion Control Panel
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage RSS feeds, APIs, and Telegram channel ingestions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Articles</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">1,482</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Sources</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{sources.filter((s) => s.active).length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">AI Embeddings</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">18,420</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">294</p>
        </div>
      </div>

      {/* Telegram Add Source Form */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-white text-base">Add Telegram Channel Source</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
            Dynamic Telegram Bot Integration
          </span>
        </div>

        <form onSubmit={handleAddTelegramSource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Source Name</label>
            <input
              type="text"
              required
              placeholder="e.g. UPSC Daily Current Affairs PDF"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Channel Telegram URL</label>
            <input
              type="url"
              required
              placeholder="https://t.me/abvcdsdf"
              value={newChannelUrl}
              onChange={(e) => setNewChannelUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="authCheck"
              checked={isAuthorized}
              onChange={(e) => setIsAuthorized(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
            />
            <label htmlFor="authCheck" className="text-xs text-slate-300 font-medium">
              Authorized for PDF Download & Redistribution
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Sync Interval (Minutes)</label>
            <select
              value={pollInterval}
              onChange={(e) => setPollInterval(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value={15}>Every 15 minutes</option>
              <option value={30}>Every 30 minutes</option>
              <option value={60}>Every hour</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Telegram Source</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Sources Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <h2 className="font-bold text-white text-base">Active Ingestion Sources ({sources.length})</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target Channel / URL</th>
                <th className="py-3 px-4">Redistribution Auth</th>
                <th className="py-3 px-4">Sync Interval</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{src.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-indigo-300">
                      {src.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{src.channelUrl || src.rssUrl}</td>
                  <td className="py-3.5 px-4">
                    {src.authorizedDistribution ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        AUTHORIZED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        METADATA ONLY
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{src.pollInterval} mins</td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
