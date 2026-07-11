import { useEffect, useState } from 'react';
import { getFoodHistory, getExerciseHistory } from '../api';
import { ArrowLeft, Clock, TrendingDown, ArrowUpRight, Flame, Sparkles, EggFried, Salad, Fish, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('food'); // food, exercise
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'food' ? getFoodHistory : getExerciseHistory;
    fetcher()
      .then((r) => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab]);

  // Mock data matching Image 5 if database is empty
  const defaultFoodHistory = [
    {
      name: 'Omelet Bayam & Roti Gandum',
      calories: 320,
      dateText: '24 Okt 2023 • 07:30',
      Icon: EggFried,
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      textColor: 'text-amber-500'
    },
    {
      name: 'Salad Ayam Bakar',
      calories: 450,
      dateText: '24 Okt 2023 • 12:45',
      Icon: Salad,
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      textColor: 'text-green-500'
    },
    {
      name: 'Sushi Sashimi Mix',
      calories: 380,
      dateText: '23 Okt 2023 • 19:15',
      Icon: Fish,
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
      textColor: 'text-rose-500'
    }
  ];

  const defaultExerciseHistory = [
    {
      name: 'Lari Pagi',
      calories: 210,
      dateText: '24 Okt 2023 • 06:00',
      Icon: Flame,
      bgColor: 'bg-sky-50 dark:bg-sky-950/20',
      textColor: 'text-sky-500'
    },
    {
      name: 'Latihan Beban',
      calories: 150,
      dateText: '23 Okt 2023 • 17:30',
      Icon: Trophy,
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      textColor: 'text-purple-500'
    },
    {
      name: 'Jalan Santai',
      calories: 90,
      dateText: '22 Okt 2023 • 19:00',
      Icon: Clock,
      bgColor: 'bg-slate-50 dark:bg-slate-800/50',
      textColor: 'text-slate-500'
    }
  ];

  const displayList = items.length > 0
    ? items.map((i) => ({
        name: i.makanan || i.olahraga || 'Aktivitas',
        calories: i.kalori || i.kalori_terbakar || 0,
        dateText: i.tanggal ? `${new Date(i.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • 08:00` : 'Hari ini',
        Icon: tab === 'food' ? Salad : Flame,
        bgColor: tab === 'food' ? 'bg-sky-50 dark:bg-sky-950/20' : 'bg-purple-50 dark:bg-purple-950/20',
        textColor: tab === 'food' ? 'text-[#0ea5e9]' : 'text-purple-500'
      }))
    : (tab === 'food' ? defaultFoodHistory : defaultExerciseHistory);

  const totalCalories = items.length > 0
    ? Math.round(items.reduce((s, i) => s + (i.kalori || i.kalori_terbakar || 0), 0))
    : (tab === 'food' ? 750 : 450);

  const secondStatLabel = tab === 'food' ? 'TOTAL ITEM' : 'DURASI OLAHRAGA';
  const secondStatValue = items.length > 0
    ? (tab === 'food' ? `${items.length} porsi` : `${items.reduce((s, i) => s + (i.durasi_menit || 0), 0)}m`)
    : (tab === 'food' ? '3 porsi' : '45m');

  const secondStatSub = items.length > 0
    ? (tab === 'food' ? `${items.length} Makanan dicatat` : `${items.length} Sesi Olahraga`)
    : (tab === 'food' ? '3 Makanan dicatat' : '3 Sesi Olahraga');

  return (
    <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] pb-28 md:pb-8 text-[#171c20] dark:text-[#f8fafc] font-sans">
      {/* Header bar */}
      <header className="flex items-center justify-between px-5 py-4 w-full bg-[#f6faff] dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-600 dark:text-neutral-300 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#006591] dark:text-[#89ceff]">Riwayat</h1>
        </div>
      </header>

      <main className="p-5 space-y-5">
        {/* Time Filter Chips */}
        <section className="flex justify-between gap-2.5">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: 'Minggu Ini' },
            { id: 'month', label: 'Bulan Ini' }
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setTimeFilter(chip.id)}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer text-center ${
                timeFilter === chip.id
                  ? 'bg-[#0ea5e9] text-white shadow-sm'
                  : 'bg-[#eaeef4] dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          {/* TOTAL KALORI */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl flex flex-col justify-between h-[135px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">TOTAL KALORI</span>
              <span className="text-2xl font-extrabold text-[#006591] dark:text-[#89ceff] block mt-2">
                {totalCalories.toLocaleString('id-ID')} kcal
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#22c55e] font-bold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Hari Ini</span>
            </div>
          </div>

          {/* DYNAMIC SECOND STAT (Aktivitas / Total Item) */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl flex flex-col justify-between h-[135px]">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">
                {secondStatLabel}
              </span>
              <span className="text-2xl font-extrabold text-[#de8712] block mt-2">
                {secondStatValue}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-neutral-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{secondStatSub}</span>
            </div>
          </div>
        </section>

        {/* Makanan / Olahraga Toggle Control */}
        <section className="bg-[#eaeef4] dark:bg-neutral-900/80 p-1 rounded-2xl flex w-full border border-slate-200/20">
          <button onClick={() => setTab('food')}
            className={`flex-1 py-3 rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer ${tab === 'food' ? 'bg-white dark:bg-[#1e1e1e] text-[#0ea5e9] shadow-sm' : 'text-slate-500 dark:text-neutral-400'}`}>
            Makanan
          </button>
          <button onClick={() => setTab('exercise')}
            className={`flex-1 py-3 rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer ${tab === 'exercise' ? 'bg-white dark:bg-[#1e1e1e] text-[#0ea5e9] shadow-sm' : 'text-slate-500 dark:text-neutral-400'}`}>
            Olahraga
          </button>
        </section>

        {/* History List */}
        <section className="space-y-3">
          {loading ? (
            <p className="text-slate-400 text-center py-6 text-xs">Memuat data...</p>
          ) : (
            displayList.map((item, idx) => (
              <div key={idx} className="glass-card bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.bgColor} ${item.textColor}`}>
                    <item.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-neutral-200 line-clamp-1">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold mt-0.5">{item.dateText}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-800 dark:text-neutral-200">
                    {tab === 'food' ? `${item.calories} kcal` : `${item.calories} kcal`}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Lacak Progresmu Dark Blue Card */}
        <section className="bg-[#0f172a] text-white p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#0ea5e9]/10 rounded-full blur-xl" />
          <h3 className="text-sm font-bold tracking-tight">Lacak Progresmu</h3>
          <p className="text-[11px] text-slate-300 leading-relaxed max-w-[90%]">
            Grafik mingguan menunjukkan asupan kalori Anda tetap stabil di angka 1800 kcal.
          </p>
          <button onClick={() => navigate('/')} className="w-full mt-2 py-2.5 rounded-full bg-white text-[#0f172a] hover:bg-slate-100 active:scale-[0.98] transition-all text-xs font-bold shadow-md cursor-pointer">
            Lihat Detail
          </button>
        </section>
      </main>
    </div>
  );
}
