import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getFoodHistory, getExerciseHistory } from '../api';
import { Utensils, Dumbbell, TrendingDown, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caloriesIn, setCaloriesIn] = useState(0);
  const [caloriesOut, setCaloriesOut] = useState(0);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getFoodHistory().then((r) => {
      const items = r.data || [];
      setCaloriesIn(items.reduce((s, i) => s + (i.kalori || 0), 0));
      setActivities((prev) => {
        const existing = prev.filter((a) => a.type !== 'food');
        const newItems = items.map((i) => ({ ...i, type: 'food', displayTime: '08:15', displaySubtitle: 'Sarapan' }));
        return [...newItems, ...existing];
      });
    }).catch(() => {});

    getExerciseHistory().then((r) => {
      const items = r.data || [];
      setCaloriesOut(items.reduce((s, i) => s + (i.kalori_terbakar || 0), 0));
      setActivities((prev) => {
        const existing = prev.filter((a) => a.type !== 'exercise');
        const newItems = items.map((i) => ({ ...i, type: 'exercise', displayTime: '06:00', displaySubtitle: '30 menit' }));
        return [...existing, ...newItems];
      });
    }).catch(() => {});
  }, []);

  const name = user?.name || localStorage.getItem('profile_name') || user?.email?.split('@')[0] || 'Budi';
  const avatarUrl = user?.avatar_url || localStorage.getItem('profile_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';

  // Realistic mock data matching Image 3 if database is empty
  const displayCaloriesIn = caloriesIn || 1840;
  const displayCaloriesOut = caloriesOut || 450;
  const displayDeficit = (caloriesIn === 0 && caloriesOut === 0) ? -320 : (displayCaloriesOut - displayCaloriesIn);

  const defaultActivities = [
    {
      type: 'food',
      name: 'Nasi Goreng Ayam',
      displayTime: '08:15',
      displaySubtitle: 'Sarapan',
      val: '+450 kcal',
      isBurn: false,
    },
    {
      type: 'exercise',
      name: 'Lari Pagi',
      displayTime: '06:00',
      displaySubtitle: '30 menit',
      val: '-210 kcal',
      isBurn: true,
    }
  ];

  const listActivities = activities.length > 0
    ? activities.map((a) => ({
        type: a.type,
        name: a.makanan || a.olahraga || 'Aktivitas',
        displayTime: a.displayTime || '08:00',
        displaySubtitle: a.displaySubtitle || (a.type === 'food' ? 'Sarapan' : '30 menit'),
        val: a.type === 'food' ? `+${Math.round(a.kalori)} kcal` : `-${Math.round(a.kalori_terbakar)} kcal`,
        isBurn: a.type === 'exercise',
      }))
    : defaultActivities;

  const weekBars = [
    { day: 'SN', h: '45%', val: '1.2k' },
    { day: 'SL', h: '55%', val: '1.5k' },
    { day: 'RB', h: '75%', val: '1.8k' },
    { day: 'KM', h: '80%', val: '1.8k', active: true },
    { day: 'JM', h: '60%', val: '1.6k' },
    { day: 'SB', h: '30%', val: '900' },
    { day: 'MG', h: '45%', val: '1.3k' },
  ];

  return (
    <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] pb-28 md:pb-8 text-[#171c20] dark:text-[#f8fafc] font-sans">
      {/* Mobile & Desktop Header */}
      <header className="w-full flex items-center justify-between px-5 md:px-0 py-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#006591] dark:text-[#89ceff]">
            Selamat pagi, <span className="capitalize">{name}</span>
          </h1>
        </div>
        {/* Profile Avatar Image */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-sm cursor-pointer" onClick={() => navigate('/account')}>
          <img
            src={avatarUrl}
            alt="Profile Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <main className="px-5 md:px-0 mt-2 space-y-5">
        {/* Top Two Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* Kalori Masuk */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl flex flex-col justify-between h-[135px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Kalori Masuk</span>
              <div className="w-8 h-8 rounded-lg bg-[#0ea5e9]/10 dark:bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#006591] dark:text-[#89ceff]">{displayCaloriesIn.toLocaleString()}</span>
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">kcal</span>
              </div>
            </div>
          </div>

          {/* Kalori Keluar */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl flex flex-col justify-between h-[135px]">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Kalori Keluar</span>
              <div className="w-8 h-8 rounded-lg bg-[#de8712]/10 dark:bg-[#de8712]/20 flex items-center justify-center text-[#de8712]">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#0f172a] dark:text-[#f8fafc]">{displayCaloriesOut.toLocaleString()}</span>
                <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">kcal</span>
              </div>
            </div>
          </div>
        </section>

        {/* Defisit Kalori Card */}
        <section className="glass-card bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22c55e]/10 dark:bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-700 dark:text-neutral-300">Defisit Kalori</span>
          </div>
          <span className="text-lg font-extrabold text-[#22c55e]">
            {displayDeficit.toLocaleString()} <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">kcal</span>
          </span>
        </section>

        {/* Laporan Mingguan Chart */}
        <section className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Laporan Mingguan</h3>
            <button className="text-xs font-bold text-[#0ea5e9] hover:underline" onClick={() => navigate('/history')}>
              Lihat Semua
            </button>
          </div>
          {/* Chart Container */}
          <div className="h-40 flex items-end justify-between px-2 pt-6 relative border-b border-slate-100 dark:border-neutral-800/50 pb-2">
            {/* Target lines in the background */}
            <div className="absolute inset-x-0 top-12 border-t border-dashed border-slate-200 dark:border-neutral-800/80">
              <span className="absolute left-2 -top-4 text-[9px] font-bold text-slate-400 dark:text-neutral-500">Target (1,500 kcal)</span>
            </div>
            <div className="absolute inset-x-0 top-24 border-t border-dashed border-slate-200/40 dark:border-neutral-800/20" />

            {weekBars.map((b) => (
              <div key={b.day} className="flex flex-col items-center w-full group cursor-pointer h-full justify-end relative z-10">
                {/* Calorie label on top of the bar */}
                <span className={`text-[9px] font-bold mb-1.5 transition-all ${
                  b.active ? 'text-[#0ea5e9] font-extrabold scale-105' : 'text-slate-400 dark:text-neutral-500'
                }`}>
                  {b.val}
                </span>
                
                {/* Bar */}
                <div
                  className={`w-[22px] rounded-t-full transition-all duration-300 ${
                    b.active
                      ? 'bg-gradient-to-t from-[#006591] to-[#0ea5e9] shadow-[0_4px_12px_rgba(14,165,233,0.3)]'
                      : 'bg-slate-300 dark:bg-neutral-800 hover:bg-[#0ea5e9]/50'
                  }`}
                  style={{ height: b.h }}
                />
                
                {/* Day Label */}
                <span className={`text-[10px] mt-2 font-bold ${
                  b.active ? 'text-[#0ea5e9] font-extrabold' : 'text-slate-400 dark:text-neutral-500'
                }`}>{b.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Aktivitas Terakhir */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Aktivitas Terakhir</h3>
          <div className="flex flex-col gap-3">
            {listActivities.map((a, i) => (
              <div
                key={i}
                className="glass-card bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-neutral-800 transition-all hover:translate-x-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    a.type === 'food'
                      ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                      : 'bg-[#de8712]/10 text-[#de8712]'
                  }`}>
                    {a.type === 'food' ? <Utensils className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-neutral-200">{a.name}</h4>
                    <p className="text-[11px] text-slate-400 dark:text-neutral-500 font-semibold mt-0.5">
                      {a.displayTime} • {a.displaySubtitle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${a.isBurn ? 'text-slate-600 dark:text-neutral-400' : 'text-[#006591] dark:text-[#89ceff]'}`}>
                    {a.val}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => navigate('/chat')}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow-lg shadow-sky-500/20 hover:bg-[#0284c7] hover:scale-105 active:scale-95 transition-all z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
