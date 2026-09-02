import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import History from './pages/History';
import DietPlan from './pages/DietPlan';
import Rekomendasi from './pages/Rekomendasi';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';

function ProtectedLayout() {
  const { token, user, loading } = useAuth();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Memuat profil...</span>
        </div>
      </div>
    );
  }

  const isCompleted = 
    localStorage.getItem('onboarding_completed') === 'true' || 
    sessionStorage.getItem('onboarding_completed') === 'true' || 
    Boolean(user?.berat_badan && user?.tinggi_badan);

  if (!isCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (location.pathname === '/onboarding') {
    return <Outlet />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function GuestOnly() {
  const { token, user, loading } = useAuth();
  if (token) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#f6faff] dark:bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-500 dark:text-neutral-400">Memuat profil...</span>
          </div>
        </div>
      );
    }
    const isCompleted = 
      localStorage.getItem('onboarding_completed') === 'true' || 
      sessionStorage.getItem('onboarding_completed') === 'true' || 
      Boolean(user?.berat_badan && user?.tinggi_badan);
    if (!isCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest-only routes */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="/diet-plan" element={<DietPlan />} />
            <Route path="/rekomendasi" element={<Rekomendasi />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
