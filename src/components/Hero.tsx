import React from 'react';
import { ActiveTab, StudentProfile } from '../types';
import {
  Sparkles,
  BookOpen,
  Calculator,
  ArrowRight,
  GraduationCap,
  UploadCloud
} from 'lucide-react';
import { VTU_NOTIFICATIONS } from '../data/apsData';

interface Props {
  profile: StudentProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAiChat: () => void;
  onOpenUpload?: () => void;
}

export const Hero: React.FC<Props> = ({ profile, setActiveTab, onOpenAiChat, onOpenUpload }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-10 pb-16 md:py-20 border-b border-slate-800">
      {/* Background radial accent glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-teal-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            VTU Academic Repository • Real-time Student PDF Portal
          </div>
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight md:leading-none">
            APS Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">&amp; Academic Vault</span>
          </h1>
          {/* Subtitle */}
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Direct student &amp; faculty uploaded notes, lab manuals, and previous year question papers. Select your branch and semester to view or upload materials instantly.
          </p>
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('notes')}
              className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer group"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Notes</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-teal-600" />
                <span>Upload PDF</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('sgpa')}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-teal-400" />
              <span>SGPA / CGPA</span>
            </button>
            <button
              onClick={onOpenAiChat}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Gemini</span>
            </button>
          </div>
          {/* Personalized User Context Bar */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-teal-400" />
              <span>
                Personalized for: <strong className="text-white">{profile.name}</strong> ({profile.branch}, Sem {profile.semester}, {profile.scheme} Scheme)
              </span>
            </div>
          </div>
        </div>

        {/* Feature Tags Ticker */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            {[
              '2025 Scheme Notes',
              '2022 Scheme Notes',
              'Model Question Papers',
              'Question Banks',
              'Lab Programs (C/Java/Python/Git)',
              'SGPA & CGPA Calculators',
              'VTU Results',
              'Exam Time Tables',
              'Viva Questions',
            ].map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Live VTU Circulars Ticker */}
        <div className="mt-8 bg-slate-800/50 rounded-2xl border border-slate-700/60 p-4 max-w-4xl mx-auto flex items-center gap-3">
          <span className="shrink-0 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-400 text-[11px] font-bold uppercase tracking-wider">
            VTU Update
          </span>
          <div className="overflow-hidden flex-1">
            <p className="text-xs text-slate-300 font-medium truncate">
              {VTU_NOTIFICATIONS[0].title} ({VTU_NOTIFICATIONS[0].date})
            </p>
          </div>
          <a
            href={VTU_NOTIFICATIONS[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-teal-400 hover:underline shrink-0 font-semibold hidden sm:inline"
          >
            Read Circular &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};
