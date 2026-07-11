import { ArrowLeft, ArrowRight, Lightbulb, Sparkles, Flame, Droplet, Egg, Leaf, Coffee, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Rekomendasi() {
  const navigate = useNavigate();

  const swaps = [
    {
      from: 'Nasi Putih',
      to: 'Nasi Merah',
      fromCal: 200,
      toCal: 150,
      saveCal: 50,
      badge: 'LEBIH SEHAT',
      badgeStyle: 'bg-[#e0f2fe] text-[#0ea5e9]',
      Icon: Leaf,
      iconBg: 'bg-[#e0f2fe] text-[#0ea5e9]'
    },
    {
      from: 'Kentang Goreng',
      to: 'Kentang Rebus',
      fromCal: 312,
      toCal: 132,
      saveCal: 180,
      badge: 'TURUN 180 KALORI',
      badgeStyle: 'bg-red-50 text-red-500',
      Icon: Flame,
      iconBg: 'bg-red-50 text-red-500'
    },
    {
      from: 'Soda Manis',
      to: 'Air Infused',
      fromCal: 140,
      toCal: 5,
      saveCal: 135,
      badge: 'BEBAS GULA',
      badgeStyle: 'bg-[#0ea5e9] text-white',
      Icon: Droplet,
      iconBg: 'bg-blue-50 text-blue-500'
    },
    {
      from: 'Telur Goreng',
      to: 'Telur Rebus',
      fromCal: 90,
      toCal: 70,
      saveCal: 20,
      badge: 'LEBIH SEHAT',
      badgeStyle: 'bg-[#e0f2fe] text-[#0ea5e9]',
      Icon: Egg,
      iconBg: 'bg-sky-50 text-[#0ea5e9]'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] pb-28 md:pb-8 text-[#171c20] dark:text-[#f8fafc] font-sans">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-5 py-4 w-full bg-[#f6faff] dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-600 dark:text-neutral-300 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#006591] dark:text-[#89ceff]">Rekomendasi Makanan Pengganti</h1>
        </div>
      </header>

      <main className="p-5 space-y-5">
        {/* Sub-tab navigation switcher */}
        <section className="bg-[#eaeef4] dark:bg-neutral-900/80 p-1 rounded-2xl flex w-full border border-slate-200/20">
          <button onClick={() => navigate('/diet-plan')}
            className="flex-1 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold text-slate-500 dark:text-neutral-400 cursor-pointer">
            Rencana Diet
          </button>
          <button onClick={() => {}}
            className="flex-1 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold bg-white dark:bg-[#1e1e1e] text-[#0ea5e9] shadow-sm">
            Rekomendasi Swaps
          </button>
        </section>

        {/* Top Banner Card (Image 7) */}
        <section className="relative bg-gradient-to-r from-[#177eac] to-[#0ea5e9] rounded-2xl overflow-hidden p-6 text-white min-h-[145px] flex flex-col justify-center shadow-md">
          <div className="relative z-10 space-y-1">
            <span className="text-[9px] font-bold tracking-wider text-sky-100 uppercase block">DAILY GOAL TRACKER</span>
            <h2 className="text-base font-bold">Capai Defisit Lebih Mudah</h2>
            <p className="text-[11px] text-sky-100 mt-1 leading-relaxed max-w-[80%]">
              Ganti pilihanmu dengan alternatif yang lebih rendah kalori namun tetap mengenyangkan.
            </p>
          </div>
        </section>

        {/* Opsi Hari Ini Section (Image 7) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200">
            <Sparkles className="w-5 h-5 text-[#006591]" />
            <h3 className="text-sm font-bold">Opsi Hari Ini</h3>
          </div>

          <div className="flex flex-col gap-3">
            {swaps.map((s, idx) => (
              <div key={idx} className="glass-card bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-neutral-800 transition-all hover:translate-x-0.5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.iconBg}`}>
                    <s.Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <span>{s.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[#006591] dark:text-[#89ceff]">{s.to}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-neutral-500 font-semibold mt-0.5">
                      {s.fromCal} → {s.toCal} <span className="text-[#de8712] font-bold">(hemat {s.saveCal} kal)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-extrabold px-2 py-1 rounded-full ${s.badgeStyle} scale-95`}>
                    {s.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tips Diet Hari Ini Card (Image 7) */}
        <section className="bg-[#eaeef4] dark:bg-neutral-900/50 p-5 rounded-2xl flex items-start gap-4 border border-slate-200/20">
          <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 text-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-neutral-200">Tips Diet Hari Ini</h4>
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed font-semibold">
              Cobalah mengganti cemilan soremu dengan buah-buahan segar. Selain rendah kalori, serat dalam buah membuatmu merasa kenyang lebih lama hingga jam makan malam.
            </p>
          </div>
        </section>

        {/* Visualisasi Porsi Ideal Banner Card (Image 7) */}
        <section className="relative rounded-2xl overflow-hidden h-44 shadow-md group cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80"
            alt="Ideal Portion"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Black/dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-5 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">Visualisasi Porsi Ideal</h4>
            <p className="text-[11px] text-slate-200 mt-1 leading-relaxed max-w-[90%]">
              Lihat bagaimana 500 kalori terlihat berbeda antara nasi putih dan merah.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
