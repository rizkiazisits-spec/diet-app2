import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import BottomNav from './BottomNav';
import { Bell, User } from 'lucide-react';

const tabs = [
  { to: '/',            label: 'Dashboard' },
  { to: '/chat',        label: 'Chat' },
  { to: '/history',     label: 'History' },
  { to: '/diet-plan',   label: 'Diet' },
  { to: '/account',     label: 'Account' },
];

export default function Layout({ children }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  
  const name = user?.name || localStorage.getItem('profile_name') || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.avatar_url || localStorage.getItem('profile_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f6faff] dark:bg-[#0a0a0a] text-[#171c20] dark:text-[#f8fafc]">
      {/* TopAppBar Desktop (Visible on md+) */}
      <header className="hidden md:flex w-full top-0 sticky glass-header shadow-sm z-40 items-center justify-between px-8 h-20 transition-all">
        <h1 className="text-[28px] font-bold text-[#0ea5e9] tracking-tighter cursor-pointer" onClick={() => nav('/')}>
          NutriTrack
        </h1>
        <nav className="flex gap-6 h-full">
          {tabs.map((t) => {
            const isActive = t.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(t.to);
            return (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={`relative h-full flex items-center px-2 text-[14px] font-semibold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-[#0ea5e9]'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[#0ea5e9]'
                }`}
              >
                {t.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0ea5e9] rounded-t-full shadow-[0_-2px_8px_rgba(14,165,233,0.5)]" />
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800 hover:opacity-80 border border-[var(--color-outline-variant)] shadow-sm active:scale-95 transition-all">
            <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse" />
          </button>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => nav('/account')}>
            <div className="relative">
              <div className="absolute inset-0 bg-[#0ea5e9] rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-slate-700 dark:text-slate-300 relative z-10 border border-[var(--color-outline-variant)] shadow-sm">
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="hidden lg:block text-[14px] font-bold text-[var(--color-on-background)] capitalize">{name}</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout with proper desktop boundaries */}
      <div className="flex-1 flex flex-col md:px-8 py-4 md:py-6 max-w-7xl w-full mx-auto">
        {children}
      </div>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
}
