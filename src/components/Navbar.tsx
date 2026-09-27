import React, { useState } from 'react';
import { ActiveTab, StudentProfile, StudentUser } from '../types';
import {
  BookOpen,
  Search,
  Menu,
  X,
  Sparkles,
  UploadCloud,
  Heart,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldAlert
} from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  currentUser?: StudentUser | null;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenSupportUs: () => void;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  profile,
  currentUser,
  onOpenProfile,
  onOpenSearch,
  onOpenUpload,
  onOpenSupportUs,
  onOpenAuthModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItemClass = (tab: ActiveTab) =>
    `px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-slate-900 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                    APS Notes
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase font-mono">
                    VTU
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">
                  Notes, Papers &amp; Academic Tools
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => setActiveTab('home')} className={navItemClass('home')}>
              Home
            </button>
            <button onClick={() => setActiveTab('notes')} className={navItemClass('notes')}>
              VTU Notes
            </button>
            <button onClick={() => setActiveTab('labs')} className={navItemClass('labs')}>
              Laboratory
            </button>
            <button onClick={() => setActiveTab('sgpa')} className={navItemClass('sgpa')}>
              SGPA Calculator
            </button>
            <button onClick={() => setActiveTab('cgpa')} className={navItemClass('cgpa')}>
              CGPA Calculator
            </button>
            <button onClick={() => setActiveTab('syllabus')} className={navItemClass('syllabus')}>
              Syllabus
            </button>
            <button onClick={() => setActiveTab('papers')} className={navItemClass('papers')}>
              Papers
            </button>

            {/* ONLY VISIBLE IF LOGGED IN AS ADMIN - HIDDEN FROM STUDENTS */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-rose-700 text-white shadow-md'
                    : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('support')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'support'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-teal-700 hover:bg-teal-50 border border-teal-200/80 bg-teal-50/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Support</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </nav>

          {/* Actions on Right */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search (Cmd + K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Upload Action */}
            <button
              onClick={onOpenUpload}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload Notes</span>
            </button>

            {/* Support Us */}
            <button
              onClick={onOpenSupportUs}
              className="hidden md:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Support Us</span>
            </button>

            {/* Student Auth / Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenProfile}
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer text-left"
                  title="Your Profile"
                >
                  <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-rose-700' : 'bg-slate-900'}`}>
                    {currentUser.name.charAt(0) || 'S'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-[11px] font-bold text-slate-800 leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </div>
                    <div className="text-[9px] font-semibold text-teal-700 leading-none">
                      {isAdmin ? 'Administrator' : `${currentUser.branch} (Sem ${currentUser.semester})`}
                    </div>
                  </div>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Student Sign In</span>
                </button>
              )
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {currentUser && (
            <div className="p-3 bg-slate-50 rounded-xl mb-3 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <div className="text-xs font-bold text-slate-800">
                  {currentUser.name} • {isAdmin ? 'Admin' : `${currentUser.branch} Sem ${currentUser.semester}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="text-[11px] text-teal-700 font-bold hover:underline"
                >
                  Profile
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('home');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'home' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('notes');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'notes' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              VTU Notes
            </button>
            <button
              onClick={() => {
                setActiveTab('labs');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'labs' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              Laboratory
            </button>
            <button
              onClick={() => {
                setActiveTab('sgpa');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'sgpa' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              SGPA Calculator
            </button>
            <button
              onClick={() => {
                setActiveTab('cgpa');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'cgpa' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              CGPA Calculator
            </button>
            <button
              onClick={() => {
                setActiveTab('syllabus');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'syllabus' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              VTU Syllabus
            </button>
            <button
              onClick={() => {
                setActiveTab('papers');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'papers' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              VTU Papers
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-800'}`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('support');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${activeTab === 'support' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-800 border border-teal-200'}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" /> AI Support
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenUpload();
              }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Upload Notes
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSupportUs();
              }}
              className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
            >
              Support Us
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

