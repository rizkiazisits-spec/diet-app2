import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { updateProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Camera, 
  Target, 
  Flame, 
  Activity, 
  CheckCircle2, 
  ShieldCheck 
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
      if (user.goal) setGoalType(user.goal.toLowerCase().includes('gain') || user.goal.toLowerCase().includes('surplus') ? 'gain' : user.goal.toLowerCase().includes('maintain') ? 'maintain' : 'defisit');
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
      setUser(res.data);
      localStorage.setItem('profile_name', payload.name);
      localStorage.setItem('profile_avatar', avatarUrl);
      localStorage.setItem('profile_goal', payload.goal);
      localStorage.setItem('profile_deadline', deadline);
      localStorage.setItem('onboarding_completed', 'true');
      navigate('/');
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
      // Fallback redirect
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
    <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] text-[#171c20] dark:text-[#f8fafc] font-sans flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-xl bg-white dark:bg-[#1e1e1e] rounded-3xl shadow-xl border border-slate-100 dark:border-neutral-800 overflow-hidden flex flex-col">
        
        {/* Header with Step Indicator & Skip Button */}
        <div className="p-6 border-b border-slate-100 dark:border-neutral-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/40">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#0ea5e9]">
              LANGKAH {step} DARI 3
            </span>
            <h1 className="text-lg font-bold text-slate-800 dark:text-neutral-100 mt-0.5">
              {step === 1 && 'Data Fisik & Profil'}
              {step === 2 && 'Pilih Target Diet'}
              {step === 3 && 'Rencana & Hasil Kalkulasi'}
            </h1>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Lewati (Nanti Saja)
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-neutral-800 h-1.5">
          <div
            className="bg-gradient-to-r from-[#006591] to-[#0ea5e9] h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
          
          {/* STEP 1: PROFIL & DATA FISIK */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Avatar Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                  Foto Profil (Pilih Avatar atau Upload)
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0ea5e9] shadow-md"
                    />
                    <label className="absolute bottom-0 right-0 w-6 h-6 bg-[#0ea5e9] text-white rounded-full flex items-center justify-center cursor-pointer shadow hover:bg-[#0284c7] transition-all">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-semibold focus:outline-none focus:border-[#0ea5e9]"
                    />
                  </div>
                </div>

                {/* Preset Avatar Selection */}
                <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        avatarUrl === av ? 'border-[#0ea5e9] scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
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
                      className={`py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">
                    Umur (thn)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold text-center focus:outline-none focus:border-[#0ea5e9]"
                  />
                </div>
              </div>

              {/* Ideal Weight & BMI Live Card */}
              {wVal > 0 && hVal > 0 && (
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">BMI Anda</span>
                    <span className={`text-xs font-bold ${bmiColor}`}>{bmi} ({bmiCategory})</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-neutral-800 pt-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Berat Badan Ideal</span>
                    <span className="text-xs font-extrabold text-[#006591] dark:text-[#89ceff]">
                      {idealCenter} kg <span className="text-[10px] font-normal text-slate-400">({idealMin} - {idealMax} kg)</span>
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
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                  Pilih Tujuan Utama Anda
                </label>

                <div className="space-y-3">
                  {[
                    {
                      id: 'defisit',
                      title: '📉 Defisit Kalori (Turun Berat Badan)',
                      desc: 'Mengurangi asupan kalori untuk membakar lemak secara konsisten.',
                      badge: 'Populer',
                      color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
                    },
                    {
                      id: 'maintain',
                      title: '⚖️ Pertahankan Berat Badan',
                      desc: 'Menjaga asupan kalori seimbang dengan kebutuhan harian tubuh.',
                      badge: 'Sehat',
                      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    },
                    {
                      id: 'gain',
                      title: '📈 Surplus Kalori (Naik BB / Gain Mass)',
                      desc: 'Menambah asupan kalori untuk menaikkan berat badan atau massa otot.',
                      badge: 'Bulking',
                      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20'
                    }
                  ].map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setGoalType(g.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                        goalType === g.id
                          ? g.color + ' shadow-sm'
                          : 'border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-neutral-100">{g.title}</h4>
                        {goalType === g.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Weight & Timeframe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                    Target BB (kg)
                  </label>
                  <input
                    type="number"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder={idealCenter.toString()}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold focus:outline-none focus:border-[#0ea5e9]"
                  />
                  <p className="text-[10px] text-slate-400">Ideal: {idealCenter} kg</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                    Target Waktu
                  </label>
                  <select
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-900 text-sm font-bold focus:outline-none focus:border-[#0ea5e9]"
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

          {/* STEP 3: RINGKASAN & HASIL KALKULASI */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-br from-[#006591] to-[#0ea5e9] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <Sparkles className="w-16 h-16 absolute -right-2 -bottom-2 text-white/10" />
                <span className="text-[10px] font-extrabold tracking-wider uppercase text-sky-200 block">
                  REKOMENDASI PERSONAL
                </span>
                <h3 className="text-2xl font-black mt-1">
                  {recommendedCalories.toLocaleString('id-ID')} <span className="text-xs font-medium text-sky-100">kcal / hari</span>
                </h3>
                <p className="text-xs text-sky-100 mt-2 leading-relaxed">
                  Target harian untuk mencapai berat badan <strong>{targetWeight} kg</strong> dari <strong>{weight} kg</strong> dalam waktu {deadline}.
                </p>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">BMR (Metabolisme Dasar)</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-neutral-200 mt-1 block">
                    {Math.round(bmr)} <span className="text-xs text-slate-400 font-medium">kcal</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-neutral-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">TDEE (Kebutuhan Total)</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-neutral-200 mt-1 block">
                    {tdee} <span className="text-xs text-slate-400 font-medium">kcal</span>
                  </span>
                </div>
              </div>

              {/* Profile Summary Pill */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-neutral-200">{name || 'Pengguna'}</h5>
                    <p className="text-[10px] text-slate-400">{gender === 'laki-laki' ? 'Laki-Laki' : 'Perempuan'} • {age} thn • {height} cm / {weight} kg</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#0ea5e9] bg-[#0ea5e9]/10 px-2.5 py-1 rounded-full">
                  BB Ideal: {idealCenter} kg
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-neutral-400 hover:text-slate-800 transition-colors px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 cursor-pointer"
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
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#0ea5e9] hover:bg-[#0284c7] px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Lanjut <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#006591] to-[#0ea5e9] hover:opacity-95 px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Mulai Perjalanan Dietku'} <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
