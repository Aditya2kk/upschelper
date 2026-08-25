import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  BookOpen,
  Sparkles,
  Bookmark,
  FileText,
  History,
  Shield,
  Bot,
  Flame,
  Globe,
  Cpu,
  TrendingUp,
  Leaf,
  ShieldAlert,
  GraduationCap,
  MessageSquarePlus,
  Bug
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { FeedbackModal } from './FeedbackModal';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const mainNavItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: "Today's News", path: '/news', icon: Flame, badge: 'LIVE' },
    { label: 'Newspapers', path: '/newspapers', icon: Newspaper },
    { label: 'UPSC Hub', path: '/upsc', icon: GraduationCap },
    { label: 'AI Assistant', path: '/ai/research', icon: Sparkles, highlight: true },
    { label: 'My Documents', path: '/documents', icon: FileText },
    { label: 'Saved Material', path: '/saved', icon: Bookmark },
    { label: 'Report Glitch / Feedback', path: '/feedback', icon: MessageSquarePlus, badge: 'SUPPORT' },
  ];

  const categoryItems = [
    { label: 'Polity & Governance', category: 'POLITY', icon: Shield, color: 'text-indigo-400' },
    { label: 'Economy', category: 'ECONOMY', icon: TrendingUp, color: 'text-amber-400' },
    { label: 'Environment', category: 'ENVIRONMENT', icon: Leaf, color: 'text-emerald-400' },
    { label: 'Science & Tech', category: 'SCIENCE_TECH', icon: Cpu, color: 'text-blue-400' },
    { label: 'Geopolitics & IR', category: 'GEOPOLITICS', icon: Globe, color: 'text-purple-400' },
  ];

  return (
    <>
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 backdrop-blur-xl shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
              UPSC <span className="gradient-text">NewsHub</span>
            </h1>
            <p className="text-[10px] font-medium tracking-wider text-indigo-400 uppercase">AI Study OS v1.0</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 group ${
                        isActive
                          ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                          : item.highlight
                          ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 text-purple-300 border border-purple-500/20 hover:border-purple-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && !item.badge && (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">UPSC Topics</p>
            <nav className="space-y-1">
              {categoryItems.map((cat) => {
                const Icon = cat.icon;
                return (
                  <NavLink
                    key={cat.category}
                    to={`/news?category=${cat.category}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
                  >
                    <Icon className={`w-4 h-4 ${cat.color}`} />
                    <span className="truncate">{cat.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Feedback & Report Glitch Action */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Support & Feedback</p>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquarePlus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Report Glitch / Feedback</span>
              </div>
              <Bug className="w-3.5 h-3.5 text-rose-400 opacity-70 group-hover:opacity-100" />
            </button>
          </div>

          {/* Admin section if ADMIN role */}
          {user?.role === 'ADMIN' && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-amber-500 uppercase tracking-wider mb-2">Admin Operations</p>
              <NavLink
                to="/admin"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-400 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'UPSC Aspirant'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'aspirant@upsc.gov.in'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Global Feedback & Bug Report Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
