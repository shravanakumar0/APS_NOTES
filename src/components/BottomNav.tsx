import React from 'react';
import { ActiveTab } from '../types';
import { BookOpen, FileText, Sparkles, Calculator, Layers } from 'lucide-react';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAiChat: () => void;
}

export const BottomNav: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAiChat }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'syllabus' ? 'text-teal-700' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus</span>
        </button>
        <button
          onClick={() => setActiveTab('papers')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'papers' ? 'text-teal-700' : 'text-slate-500'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Papers</span>
        </button>

        {/* Center Prominent AI Assistant Button */}
        <button
          onClick={onOpenAiChat}
          className="flex flex-col items-center -mt-6 group cursor-pointer"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-900 via-teal-900 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-700/30 group-hover:scale-105 transition-all border-2 border-white">
            <Sparkles className="w-6 h-6 text-teal-300 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 mt-0.5">AI Support</span>
        </button>

        <button
          onClick={() => setActiveTab('sgpa')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'sgpa' ? 'text-teal-700' : 'text-slate-500'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>SGPA</span>
        </button>
        <button
          onClick={() => setActiveTab('cgpa')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'cgpa' ? 'text-teal-700' : 'text-slate-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>CGPA</span>
        </button>
      </div>
    </div>
  );
};
