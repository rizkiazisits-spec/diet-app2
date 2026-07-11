import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  MessageSquareText, 
  History, 
  Utensils, 
  User 
} from 'lucide-react';

const tabs = [
  { to: '/',            Icon: LayoutGrid,        label: 'Dashboard' },
  { to: '/chat',        Icon: MessageSquareText, label: 'Chat' },
  { to: '/history',     Icon: History,           label: 'History' },
  { to: '/diet-plan',   Icon: Utensils,          label: 'Diet' },
  { to: '/account',     Icon: User,              label: 'Account' },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-[#0f172a] border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] rounded-t-xl">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-xl py-1 w-14 transition-all active:scale-90 duration-300 ease-out ${
              isActive
                ? 'text-[#0ea5e9]'
                : 'text-[#94a3b8] hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <t.Icon className="w-[22px] h-[22px] mb-1" />
              <span className={`text-[10px] leading-none ${isActive ? 'font-bold text-[#0ea5e9]' : 'font-medium'}`}>
                {t.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

