import React, { useState } from 'react';
import { Award, TrendingUp, Sparkles } from 'lucide-react';
import { StudentProfile } from '../types';

interface SemesterRow {
  sem: number;
  credits: number;
  sgpa: number | '';
  enabled: boolean;
}

interface Props {
  profile: StudentProfile;
  onAskGemini?: (prompt: string) => void;
}

export const CgpaCalculator: React.FC<Props> = ({ profile, onAskGemini }) => {
  const [targetCgpa, setTargetCgpa] = useState<number | ''>(8.5);
  const [semesters, setSemesters] = useState<SemesterRow[]>([
    { sem: 1, credits: 20, sgpa: 8.4, enabled: true },
    { sem: 2, credits: 20, sgpa: 8.6, enabled: true },
    { sem: 3, credits: 22, sgpa: 8.8, enabled: true },
    { sem: 4, credits: 22, sgpa: '', enabled: false },
    { sem: 5, credits: 22, sgpa: '', enabled: false },
    { sem: 6, credits: 22, sgpa: '', enabled: false },
    { sem: 7, credits: 20, sgpa: '', enabled: false },
    { sem: 8, credits: 16, sgpa: '', enabled: false },
  ]);

  const handleToggleSem = (sem: number) => {
    setSemesters((prev) =>
      prev.map((s) => (s.sem === sem ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSgpaChange = (sem: number, val: string) => {
    const num = val === '' ? '' : Math.min(10, Math.max(0, parseFloat(val) || 0));
    setSemesters((prev) =>
      prev.map((s) => (s.sem === sem ? { ...s, sgpa: num, enabled: num !== '' } : s))
    );
  };

  const handleCreditsChange = (sem: number, val: number) => {
    setSemesters((prev) =>
      prev.map((s) => (s.sem === sem ? { ...s, credits: Math.max(1, val) } : s))
    );
  };

  // Completed calculations
  const activeSems = semesters.filter((s) => s.enabled && typeof s.sgpa === 'number');
  const totalCredits = activeSems.reduce((acc, s) => acc + s.credits, 0);
  const totalPoints = activeSems.reduce(
    (acc, s) => acc + s.credits * (typeof s.sgpa === 'number' ? s.sgpa : 0),
    0
  );
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  const numericCgpa = parseFloat(cgpa);

  // VTU Official Percentage formula: (CGPA - 0.75) * 10
  const vtuPercentage =
    numericCgpa >= 0.75 ? ((numericCgpa - 0.75) * 10).toFixed(2) : '0.00';

  // Class classification
  let classAward = 'Pass Class';
  let badgeColor = 'bg-slate-100 text-slate-800';
  if (numericCgpa >= 7.75) {
    classAward = 'First Class with Distinction (FCD)';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
  } else if (numericCgpa >= 6.75) {
    classAward = 'First Class (FC)';
    badgeColor = 'bg-teal-500/20 text-teal-300 border border-teal-400/30';
  } else if (numericCgpa >= 5.75) {
    classAward = 'Second Class (SC)';
    badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
  }

  // Required future SGPA for target
  const remainingSems = semesters.filter((s) => !s.enabled || s.sgpa === '');
  const remainingCredits = remainingSems.reduce((acc, s) => acc + s.credits, 0);
  let requiredFutureSgpa: string | null = null;

  if (typeof targetCgpa === 'number' && remainingCredits > 0 && totalCredits > 0) {
    const totalRequiredPoints = (totalCredits + remainingCredits) * targetCgpa;
    const neededPoints = totalRequiredPoints - totalPoints;
    const reqSgpa = neededPoints / remainingCredits;
    requiredFutureSgpa = reqSgpa.toFixed(2);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> Official VTU Equivalent Scale
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTU CGPA &amp; Percentage Calculator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Calculates your cumulative grade point average and exact VTU percentage formula:
              <span className="font-mono text-teal-300 block mt-1">
                Percentage (%) = [CGPA - 0.75] × 10
              </span>
            </p>
          </div>

          {/* Cards for CGPA & Percentage */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[160px]">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                Overall CGPA
              </span>
              <div className="text-4xl font-black text-white mt-1">{cgpa}</div>
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeColor}`}>
                {classAward}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[160px]">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                VTU Percentage
              </span>
              <div className="text-4xl font-black text-teal-400 mt-1">{vtuPercentage}%</div>
              <span className="text-[11px] text-slate-300 mt-2 block">
                Calculated on {totalCredits} Credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Semesters */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Enter Your Semester SGPAs
        </h2>
        <p className="text-xs text-slate-600 mb-6">
          Toggle the semesters you have completed and enter your SGPA for each.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {semesters.map((s) => (
            <div
              key={s.sem}
              className={`p-4 rounded-2xl border transition-all ${
                s.enabled && typeof s.sgpa === 'number'
                  ? 'bg-teal-50/40 border-teal-200 shadow-xs'
                  : 'bg-slate-50/50 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 text-sm">
                  Semester {s.sem}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => handleToggleSem(s.sem)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    SGPA (0 - 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.5"
                    value={s.sgpa}
                    onChange={(e) => handleSgpaChange(s.sem, e.target.value)}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    value={s.credits}
                    onChange={(e) => handleCreditsChange(s.sem, parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Target CGPA Predictor Card */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
              <TrendingUp className="w-4 h-4" /> Target CGPA Goal Predictor
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Set your target graduation CGPA to discover the exact minimum SGPA you must maintain in your remaining {remainingSems.length} semesters.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Target:</span>
              <input
                type="number"
                step="0.1"
                min="5"
                max="10"
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(parseFloat(e.target.value) || '')}
                className="w-20 px-3 py-2 text-center rounded-xl bg-slate-800 text-white border border-slate-700 font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {requiredFutureSgpa && (
              <div className="bg-teal-500/20 border border-teal-400/30 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-teal-300 block font-semibold uppercase">
                  Required SGPA
                </span>
                <span className="text-lg font-black text-white">
                  {parseFloat(requiredFutureSgpa) > 10 ? 'Unattainable (>10.0)' : requiredFutureSgpa}
                </span>
              </div>
            )}
          </div>
        </div>

        {onAskGemini && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() =>
                onAskGemini(
                  `My current VTU CGPA is ${cgpa} (${vtuPercentage}%) in ${profile.branch}. My goal is ${targetCgpa}. What strategies, subjects, and study plan should I follow?`
                )
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Ask Gemini for Graduation Strategy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
