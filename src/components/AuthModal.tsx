import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  User,
  Lock,
  GraduationCap,
  Building,
  Hash,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { StudentUser } from '../types';

interface Props {
  isOpen: boolean;
  isRequired?: boolean; // When true, cannot close without login
  onClose?: () => void;
  onLoginSuccess: (user: StudentUser, isAdmin: boolean) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  isRequired = true,
  onClose,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regCollege, setRegCollege] = useState('');
  const [regBranch, setRegBranch] = useState('CSE-ISE');
  const [regScheme, setRegScheme] = useState<'2022' | '2025'>('2025');
  const [regSemester, setRegSemester] = useState(3);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          password: cleanPass,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      const isAdmin = data.role === 'admin' || cleanUser.toUpperCase() === 'SHRAVANENDARENU';

      // Store in localStorage for persistent session
      localStorage.setItem('vtu_current_user', JSON.stringify(data.user));

      setSuccessMsg(isAdmin ? 'Admin Credentials Verified! Opening Admin Panel...' : 'Login successful! Welcome to APS Notes.');
      setTimeout(() => {
        onLoginSuccess(data.user, isAdmin);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUser = regUsername.trim();
    const cleanPass = regPassword.trim();

    if (cleanUser.toUpperCase() === 'SHRAVANENDARENU') {
      setError('This username is reserved for administration.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          username: cleanUser,
          password: cleanPass,
          usn: regUsn.trim().toUpperCase(),
          college: regCollege.trim() || 'VTU Affiliated College',
          branch: regBranch,
          scheme: regScheme,
          semester: Number(regSemester),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try a different username.');
      }

      // Store in localStorage for persistent session
      localStorage.setItem('vtu_current_user', JSON.stringify(data.user));

      setSuccessMsg('Account registered successfully in database! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(data.user, false);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-teal-900 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto mb-3 text-teal-300 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">VTU Student Academic Portal</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Please log in or register to access verified notes, lab programs, and university syllabus.
          </p>

          {!isRequired && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Student Registration</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  Username
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter your student or admin username"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-teal-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-slate-900 hover:from-teal-500 hover:to-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In to Portal
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-500">
                  New student?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('register')}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Register here once
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* STUDENT REGISTRATION FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-teal-600" />
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. rahul_cs"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-teal-600" />
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
                    USN (Optional)
                  </label>
                  <input
                    type="text"
                    value={regUsn}
                    onChange={(e) => setRegUsn(e.target.value.toUpperCase())}
                    placeholder="e.g. 1AP23CS045"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Branch</label>
                  <select
                    value={regBranch}
                    onChange={(e) => setRegBranch(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="CSE-ISE">CSE / ISE</option>
                    <option value="AIML-DS">AIML / AIDS</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="Mech">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Scheme</label>
                  <select
                    value={regScheme}
                    onChange={(e) => setRegScheme(e.target.value as '2022' | '2025')}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="2025">2025 (NEP)</option>
                    <option value="2022">2022 Scheme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
                  College Name
                </label>
                <input
                  type="text"
                  value={regCollege}
                  onChange={(e) => setRegCollege(e.target.value)}
                  placeholder="e.g. APS College of Engineering, Bangalore"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 text-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving registration to database...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Complete Registration &amp; Enter Portal
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-[11px] text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-teal-700 font-bold hover:underline cursor-pointer"
                  >
                    Sign in with username &amp; password
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
