import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { LayoutDashboard, Newspaper, Flame, GraduationCap, Sparkles } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const mobileNav = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'News', path: '/news', icon: Flame },
    { label: 'Papers', path: '/newspapers', icon: Newspaper },
    { label: 'UPSC', path: '/upsc', icon: GraduationCap },
    { label: 'AI', path: '/ai/research', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopNav />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

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
