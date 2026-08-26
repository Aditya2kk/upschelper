import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { LayoutDashboard, Newspaper, Flame, GraduationCap, Sparkles, MessageSquarePlus, Bug } from 'lucide-react';
import { FeedbackModal } from '../components/FeedbackModal';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const mobileNav = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'News', path: '/news', icon: Flame },
    { label: 'Papers', path: '/newspapers', icon: Newspaper },
    { label: 'UPSC', path: '/upsc', icon: GraduationCap },
    { label: 'Feedback', path: '/feedback', icon: MessageSquarePlus },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <TopNav />
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Floating 24/7 Glitch & Feedback Trigger Pill (Bottom-Right) */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-8 z-40">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-2xl shadow-indigo-600/50 border border-white/20 hover:scale-105 transition-all backdrop-blur-xl"
        >
          <MessageSquarePlus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Report Glitch / Feedback</span>
          <span className="sm:hidden">Feedback</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Feedback Modal Triggered from Floating Pill */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg z-40 flex items-center justify-around px-2">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-indigo-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
