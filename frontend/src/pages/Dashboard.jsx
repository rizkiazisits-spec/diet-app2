import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { getFoodHistory, getExerciseHistory } from '../api';
import { Utensils, Dumbbell, TrendingDown, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [foodHistory, setFoodHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);

  useEffect(() => {
    getFoodHistory().then((r) => {
      setFoodHistory(r.data || []);
    }).catch(() => {});

    getExerciseHistory().then((r) => {
      setExerciseHistory(r.data || []);
    }).catch(() => {});
  }, []);

  const name = user?.name || localStorage.getItem('profile_name') || user?.email?.split('@')[0] || 'Budi';
  const avatarUrl = user?.avatar_url || localStorage.getItem('profile_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';

  // Helper function to format Date to YYYY-MM-DD in local time
  const getLocalDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format ISO Date to local time HH:MM
  const formatTime = (isoString) => {
    if (!isoString) return '08:00';
    try {
      const d = new Date(isoString);
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    } catch (e) {
      return '08:00';
    }
  };

  // Helper to categorize meal time based on hour
  const getMealTimeLabel = (isoString) => {
    if (!isoString) return 'Sarapan';
    try {
      const d = new Date(isoString);
      const hour = d.getHours();
      if (hour >= 4 && hour < 11) return 'Sarapan';
      if (hour >= 11 && hour < 15) return 'Makan Siang';
      if (hour >= 15 && hour < 18) return 'Cemilan';
      if (hour >= 18 && hour < 22) return 'Makan Malam';
      return 'Cemilan Malam';
    } catch (e) {
      return 'Sarapan';
    }
  };

  // Helper for exercise subtitle
  const getExerciseLabel = (item) => {
    return `${item.durasi_menit || 30} menit`;
  };

  // Helper to format calorie display value (e.g. 1500 -> 1.5k)
  const formatCalorieVal = (val) => {
    if (val === 0) return '';
    if (val >= 1000) {
      const kVal = val / 1000;
      return kVal % 1 === 0 ? `${kVal}k` : `${kVal.toFixed(1)}k`;
    }
    return Math.round(val).toString();
  };

  // Helper to get days of the current week (Monday to Sunday)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const day = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diffToMonday);
    
    const days = [];
    const daysFull = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        dateStr: getLocalDateString(d),
        dayName: daysFull[i],
        isToday: getLocalDateString(d) === getLocalDateString(today),
      });
    }
    return days;
  };

  const todayStr = getLocalDateString(new Date());

  const todayCaloriesIn = foodHistory
    .filter(item => item.tanggal === todayStr)
    .reduce((sum, item) => sum + (item.kalori || 0), 0);

  const todayCaloriesOut = exerciseHistory
    .filter(item => item.tanggal === todayStr)
    .reduce((sum, item) => sum + (item.kalori_terbakar || 0), 0);

  // Fallback to mock values only if history has absolutely no logs
  const hasRealLogs = foodHistory.length > 0 || exerciseHistory.length > 0;
  
  const displayCaloriesIn = hasRealLogs ? todayCaloriesIn : 1840;
  const displayCaloriesOut = hasRealLogs ? todayCaloriesOut : 450;
  const displayDeficit = hasRealLogs ? (displayCaloriesOut - displayCaloriesIn) : -320;

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

  const combinedActivities = [
    ...foodHistory.map((item) => ({
      ...item,
      type: 'food',
      name: item.makanan,
      displayTime: formatTime(item.created_at),
      displaySubtitle: getMealTimeLabel(item.created_at),
      val: `+${Math.round(item.kalori)} kcal`,
      isBurn: false,
      timestamp: new Date(item.created_at || item.tanggal).getTime(),
    })),
    ...exerciseHistory.map((item) => ({
      ...item,
      type: 'exercise',
      name: item.olahraga,
      displayTime: formatTime(item.created_at),
      displaySubtitle: getExerciseLabel(item),
      val: `-${Math.round(item.kalori_terbakar)} kcal`,
      isBurn: true,
      timestamp: new Date(item.created_at || item.tanggal).getTime(),
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const listActivities = hasRealLogs ? combinedActivities.slice(0, 5) : defaultActivities;

  const weekDays = getCurrentWeekDays();
  
  const weekBars = weekDays.map((dayObj, index) => {
    if (hasRealLogs) {
      const dayFoods = foodHistory.filter(item => item.tanggal === dayObj.dateStr);
      const totalCal = dayFoods.reduce((sum, item) => sum + (item.kalori || 0), 0);
      const heightPercent = totalCal > 0 ? `${Math.min(100, Math.max(15, (totalCal / 2000) * 100))}%` : '8px';
      return {
        day: dayObj.dayName,
        h: heightPercent,
        val: totalCal > 0 ? formatCalorieVal(totalCal) : '',
        active: dayObj.isToday,
      };
    } else {
      const mockVals = [1200, 1500, 1800, 1800, 1600, 900, 1300];
      const val = mockVals[index];
      const heightPercent = `${Math.min(100, Math.max(15, (val / 2000) * 100))}%`;
      return {
        day: dayObj.dayName,
        h: heightPercent,
        val: formatCalorieVal(val),
        active: dayObj.isToday,
      };
    }
  });

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
          <div className="h-44 flex items-end justify-between px-1 pt-8 relative pb-2 bg-slate-50/50 dark:bg-neutral-900/30 rounded-xl p-3 border border-slate-100/50 dark:border-neutral-800/30">
            {/* Target lines in the background */}
            <div className="absolute inset-x-3 top-10 border-t border-dashed border-slate-200 dark:border-neutral-800/80">
              <span className="absolute left-2 -top-4 text-[9px] font-bold text-slate-400 dark:text-neutral-500">Target (1,500 kcal)</span>
            </div>
            <div className="absolute inset-x-3 top-20 border-t border-dashed border-slate-200/40 dark:border-neutral-800/20" />
            <div className="absolute inset-x-3 top-30 border-t border-dashed border-slate-200/20 dark:border-neutral-800/10" />

            {weekBars.map((b) => (
              <div key={b.day} className="flex flex-col items-center w-full group cursor-pointer h-full justify-end relative z-10">
                {/* Calorie label on top of the bar */}
                <span className={`text-[9px] font-bold mb-1.5 transition-all ${
                  b.active ? 'text-[#0ea5e9] font-extrabold scale-105' : 'text-slate-400 dark:text-neutral-500'
                }`}>
                  {b.val || '\u00A0'}
                </span>
                
                {/* Bar */}
                <div
                  className={`w-[24px] rounded-t-full transition-all duration-300 hover:scale-105 ${
                    b.active
                      ? 'bg-gradient-to-t from-[#006591] to-[#0ea5e9] shadow-[0_4px_12px_rgba(14,165,233,0.35)]'
                      : b.h === '8px'
                        ? 'bg-slate-200 dark:bg-neutral-800/40'
                        : 'bg-slate-300 dark:bg-neutral-800 hover:bg-[#0ea5e9]/40'
                  }`}
                  style={{ height: b.h }}
                />
                
                {/* Day Label */}
                <span className={`text-[10px] mt-2 font-bold px-1.5 py-0.5 rounded-md transition-all ${
                  b.active ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] font-extrabold' : 'text-slate-400 dark:text-neutral-500'
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
