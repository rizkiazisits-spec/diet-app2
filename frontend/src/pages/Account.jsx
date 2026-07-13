import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { updateProfile } from '../api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Camera, Scale, Ruler, Calendar, ChevronDown, Bell, Moon, LogOut, Check, Target, User, Flame, Utensils, CheckCircle2 } from 'lucide-react';

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  
  // Dynamic card preset theme selection (from Image 3)
  const [preset, setPreset] = useState('amber'); // obsidian, indigo, emerald, rose, amber
  const [verified, setVerified] = useState(true); // interactive verified badge

  const [form, setForm] = useState({
    name: user?.name || localStorage.getItem('profile_name') || 'Cakajiz56',
    email: user?.email || 'cakajiz56@gmail.com',
    avatarUrl: user?.avatar_url || localStorage.getItem('profile_avatar') || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&h=300&q=80',
    goal: user?.goal || localStorage.getItem('profile_goal') || 'Lean Muscle Gain',
    deadline: user?.deadline || localStorage.getItem('profile_deadline') || '2024-12-31',
    weight: user?.berat_badan || 62,
    height: user?.tinggi_badan || 168,
    age: user?.umur || 29,
    gender: user?.jenis_kelamin === 'perempuan' ? 'female' : 'male'
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatarUrl: user.avatar_url || prev.avatarUrl,
        goal: user.goal || prev.goal,
        deadline: user.deadline || prev.deadline,
        weight: user.berat_badan || prev.weight,
        height: user.tinggi_badan || prev.height,
        age: user.umur || prev.age,
        gender: user.jenis_kelamin === 'perempuan' ? 'female' : 'male'
      }));
    }
  }, [user]);
  
  const [saving, setSaving] = useState(false);

  const isDark = document.documentElement.classList.contains('dark');
  const [dark, setDark] = useState(isDark);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('avatar-upload-input').click();
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        avatar_url: form.avatarUrl,
        goal: form.goal,
        deadline: form.deadline,
        berat_badan: Number(form.weight),
        tinggi_badan: Number(form.height),
        umur: Number(form.age),
        jenis_kelamin: form.gender === 'female' ? 'perempuan' : 'laki-laki'
      };
      const res = await updateProfile(payload);
      
      // Save name & avatarUrl to localStorage for persistence
      localStorage.setItem('profile_name', form.name);
      localStorage.setItem('profile_avatar', form.avatarUrl);
      localStorage.setItem('profile_goal', form.goal);
      localStorage.setItem('profile_deadline', form.deadline);
      
      setUser(res.data);
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Color mapping based on theme presets (Image 3)
  const presetColors = {
    obsidian: {
      accent: 'text-slate-400',
      border: 'border-slate-800',
      btn: 'bg-slate-800 hover:bg-slate-700 text-white',
      badge: 'bg-slate-500',
      glow: 'shadow-slate-500/10'
    },
    indigo: {
      accent: 'text-indigo-400',
      border: 'border-indigo-500/30',
      btn: 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-indigo-500/20',
      badge: 'bg-indigo-500',
      glow: 'shadow-indigo-500/10'
    },
    emerald: {
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      btn: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-500/20',
      badge: 'bg-emerald-500',
      glow: 'shadow-emerald-500/10'
    },
    rose: {
      accent: 'text-rose-400',
      border: 'border-rose-500/30',
      btn: 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-rose-500/20',
      badge: 'bg-rose-500',
      glow: 'shadow-rose-500/10'
    },
    amber: {
      accent: 'text-amber-400',
      border: 'border-amber-500/30',
      btn: 'bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-amber-500/20',
      badge: 'bg-[#f59e0b]',
      glow: 'shadow-amber-500/10'
    }
  };

  const activeTheme = presetColors[preset] || presetColors.amber;

  return (
    <div className="bg-[#f6faff] dark:bg-[#0a0a0a] min-h-screen flex flex-col pb-28 md:pb-8 text-[#171c20] dark:text-[#f8fafc] font-sans">
      {/* Header bar */}
      <header className="flex items-center justify-between px-5 py-4 w-full bg-[#f6faff] dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-600 dark:text-neutral-300 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#006591] dark:text-[#89ceff]">Profile Settings</h1>
        </div>
        
        {editing ? (
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#22c55e] text-white text-xs font-bold shadow-sm hover:bg-[#16a34a] active:scale-95 transition-all cursor-pointer">
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? 'Simpan...' : 'Simpan'}</span>
          </button>
        ) : (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0ea5e9] text-white text-xs font-bold shadow-sm hover:bg-[#0284c7] active:scale-95 transition-all cursor-pointer">
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </header>

      <main className="p-5 space-y-6 max-w-4xl mx-auto w-full">
        {/* Layout Grid: Profile Card (Left) & Settings Editor (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* LEFT: GLASSMORPHIC PROFILE CARD (matches Image 3 style) */}
          <section className={`glass-card bg-[#121212]/90 backdrop-blur-md border ${editing ? 'border-[#0ea5e9]/40' : 'border-white/10'} shadow-lg rounded-3xl p-5 text-white flex flex-col gap-4 transition-all duration-300`}>
            
            {/* Cover Image container with hover height transition */}
            <div className="relative overflow-hidden rounded-2xl h-44 hover:h-56 transition-all duration-500 ease-out group cursor-pointer">
              <img
                src={form.avatarUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
              
              {/* Hidden file input */}
              <input
                type="file"
                id="avatar-upload-input"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={!editing}
              />

              {/* Camera upload overlay button */}
              {editing && (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center border border-white/20 transition-all text-white hover:scale-105 active:scale-95 shadow-md"
                  title="Upload New Profile Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              
              {/* Interactive Verified Checkmark Badge */}
              <button 
                type="button"
                onClick={() => setVerified(!verified)}
                className={`absolute bottom-3 left-3 w-6 h-6 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 shadow-md ${
                  verified ? activeTheme.badge : 'bg-black/50 hover:bg-black/75'
                }`}
                title="Toggle Verified Checkmark"
              >
                <Check className="w-3.5 h-3.5 text-white font-black" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold tracking-tight text-white capitalize">{form.name}</h2>
                {verified && (
                  <CheckCircle2 className={`w-4 h-4 ${activeTheme.accent} fill-current text-[#121212]`} />
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">{form.email}</p>
            </div>


            {/* Structured Statistics Grid (Goal & Deadline) */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 min-w-0">
                <Target className="w-4 h-4 text-orange-500 shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <span className="text-[9px] text-slate-400 block font-bold">GOAL</span>
                  <span className="text-[11px] font-extrabold text-white truncate block" title={form.goal}>{form.goal}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <span className="text-[9px] text-slate-400 block font-bold">DEADLINE</span>
                  <span className="text-[11px] font-extrabold text-white truncate block">
                    {form.deadline ? new Date(form.deadline).toLocaleDateString('en-GB') : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Preset Button */}
            <button 
              type="button" 
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer ${activeTheme.btn}`}
            >
              Active Diet Tracker Plan
            </button>
          </section>

          {/* RIGHT: CARD CONTENT / SETTINGS EDITOR (Image 3 Style) */}
          <section className="glass-card bg-white dark:bg-[#1e1e1e] p-6 rounded-3xl border border-slate-100 dark:border-neutral-800 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-neutral-200">CARD CONTENT</h3>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">Name</label>
                <input
                  type="text"
                  disabled={!editing}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-premium w-full h-11 px-4 text-xs font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none disabled:opacity-60"
                  placeholder="Enter name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">Email Address</label>
                <input
                  type="email"
                  disabled={!editing}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-premium w-full h-11 px-4 text-xs font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none disabled:opacity-60"
                  placeholder="name@example.com"
                />
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={!editing}
                    onClick={triggerFileInput}
                    className="flex items-center gap-2 px-4 h-11 text-xs font-bold rounded-xl bg-slate-100 dark:bg-neutral-800 text-[#006591] dark:text-[#89ceff] hover:bg-slate-200 dark:hover:bg-neutral-750 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer transition-all border border-slate-200 dark:border-neutral-700"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload New Photo</span>
                  </button>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold">
                    {form.avatarUrl.startsWith('data:') ? 'Custom Photo Uploaded' : 'Using default image'}
                  </span>
                </div>
              </div>

              {/* Goal & Deadline Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">Goal</label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="input-premium w-full h-11 px-4 text-xs font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none disabled:opacity-60"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 block">Deadline</label>
                  <input
                    type="date"
                    disabled={!editing}
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="input-premium w-full h-11 px-4 text-xs font-bold bg-[#f1f4f9] dark:bg-neutral-800 border-none disabled:opacity-60 text-slate-700 dark:text-neutral-300"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* NUTRITION TARGET section (Editable inside form) */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-extrabold tracking-wider text-[#006591] dark:text-[#89ceff] uppercase px-1">NUTRITION TARGET</h3>
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 flex justify-between items-center relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">GOAL</span>
                {editing ? (
                  <input
                    type="text"
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-4 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] mt-1.5"
                  />
                ) : (
                  <span className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 mt-2 block">{form.goal}</span>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider block">DEADLINE</span>
                {editing ? (
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full h-11 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-4 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] mt-1.5"
                  />
                ) : (
                  <span className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 mt-2 block">
                    {form.deadline ? new Date(form.deadline).toLocaleDateString('en-GB') : ''}
                  </span>
                )}
              </div>
            </div>
            {/* Target Icon */}
            {!editing && (
              <div className="w-10 h-10 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center shrink-0 ml-4">
                <Target className="w-5 h-5" />
              </div>
            )}
          </div>
        </section>

        {/* Clinical Grid Metrics (Editable inside form) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Weight */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#006591]" />
              <span className="text-[10px] font-extrabold text-[#006591] dark:text-[#89ceff] uppercase tracking-wider">WEIGHT</span>
            </div>
            {editing ? (
              <input
                type="number"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: +e.target.value })}
                className="w-full h-10 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-3 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] mt-2"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-neutral-200">{form.weight}</span>
                <span className="text-xs text-slate-400 dark:text-neutral-500 font-bold">kg</span>
              </div>
            )}
          </div>

          {/* Height */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#006591]" />
              <span className="text-[10px] font-extrabold text-[#006591] dark:text-[#89ceff] uppercase tracking-wider">HEIGHT</span>
            </div>
            {editing ? (
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: +e.target.value })}
                className="w-full h-10 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-3 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] mt-2"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-neutral-200">{form.height}</span>
                <span className="text-xs text-slate-400 dark:text-neutral-500 font-bold">cm</span>
              </div>
            )}
          </div>

          {/* Age */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#006591]" />
              <span className="text-[10px] font-extrabold text-[#006591] dark:text-[#89ceff] uppercase tracking-wider">AGE</span>
            </div>
            {editing ? (
              <input
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: +e.target.value })}
                className="w-full h-10 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl px-3 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] mt-2"
              />
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-800 dark:text-neutral-200">{form.age}</span>
                <span className="text-xs text-slate-400 dark:text-neutral-500 font-bold">yrs</span>
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="glass-card bg-white dark:bg-[#1e1e1e] p-5 rounded-2xl border border-slate-100 dark:border-neutral-800 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#006591]" />
              <span className="text-[10px] font-extrabold text-[#006591] dark:text-[#89ceff] uppercase tracking-wider">GENDER</span>
            </div>
            {editing ? (
              <div className="relative mt-2">
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full h-10 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-xl pl-3 pr-8 text-xs font-bold text-slate-800 dark:text-neutral-200 focus:outline-none focus:border-[#0ea5e9] appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-extrabold text-slate-850 dark:text-neutral-200 capitalize">
                  {form.gender === 'female' ? 'Female' : 'Male'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        </section>

        {/* SYSTEM PREFERENCES section */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-extrabold tracking-wider text-[#006591] dark:text-[#89ceff] uppercase px-1">SYSTEM PREFERENCES</h3>
          <div className="glass-card bg-white dark:bg-[#1e1e1e] rounded-2xl border border-slate-100 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-850">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
                <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">Dark Mode</span>
              </div>
              <button onClick={toggleTheme}
                className={`w-11 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${dark ? 'bg-[#0ea5e9]' : 'bg-slate-200 dark:bg-neutral-800'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-300 ${dark ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-850/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-600 dark:text-neutral-300" />
                <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">Notifications</span>
              </div>
              <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/10 w-full text-left">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-[#ba1a1a]" />
                <span className="text-xs font-bold text-[#ba1a1a]">Logout Account</span>
              </div>
            </button>
          </div>
        </section>

        {/* Footer info */}
        <p className="text-center text-[10px] font-bold text-slate-300 dark:text-neutral-600 tracking-widest pt-2">
          DIETTRACKER PRO V2.4
        </p>
      </main>
    </div>
  );
}
