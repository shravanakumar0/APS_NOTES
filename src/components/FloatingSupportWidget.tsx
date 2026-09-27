import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { StudentProfile } from '../types';
import { GeminiSupportBot } from './GeminiSupportBot';

interface Props {
  profile: StudentProfile;
  initialTopic?: string;
}

export const FloatingSupportWidget: React.FC<Props> = ({ profile, initialTopic }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-slate-700 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Need VTU help, {profile.name.split(' ')[0]}?</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Gemini AI Support"
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-teal-700/30 hover:scale-105 transition-all cursor-pointer border-2 border-white/20"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <Sparkles className="w-6 h-6 text-teal-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
            </div>
          )}
        </button>
      </div>

      {/* Docked Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 md:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-w-[460px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          <GeminiSupportBot
            profile={profile}
            isFullPage={false}
            onClose={() => setIsOpen(false)}
            initialTopic={initialTopic}
          />
        </div>
      )}
    </>
  );
};
