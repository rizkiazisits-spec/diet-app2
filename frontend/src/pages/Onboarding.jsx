import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { updateProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
];

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Profil & Body Stats
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [gender, setGender] = useState('laki-laki');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');

  // Step 2: Goal & Target
  const [goalType, setGoalType] = useState('defisit'); // 'defisit', 'maintain', 'gain'
  const [targetWeight, setTargetWeight] = useState('65');
  const [deadline, setDeadline] = useState('2 Bulan');

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.avatar_url) setAvatarUrl(user.avatar_url);
      if (user.jenis_kelamin) setGender(user.jenis_kelamin);
      if (user.umur) setAge(user.umur.toString());
      if (user.tinggi_badan) setHeight(user.tinggi_badan.toString());
      if (user.berat_badan) setWeight(user.berat_badan.toString());
      if (user.goal) {
        const gLower = user.goal.toLowerCase();
        if (gLower.includes('gain') || gLower.includes('surplus')) setGoalType('gain');
        else if (gLower.includes('maintain') || gLower.includes('pertahankan')) setGoalType('maintain');
        else setGoalType('defisit');
      }
      if (user.deadline) setDeadline(user.deadline);
    }
  }, [user]);

  // Calculations
  const wVal = parseFloat(weight) || 0;
  const hVal = parseFloat(height) || 0;
  const aVal = parseInt(age, 10) || 25;
  const targetWVal = parseFloat(targetWeight) || wVal;

  // Ideal weight range calculation (BMI 18.5 - 24.9)
  const hM = hVal / 100;
  const idealMin = hM > 0 ? Math.round(18.5 * hM * hM) : 0;
  const idealMax = hM > 0 ? Math.round(24.9 * hM * hM) : 0;
  const idealCenter = hM > 0 ? Math.round(22 * hM * hM) : 0;

  // BMI
  const bmi = wVal && hM > 0 ? (wVal / (hM * hM)).toFixed(1) : '0';
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-500';
  if (parseFloat(bmi) < 18.5) {
    bmiCategory = 'Underweight (Kekurangan BB)';
    bmiColor = 'text-amber-500';
  } else if (parseFloat(bmi) >= 25 && parseFloat(bmi) < 30) {
    bmiCategory = 'Overweight (Kelebihan BB)';
    bmiColor = 'text-orange-500';
  } else if (parseFloat(bmi) >= 30) {
    bmiCategory = 'Obesitas';
    bmiColor = 'text-rose-500';
  }

  // BMR & TDEE (Mifflin-St Jeor)
  const bmr = gender === 'laki-laki'
    ? (10 * wVal) + (6.25 * hVal) - (5 * aVal) + 5
    : (10 * wVal) + (6.25 * hVal) - (5 * aVal) - 161;

  const tdee = Math.round(bmr * 1.375);

  let recommendedCalories = tdee;
  if (goalType === 'defisit') recommendedCalories = Math.max(1200, tdee - 500);
  if (goalType === 'gain') recommendedCalories = tdee + 300;

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const payload = {
        name: name || user?.email?.split('@')[0] || 'User',
        avatar_url: avatarUrl,
        berat_badan: wVal,
        tinggi_badan: hVal,
        umur: aVal,
        jenis_kelamin: gender,
        goal: goalType === 'defisit' ? `Defisit Kalori (Target: ${targetWVal} kg)` : goalType === 'gain' ? `Surplus Kalori (Target: ${targetWVal} kg)` : `Pertahankan Berat Badan (${wVal} kg)`,
        deadline: deadline
      };
      const res = await updateProfile(payload);
      if (res.data) setUser(res.data);
      localStorage.setItem('profile_name', payload.name);
      localStorage.setItem('profile_avatar', avatarUrl);
      localStorage.setItem('profile_goal', payload.goal);
      localStorage.setItem('profile_deadline', deadline);
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    navigate('/');
  };

  return (
    <div className="bg-[#f0f4fa] dark:bg-[#0a0a0a] min-h-screen w-full flex flex-col items-center justify-center p-0 md:p-6 transition-colors duration-200 relative overflow-x-hidden">
      {/* Full Viewport App Shell Container */}
      <div className="w-full min-h-screen md:min-h-0 md:h-[90vh] md:max-h-[850px] md:max-w-[480px] bg-white dark:bg-[#1e1e1e] md:rounded-3xl md:shadow-2xl md:border md:border-slate-100 md:dark:border-neutral-800 overflow-hidden flex flex-col relative z-10">
        
        {/* Header with Step Indicator & Skip Button */}
        <div className="px-6 py-4 md:py-5 border-b border-slate-100 dark:border-neutral-800/80 flex items-center justify-between bg-white dark:bg-[#1e1e1e] shrink-0">
          <div>
            <span className="text-xs font-extrabold tracking-widest uppercase text-[#0ea5e9]">
              LANGKAH {step} DARI 3
            </span>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-neutral-100 mt-0.5">
              {step === 1 && 'Data Fisik & Profil'}
              {step === 2 && 'Pilih Target Diet'}
              {step === 3 && 'Rencana & Hasil Gizi'}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="h-10 px-4 rounded-full text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 cursor-pointer"
          >
            Lewati
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 shrink-0">
          <div
            className="bg-gradient-to-r from-[#006591] to-[#0ea5e9] h-2 transition-all duration-300 rounded-r-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content Body (Flex-1 scrollable area) */}
        <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* STEP 1: PROFIL & DATA FISIK */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Avatar & Name Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block uppercase tracking-wider">
                  Foto Profil & Nama
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#0ea5e9] shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#0ea5e9] text-white rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-[#0284c7] transition-all">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-semibold focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
                    />
                  </div>
                </div>

                {/* Preset Avatar Selection */}
                <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-1 hide-scrollbar">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        avatarUrl === av ? 'border-[#0ea5e9] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block uppercase tracking-wider">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'laki-laki', label: '👨 Laki-Laki' },
                    { id: 'perempuan', label: '👩 Perempuan' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGender(item.id)}
                      className={`h-12 rounded-xl border-2 text-base font-bold flex items-center justify-center transition-all cursor-pointer ${
                        gender === item.id
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/10 text-[#0ea5e9] shadow-sm'
                          : 'border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-400 hover:border-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Inputs: BB, TB, Umur */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-neutral-400 block text-center uppercase tracking-wider">
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-neutral-400 block text-center uppercase tracking-wider">
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-neutral-400 block text-center uppercase tracking-wider">
                    Umur (thn)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Live BMI & Ideal Weight Card */}
              {wVal > 0 && hVal > 0 && (
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600 dark:text-neutral-400">BMI Anda</span>
                    <span className={`text-base font-bold ${bmiColor}`}>{bmi} ({bmiCategory})</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-neutral-800 pt-3">
                    <span className="text-sm font-semibold text-slate-600 dark:text-neutral-400">Berat Badan Ideal</span>
                    <span className="text-base font-extrabold text-[#006591] dark:text-[#89ceff]">
                      {idealCenter} kg <span className="text-xs font-normal text-slate-400">({idealMin} - {idealMax} kg)</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: TARGET & TUJUAN DIET */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block uppercase tracking-wider">
                  Pilih Tujuan Utama Anda
                </label>

                <div className="space-y-3">
                  {[
                    {
                      id: 'defisit',
                      title: '📉 Defisit Kalori (Turun BB)',
                      desc: 'Mengurangi asupan kalori secara terukur untuk membakar lemak.',
                      color: 'border-[#0ea5e9] bg-sky-50/60 dark:bg-sky-950/30'
                    },
                    {
                      id: 'maintain',
                      title: '⚖️ Pertahankan Berat Badan',
                      desc: 'Menjaga asupan kalori seimbang dengan kebutuhan harian.',
                      color: 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    },
                    {
                      id: 'gain',
                      title: '📈 Surplus Kalori (Naik BB)',
                      desc: 'Menambah asupan kalori untuk menaikkan berat atau massa otot.',
                      color: 'border-purple-500 bg-purple-50/60 dark:bg-purple-950/30'
                    }
                  ].map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setGoalType(g.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        goalType === g.id
                          ? g.color + ' shadow-md'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-bold text-slate-800 dark:text-neutral-100">{g.title}</h4>
                        {goalType === g.id && (
                          <div className="w-6 h-6 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center shadow-sm">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Weight & Timeframe */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block uppercase tracking-wider">
                    Target BB (kg)
                  </label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder={idealCenter.toString()}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-bold focus:outline-none focus:border-[#0ea5e9]"
                  />
                  <p className="text-xs text-slate-400 font-semibold">Ideal: {idealCenter} kg</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block uppercase tracking-wider">
                    Target Waktu
                  </label>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-base font-bold focus:outline-none focus:border-[#0ea5e9]"
                  >
                    <option value="1 Bulan">1 Bulan</option>
                    <option value="2 Bulan">2 Bulan</option>
                    <option value="3 Bulan">3 Bulan</option>
                    <option value="6 Bulan">6 Bulan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RINGKASAN & HASIL GIZI */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#006591] to-[#0ea5e9] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <Sparkles className="w-20 h-20 absolute -right-3 -bottom-3 text-white/10" />
                <span className="text-xs font-extrabold tracking-widest uppercase text-sky-200 block">
                  REKOMENDASI PERSONAL
                </span>
                <h3 className="text-3xl font-black mt-2">
                  {recommendedCalories.toLocaleString('id-ID')} <span className="text-sm font-semibold text-sky-100">kcal / hari</span>
                </h3>
                <p className="text-xs text-sky-100 mt-2 leading-relaxed">
                  Target konsumsi harian untuk mencapai <strong>{targetWeight} kg</strong> dalam waktu {deadline}.
                </p>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">BMR (Dasar)</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-neutral-200 mt-1 block">
                    {Math.round(bmr)} <span className="text-xs text-slate-400 font-medium">kcal</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">TDEE (Total)</span>
                  <span className="text-xl font-extrabold text-slate-800 dark:text-neutral-200 mt-1 block">
                    {tdee} <span className="text-xs text-slate-400 font-medium">kcal</span>
                  </span>
                </div>
              </div>

              {/* Profile Summary Pill */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#0ea5e9]" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-neutral-200">{name || 'Pengguna'}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{gender === 'laki-laki' ? 'Laki-Laki' : 'Perempuan'} • {age} thn • {height} cm / {weight} kg</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Action Bar */}
        <div className="p-5 md:p-6 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-4 bg-white dark:bg-[#1e1e1e] shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="h-12 px-6 rounded-xl border border-slate-200 dark:border-neutral-700 text-sm font-bold text-slate-700 dark:text-neutral-300 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="h-12 flex-1 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all cursor-pointer"
            >
              Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#006591] to-[#0ea5e9] hover:opacity-95 text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Mulai Perjalanan Dietku'} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
