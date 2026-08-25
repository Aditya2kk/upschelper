import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Bell, Sparkles, LogOut, User as UserIcon,
  Command, Newspaper, Flame, FileText, CheckCircle2,
  ExternalLink, Trash2, X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'NEWSPAPER' | 'NEWS' | 'FEATURE' | 'AI';
  unread: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Daily Newspapers Synced',
    description: 'Indian Express (24 Aug 2026) & recent archives are available in your library.',
    time: 'Today · 6:30 AM',
    type: 'NEWSPAPER',
    unread: true,
    actionUrl: '/newspapers',
  },
  {
    id: 'notif-2',
    title: 'Today\'s UPSC Current Affairs Live',
    description: '8 new GS-I to GS-IV editorial briefings added with Prelims & Mains pointers.',
    time: 'Today · 8:00 AM',
    type: 'NEWS',
    unread: true,
    actionUrl: '/news',
  },
  {
    id: 'notif-3',
    title: 'New Feature: In-Depth Article Reader',
    description: 'Click on any news item to open syllabus mapping, key pointers, and practice Mains questions.',
    time: 'Yesterday',
    type: 'FEATURE',
    unread: true,
    actionUrl: '/news',
  },
  {
    id: 'notif-4',
    title: 'AI Document Intelligence Ready',
    description: 'Upload PDF notes or reports to extract grounded citations and answers.',
    time: '2 days ago',
    type: 'AI',
    unread: false,
    actionUrl: '/documents',
  }
];

export const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setIsNotifOpen(false);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'NEWSPAPER':
        return <Newspaper className="w-4 h-4 text-blue-400" />;
      case 'NEWS':
        return <Flame className="w-4 h-4 text-rose-400" />;
      case 'FEATURE':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'AI':
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-xl sticky top-0 z-50 px-6 flex items-center justify-between gap-4">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search news, topics, PDFs, UPSC GS concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-xl text-sm bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <kbd className="absolute right-3 hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </form>

      {/* Action Right Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Ask AI Quick Pill */}
        <button
          onClick={() => navigate('/ai/research')}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/60 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ask AI Assistant</span>
        </button>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`p-2 rounded-xl transition-colors relative ${
              isNotifOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2" />
              </>
            )}
          </button>
          {isNotifOpen &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[999980] bg-black/20 backdrop-blur-[1px]"
                  onClick={() => setIsNotifOpen(false)}
                />
                <div
                  style={{ backgroundColor: '#0f172a' }}
                  className="fixed top-16 right-4 md:right-8 w-80 sm:w-96 rounded-2xl border border-slate-800 shadow-2xl shadow-black ring-1 ring-white/10 z-[999999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors flex items-start gap-3 ${
                            item.unread ? 'bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-slate-800 shrink-0 mt-0.5">
                            {getNotifIcon(item.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className={`text-xs font-bold truncate ${item.unread ? 'text-white' : 'text-slate-300'}`}>
                                {item.title}
                              </h4>
                              <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>

                          {item.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No new notifications
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Stay tuned for daily updates</span>
                      <button
                        onClick={handleClearAll}
                        className="hover:text-rose-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear all</span>
                      </button>
                    </div>
                  )}
                </div>
              </>,
              document.body
            )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </button>

          {isProfileOpen &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[999980] bg-black/20 backdrop-blur-[1px]"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div
                  style={{ backgroundColor: '#0f172a' }}
                  className="fixed top-16 right-4 md:right-8 w-56 border border-slate-800 rounded-xl shadow-2xl py-2 z-[999999] animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-white/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2.5 border-b border-slate-800/80">
                    <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {user?.role}
                    </span>
                  </div>

                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/saved'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800/60 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Bookmarks</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800/80 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>,
              document.body
            )}
        </div>
      </div>
    </header>
  );
};
