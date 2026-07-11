import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { updateProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calculator, Calendar, Activity, Heart, Apple, Shield } from 'lucide-react';

export default function DietPlan() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('laki-laki');
  const [targetWeight, setTargetWeight] = useState('');
  const [deadline, setDeadline] = useState('');
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setWeight(user.berat_badan || '');
      setHeight(user.tinggi_badan || '');
      setAge(user.umur || '25');
      setGender(user.jenis_kelamin || 'laki-laki');
      setTargetWeight(user.goal || '');
      setDeadline(user.deadline || '');
      
      if (user.berat_badan && user.tinggi_badan && user.umur) {
        const w = parseFloat(user.berat_badan);
        const h = parseFloat(user.tinggi_badan);
        const a = parseInt(user.umur);
        const g = user.jenis_kelamin || 'laki-laki';
        
        const bmr = g === 'laki-laki'
          ? (10 * w) + (6.25 * h) - (5 * a) + 5
          : (10 * w) + (6.25 * h) - (5 * a) - 161;
          
        const tdee = Math.round(bmr * 1.375);
        const target = tdee - 500;
        
        setResult({ bmr: Math.round(bmr), tdee, target });
        setCalculated(true);
      }
    }
  }, [user]);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (!weight || !height || !age) return;
    
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    const bmr = gender === 'laki-laki'
      ? (10 * w) + (6.25 * h) - (5 * a) + 5
      : (10 * w) + (6.25 * h) - (5 * a) - 161;
      
    const tdee = Math.round(bmr * 1.375);
    const target = tdee - 500;
    
    setResult({ bmr: Math.round(bmr), tdee, target });
    setCalculated(true);

    setSaving(true);
    try {
      const payload = {
        berat_badan: w,
        tinggi_badan: h,
        umur: a,
        jenis_kelamin: gender,
        goal: targetWeight || user?.goal || '',
        deadline: deadline || user?.deadline || ''
      };
      const res = await updateProfile(payload);
      setUser(res.data);
      if (targetWeight) localStorage.setItem('profile_goal', targetWeight);
      if (deadline) localStorage.setItem('profile_deadline', deadline);
    } catch (err) {
      console.error("Gagal menyimpan rencana diet:", err);
    }
    setSaving(false);
  };

  // Calculate BMI
  const wVal = parseFloat(weight);
  const hVal = parseFloat(height) / 100;
  const bmi = wVal && hVal ? (wVal / (hVal * hVal)).toFixed(1) : null;
  
  let bmiCategory = '';
  let bmiColor = '';
  if (bmi) {
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) {
      bmiCategory = 'Kekurangan Berat (Underweight)';
      bmiColor = 'text-amber-500';
    } else if (bmiNum < 25) {
      bmiCategory = 'Normal (Ideal)';
      bmiColor = 'text-emerald-500';
    } else if (bmiNum < 30) {
      bmiCategory = 'Kelebihan Berat (Overweight)';
      bmiColor = 'text-orange-500';
    } else {
      bmiCategory = 'Obesitas (Obese)';
      bmiColor = 'text-red-500';
    }
  }

  // Macronutrients Split Target
  const targetCalories = result?.target || 1500;
  const proteinGrams = wVal ? Math.round(wVal * 1.8) : 100;
  const fatGrams = Math.round((targetCalories * 0.25) / 9);
  const carbGrams = Math.max(0, Math.round((targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4));

  let recommendationText = '';
  if (targetWeight && wVal) {
    const tw = parseFloat(targetWeight);
    if (wVal > tw) {
      recommendationText = `Berdasarkan data klinis, berat badan Anda saat ini (${wVal} kg) berada di atas target Anda (${tw} kg). Disarankan untuk menjalankan diet defisit kalori sehat sekitar ${targetCalories} kcal/hari. Pastikan asupan protein tercapai di angka ${proteinGrams}g untuk mencegah penyusutan massa otot, kurangi konsumsi karbohidrat olahan, dan lakukan kombinasi latihan beban serta kardio 3-4 kali seminggu.`;
    } else if (wVal < tw) {
      recommendationText = `Berat badan saat ini (${wVal} kg) berada di bawah target Anda (${tw} kg). Anda disarankan untuk melakukan diet surplus kalori sehat sekitar ${targetCalories + 800} kcal/hari (+300 kcal di atas TDEE Anda). Fokuslah pada makanan padat nutrisi, tingkatkan porsi karbohidrat kompleks, serta rutin melakukan latihan kekuatan (strength training) agar penambahan berat badan didominasi oleh massa otot berkualitas.`;
    } else {
      recommendationText = `Luar biasa! Berat badan Anda saat ini (${wVal} kg) sudah sesuai dengan target Anda (${tw} kg). Anda disarankan menjaga kestabilan berat badan dengan mengonsumsi kalori seimbang di kisaran TDEE Anda (${result?.tdee} kcal/hari).`;
    }
  } else {
    recommendationText = "Lengkapi data berat badan dan target berat badan Anda untuk mendapatkan rekomendasi klinis yang personal. Disarankan menjaga asupan gizi seimbang dan melakukan aktivitas fisik minimal 30 menit per hari.";
  }

  return (
    <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] pb-28 md:pb-8 text-[#171c20] dark:text-[#f8fafc] font-sans">
      {/* Header Bar */}
      <header className="flex items-center justify-between px-5 py-4 w-full bg-[#f6faff] dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-600 dark:text-neutral-300 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#006591] dark:text-[#89ceff]">Rencana Diet</h1>
        </div>
      </header>

      <main className="p-5 space-y-5">
        {/* Sub-tab navigation switcher */}
        <section className="bg-[#eaeef4] dark:bg-neutral-900/80 p-1 rounded-2xl flex w-full border border-slate-200/20">
          <button onClick={() => {}}
            className="flex-1 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold bg-white dark:bg-[#1e1e1e] text-[#0ea5e9] shadow-sm">
            Rencana Diet
          </button>
          <button onClick={() => navigate('/rekomendasi')}
            className="flex-1 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold text-slate-500 dark:text-neutral-400 cursor-pointer">
            Rekomendasi Swaps
          </button>
        </section>

        {/* Top Banner Card (Image 4) */}
        <section className="relative bg-gradient-to-r from-[#177eac] to-[#0ea5e9] rounded-2xl overflow-hidden p-6 text-white min-h-[140px] flex flex-col justify-center shadow-md">
          {/* Citrus Image Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=300&q=80"
              alt="Citrus"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-[65%]">
            <h2 className="text-base font-bold">Analisis Personal</h2>
            <p className="text-[11px] text-sky-100 mt-1 leading-relaxed">
              Tentukan target nutrisi harian Anda berdasarkan profil klinis.
            </p>
          </div>
        </section>

        {/* Form Container (Image 4) */}
        <section className="glass-card bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100 dark:border-neutral-800">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Berat Badan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Berat Badan (kg)</label>
                <input
                  type="number"
                  placeholder="00"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input-premium w-full h-11 px-4 text-sm font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none"
                />
              </div>

              {/* Tinggi Badan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  placeholder="000"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input-premium w-full h-11 px-4 text-sm font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none"
                />
              </div>

              {/* Usia */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Usia</label>
                <input
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="input-premium w-full h-11 px-4 text-sm font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-premium w-full h-11 px-4 text-sm font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none appearance-none"
                >
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              {/* Target Berat */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Target Berat (kg)</label>
                <input
                  type="number"
                  placeholder="00"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="input-premium w-full h-11 px-4 text-sm font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400">Deadline</label>
                <div className="relative">
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="input-premium w-full h-11 pl-4 pr-10 text-xs font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none text-slate-700 dark:text-neutral-300"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hitung Defisit Button */}
            <button
              type="submit"
              className="w-full h-12 mt-4 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center gap-2 font-bold shadow-md hover:bg-[#0284c7] hover:scale-[1.01] active:scale-[0.99] transition-all text-sm cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Hitung Defisit</span>
            </button>
          </form>
        </section>

        {/* Calculation Result Outputs */}
        {calculated && result && (
          <div className="space-y-5">
            {/* Card 1: BMR & TDEE & Target */}
            <section className="glass-card bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#006591] dark:text-[#89ceff]" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Kebutuhan Kalori</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f1f4f9] dark:bg-neutral-800 p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">BMR (Metabolisme Basal)</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-neutral-200">{result.bmr} kcal</span>
                </div>
                <div className="bg-[#f1f4f9] dark:bg-neutral-800 p-4 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">TDEE (Kebutuhan Aktivitas)</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-neutral-200">{result.tdee} kcal</span>
                </div>
                <div className="col-span-2 bg-[#e0f2fe] dark:bg-sky-950/20 p-4 rounded-xl border border-sky-100 dark:border-sky-900/30">
                  <span className="text-[9px] font-bold text-[#0ea5e9] block uppercase">Target Kalori Harian</span>
                  <span className="text-xl font-extrabold text-[#0ea5e9] mt-1 block">{result.target} kcal</span>
                </div>
              </div>
            </section>

            {/* Card 2: BMI / Status Komposisi Tubuh */}
            {bmi && (
              <section className="glass-card bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Komposisi Tubuh (IMT / BMI)</h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#f1f4f9] dark:bg-neutral-800 rounded-xl">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Indeks Massa Tubuh</span>
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-neutral-200 mt-1 block">{bmi}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Kategori</span>
                    <span className={`text-sm font-extrabold ${bmiColor} mt-1 block`}>{bmiCategory}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Card 3: Target Makronutrisi Harian */}
            <section className="glass-card bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl border border-slate-100 dark:border-neutral-800 space-y-4">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Target Nutrisi Makro Harian</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Protein */}
                <div className="bg-[#ecfdf5] dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-emerald-600 block uppercase">PROTEIN</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-1">{proteinGrams}g</span>
                  <span className="text-[9px] text-emerald-500/80 mt-0.5">{proteinGrams * 4} kcal</span>
                </div>
                {/* Lemak */}
                <div className="bg-[#fffbeb] dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100/50 dark:border-amber-900/30 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-amber-600 block uppercase">LEMAK</span>
                  <span className="text-sm font-extrabold text-amber-600 mt-1">{fatGrams}g</span>
                  <span className="text-[9px] text-amber-500/80 mt-0.5">{fatGrams * 9} kcal</span>
                </div>
                {/* Karbohidrat */}
                <div className="bg-[#f0f9ff] dark:bg-sky-950/20 p-3 rounded-xl border border-sky-100/50 dark:border-sky-900/30 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-[#0ea5e9] block uppercase">KARBOHIDRAT</span>
                  <span className="text-sm font-extrabold text-[#0ea5e9] mt-1">{carbGrams}g</span>
                  <span className="text-[9px] text-sky-400 mt-0.5">{carbGrams * 4} kcal</span>
                </div>
              </div>
            </section>

            {/* Card 4: Analisis & Rekomendasi Diet */}
            <section className="glass-card bg-[#f8fafc] dark:bg-[#151515] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800/80 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">Rekomendasi Diet Personal</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed font-medium">
                {recommendationText}
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
