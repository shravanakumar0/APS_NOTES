import React from 'react';
import { ActiveTab } from '../types';
import { UploadCloud, Heart, Bell, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import { VTU_NOTIFICATIONS } from '../data/apsData';

interface Props {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenSupportUs: () => void;
  onOpenAiChat: () => void;
}

export const Sidebar: React.FC<Props> = ({
  setActiveTab,
  onOpenUpload,
  onOpenSupportUs,
  onOpenAiChat,
}) => {
  return (
    <aside className="space-y-6">
      {/* Upload Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
          <UploadCloud className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Upload Study Materials</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          APS Notes grows with the help of students who share their notes, question papers and study materials. Help thousands of VTU students.
        </p>
        <button
          onClick={onOpenUpload}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Materials</span>
        </button>
        <p className="text-[11px] text-slate-400">
          Earn contributor badges on the platform.
        </p>
      </div>

      {/* Support Box */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
          <Heart className="w-5 h-5 fill-current" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Support APS Notes</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          APS Notes is run by students dedicating time and skills to keep the platform ad-free and updated. If our materials have helped you, consider supporting.
        </p>
        <button
          onClick={onOpenSupportUs}
          className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-rose-600/20"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Support Now</span>
        </button>
      </div>

      {/* Gemini AI Prompt Box */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Gemini AI Customer Support
        </div>
        <h3 className="text-base font-extrabold leading-snug">
          Stuck on a VTU Subject or Lab Code?
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ask our personalized AI assistant for instant step-by-step solutions, code debugging, and revision plans.
        </p>
        <button
          onClick={onOpenAiChat}
          className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask Gemini Support</span>
        </button>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Quick Academic Links
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('syllabus')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            VTU Syllabus
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            VTU Papers
          </button>
          <button
            onClick={() => setActiveTab('sgpa')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            SGPA Calculator
          </button>
          <button
            onClick={() => setActiveTab('cgpa')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            CGPA Calculator
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Lab Manuals
          </button>
        </div>
      </div>

      {/* VTU Circulars & Notifications */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Bell className="w-4 h-4 text-teal-600" />
          <span>VTU Circulars</span>
        </div>
        <div className="space-y-2.5 text-xs">
          {VTU_NOTIFICATIONS.map((notif) => (
            <a
              key={notif.id}
              href={notif.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2.5 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50/30 transition-all text-slate-700 hover:text-teal-900"
            >
              <div className="font-semibold text-slate-900 leading-snug">
                {notif.title}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{notif.date}</span>
                <span className="text-teal-600 font-medium flex items-center gap-0.5">
                  Official Link <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
};
