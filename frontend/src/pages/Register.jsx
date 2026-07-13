import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister, login as apiLogin } from '../api';
import { useAuth } from '../AuthContext';
import { Mail, Lock, ShieldAlert, Eye, EyeOff, Utensils, Grid } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Password tidak cocok'); return; }
    if (!agree) { setError('Anda harus menyetujui syarat & ketentuan'); return; }
    setError('');
    setLoading(true);
    try {
      await apiRegister(email, password);
      // Auto-login after register
      const res = await apiLogin(email, password);
      login(res.data.access_token, res.data.refresh_token);
      navigate('/');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string'
        ? detail
        : (Array.isArray(detail) ? detail.map((d) => d.msg).join(', ') : 'Registrasi gagal. Email mungkin sudah terdaftar.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f0f4fa] dark:bg-[#0a0a0a] min-h-screen flex items-center justify-center p-5 font-sans text-[#171c20] dark:text-[#f8fafc] transition-colors duration-200 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-indigo-150/30 dark:from-sky-950/10 dark:to-transparent pointer-events-none" />

      <main className="w-full max-w-[420px] relative z-10">
        {/* Logo and Intro (Image 8) */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0ea5e9] text-white mb-4 shadow-md">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#006591] dark:text-[#89ceff]">DietTracker</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 font-semibold max-w-[280px] mt-1.5 leading-relaxed">
            Mulai perjalanan hidup sehatmu hari ini.
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-card bg-white dark:bg-[#1e1e1e] p-8 w-full border border-slate-100 dark:border-neutral-800 rounded-3xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-lg border border-red-100 dark:border-red-900/50">{error}</div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-premium w-full h-11 pl-11 pr-4 text-xs font-semibold bg-[#f0f4fa] dark:bg-neutral-800 border-none"
                  type="email" placeholder="nama@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-premium w-full h-11 pl-11 pr-12 text-xs font-semibold bg-[#f0f4fa] dark:bg-neutral-800 border-none"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 block">Konfirmasi Password</label>
              <div className="relative">
                <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input-premium w-full h-11 pl-11 pr-4 text-xs font-semibold bg-[#f0f4fa] dark:bg-neutral-800 border-none"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 text-[#0ea5e9] border-slate-300 rounded focus:ring-[#0ea5e9] mt-0.5"
              />
              <label htmlFor="agree" className="text-[10px] text-slate-500 dark:text-neutral-400 leading-normal font-semibold">
                Saya menyetujui <span className="text-[#0ea5e9] font-bold hover:underline cursor-pointer">Syarat & Ketentuan</span> serta <span className="text-[#0ea5e9] font-bold hover:underline cursor-pointer">Kebijakan Privasi</span> yang berlaku.
              </label>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading}
              className="w-full h-12 mt-3 rounded-full bg-[#0ea5e9] text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 hover:bg-[#0284c7] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer">
              <span>{loading ? 'Mendaftar...' : 'DAFTAR'}</span>
            </button>
          </form>

          {/* Already have account */}
          <p className="text-center mt-5 text-xs text-slate-500 dark:text-neutral-400 font-semibold">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-[#0ea5e9] hover:underline ml-1">Login</Link>
          </p>

          {/* Social Continue divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-slate-200 dark:bg-neutral-800" />
            <span className="relative bg-white dark:bg-[#1e1e1e] px-3 text-[10px] font-extrabold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
              Atau daftar dengan
            </span>
          </div>

          {/* Circular Social Buttons (Image 8) */}
          <div className="flex justify-center gap-4">
            {/* Google */}
            <button type="button" className="w-11 h-11 rounded-full border border-slate-200 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 shadow-sm transition-all cursor-pointer">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            </button>
            {/* Apple */}
            <button type="button" className="w-11 h-11 rounded-full border border-slate-200 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 shadow-sm transition-all cursor-pointer">
              <svg className="w-4 h-4 fill-current text-slate-800 dark:text-neutral-200" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.09 1.15-.4 2.81-1.33z"/>
              </svg>
            </button>
            {/* Grid */}
            <button type="button" className="w-11 h-11 rounded-full border border-slate-200 dark:border-neutral-800 flex items-center justify-center bg-white dark:bg-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-700 shadow-sm transition-all cursor-pointer">
              <Grid className="w-4.5 h-4.5 text-slate-650" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
