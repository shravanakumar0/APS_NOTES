import React, { useState, useEffect } from 'react';
import { REAL_SYLLABI, SyllabusItem } from '../data/apsData';
import { BookOpen, CheckCircle2, FileText, Sparkles, Search, Clock } from 'lucide-react';
import { StudentProfile } from '../types';

interface Props {
  profile: StudentProfile;
  onAskGemini?: (prompt: string) => void;
}

export const SyllabusView: React.FC<Props> = ({ profile: _profile, onAskGemini }) => {
  const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>(REAL_SYLLABI);
  const [selectedScheme, setSelectedScheme] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<SyllabusItem>(REAL_SYLLABI[0]);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch('/api/syllabus')
      .then((res) => res.json())
      .then((data) => {
        if (data.syllabus && Array.isArray(data.syllabus) && data.syllabus.length > 0) {
          setSyllabusList(data.syllabus);
          setActiveItem(data.syllabus[0]);
        }
      })
      .catch((_e) => {});
  }, []);

  const filtered = syllabusList.filter((s) => {
    const matchScheme = selectedScheme === 'all' || s.scheme === selectedScheme;
    const matchSearch =
      search === '' ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    return matchScheme && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Official VTU Syllabi Repository
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTU Syllabus &amp; Course Outcomes
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Module-wise syllabus, recommended standard textbooks, reference materials, and CIE/SEE evaluation pattern for 2022 &amp; 2025 NEP schemes.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search syllabus by title or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs md:text-sm font-medium text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
          <div>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            >
              <option value="all">All VTU Schemes</option>
              <option value="2025">2025 Scheme</option>
              <option value="2022">2022 Scheme</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Subject Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Available Courses ({filtered.length})
          </div>
          <div className="space-y-2">
            {filtered.map((item) => {
              const isSelected = activeItem?.code === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => setActiveItem(item)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        isSelected
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {item.credits} Credits
                    </span>
                  </div>
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.scheme} Scheme • Sem {item.semester}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detailed Syllabus Copy */}
        {activeItem && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                      {activeItem.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeItem.scheme} Scheme • Semester {activeItem.semester}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {activeItem.title}
                  </h2>
                </div>
                {onAskGemini && (
                  <button
                    onClick={() =>
                      onAskGemini(
                        `Explain the complete course syllabus breakdown for ${activeItem.title} (${activeItem.code}) and give me module-by-module preparation advice.`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Ask AI to Summarize Modules
                  </button>
                )}
              </div>

              {/* Evaluation Pattern */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-semibold">Credits</span>
                  <span className="font-bold text-slate-900 text-base">{activeItem.credits}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-semibold">CIE Marks</span>
                  <span className="font-bold text-teal-700 text-base">{activeItem.cieMarks} (Min 20)</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-semibold">SEE Marks</span>
                  <span className="font-bold text-indigo-700 text-base">{activeItem.seeMarks} (Min 18)</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-semibold">Exam Duration</span>
                  <span className="font-bold text-slate-900 text-base">{activeItem.examHours} Hours</span>
                </div>
              </div>

              {/* Course Objectives */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Course Objectives
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                  {activeItem.courseObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modules breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Module-Wise Detailed Syllabus
                </h3>
                {activeItem.modules.map((m) => (
                  <div
                    key={m.number}
                    className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                          Module {m.number}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                      </div>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {m.hours} Hours
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-1">
                      {m.topics}
                    </p>
                  </div>
                ))}
              </div>

              {/* Textbooks & References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600" /> Prescribed Textbooks
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2">
                    {activeItem.textbooks.map((tb, idx) => (
                      <li key={idx} className="leading-snug">• {tb}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Reference Books
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2">
                    {activeItem.referenceBooks.map((rb, idx) => (
                      <li key={idx} className="leading-snug">• {rb}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
