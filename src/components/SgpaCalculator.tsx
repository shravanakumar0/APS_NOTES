import React, { useState, useEffect } from 'react';
import { BRANCH_SEMESTER_SUBJECTS, CalculatorSubject } from '../data/apsData';
import { Plus, Trash2, RotateCcw, Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { StudentProfile } from '../types';

interface SubjectRow extends CalculatorSubject {
  id: string;
  marks: number | '';
  grade: string;
  gradePoint: number;
}

const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

function getGradeFromMarks(marks: number): { grade: string; point: number } {
  if (marks >= 90) return { grade: 'O', point: 10 };
  if (marks >= 80) return { grade: 'A+', point: 9 };
  if (marks >= 70) return { grade: 'A', point: 8 };
  if (marks >= 60) return { grade: 'B+', point: 7 };
  if (marks >= 55) return { grade: 'B', point: 6 };
  if (marks >= 50) return { grade: 'C', point: 5 };
  if (marks >= 40) return { grade: 'P', point: 4 };
  return { grade: 'F', point: 0 };
}

interface Props {
  profile: StudentProfile;
  onAskGemini?: (prompt: string) => void;
}

export const SgpaCalculator: React.FC<Props> = ({ profile, onAskGemini }) => {
  const [selectedScheme, setSelectedScheme] = useState<'2025' | '2022'>(
    profile.scheme === '2025' ? '2025' : '2022'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>('CSE-ISE');
  const [selectedSemester, setSelectedSemester] = useState<number>(profile.semester || 3);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);

  // Load preset subjects based on scheme + branch + sem
  const loadPreset = () => {
    let key = `${selectedBranch}-${selectedScheme}`;
    if (selectedBranch === 'FIRST-YEAR-P-CYCLE' || selectedBranch === 'FIRST-YEAR-C-CYCLE') {
      key = selectedBranch;
    }
    const branchData = BRANCH_SEMESTER_SUBJECTS[key];
    const semSubjects = branchData ? branchData[selectedSemester] : null;

    if (semSubjects && semSubjects.length > 0) {
      setSubjects(
        semSubjects.map((sub, i) => ({
          ...sub,
          id: `preset-${i}-${Date.now()}`,
          marks: '',
          grade: 'O',
          gradePoint: 10,
        }))
      );
    } else {
      // Default template
      setSubjects([
        { id: '1', code: 'BCS301', name: 'Mathematics Course', credits: 4, marks: '', grade: 'O', gradePoint: 10 },
        { id: '2', code: 'BCS302', name: 'Core Theory Course 1', credits: 4, marks: '', grade: 'A+', gradePoint: 9 },
        { id: '3', code: 'BCS303', name: 'Core Theory Course 2', credits: 4, marks: '', grade: 'A', gradePoint: 8 },
        { id: '4', code: 'BCS304', name: 'Core Theory Course 3', credits: 3, marks: '', grade: 'B+', gradePoint: 7 },
        { id: '5', code: 'BCSL305', name: 'Practical Lab Course', credits: 1.5, marks: '', grade: 'O', gradePoint: 10 },
      ]);
    }
  };

  useEffect(() => {
    loadPreset();
  }, [selectedScheme, selectedBranch, selectedSemester]);

  const handleMarksChange = (id: string, val: string) => {
    const num = val === '' ? '' : Math.min(100, Math.max(0, parseInt(val, 10) || 0));
    setSubjects((prev) =>
      prev.map((sub) => {
        if (sub.id !== id) return sub;
        if (num === '') {
          return { ...sub, marks: '', grade: 'P', gradePoint: 4 };
        }
        const { grade, point } = getGradeFromMarks(num);
        return { ...sub, marks: num, grade, gradePoint: point };
      })
    );
  };

  const handleGradeChange = (id: string, grade: string) => {
    const point = GRADE_POINTS[grade] ?? 0;
    setSubjects((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, grade, gradePoint: point, marks: '' } : sub))
    );
  };

  const handleCreditsChange = (id: string, credits: number) => {
    setSubjects((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, credits: Math.max(0.5, credits) } : sub))
    );
  };

  const handleAddSubject = () => {
    const newSub: SubjectRow = {
      id: `custom-${Date.now()}`,
      code: `SUB${subjects.length + 1}`,
      name: 'Custom Elective / Practical Course',
      credits: 3,
      marks: '',
      grade: 'O',
      gradePoint: 10,
    };
    setSubjects((prev) => [...prev, newSub]);
  };

  const handleDeleteSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  // Calculations
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalEarnedPoints = subjects.reduce((sum, s) => sum + s.credits * s.gradePoint, 0);
  const sgpa = totalCredits > 0 ? (totalEarnedPoints / totalCredits).toFixed(2) : '0.00';
  const hasFailedSubject = subjects.some((s) => s.grade === 'F');

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Award className="w-3.5 h-3.5" /> VTU 2022 &amp; 2025 Scheme Certified
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTU SGPA Calculator
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automatic credit-weighted Semester Grade Point Average calculator based on official VTU Examination Evaluation Guidelines: <span className="font-mono text-teal-300">SGPA = Σ(Ci × Gi) / ΣCi</span>
            </p>
          </div>

          {/* Quick Result Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[200px]">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Calculated SGPA
            </span>
            <div className="text-4xl md:text-5xl font-black text-white mt-1 tracking-tight">
              {sgpa}
            </div>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium">
              {hasFailedSubject ? (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Backlog (F Grade)
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Cleared
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              VTU Scheme
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value as '2022' | '2025')}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            >
              <option value="2025">2025 Scheme (Latest)</option>
              <option value="2022">2022 Scheme</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Branch Stream
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            >
              <option value="CSE-ISE">Computer Science &amp; Info Science (CSE/ISE)</option>
              <option value="AIML-DS">AI &amp; Data Science (AIML / AIDS)</option>
              <option value="FIRST-YEAR-P-CYCLE">1st Year Physics Cycle</option>
              <option value="FIRST-YEAR-C-CYCLE">1st Year Chemistry Cycle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Subjects Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Registered Courses &amp; Marks Entry
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter either Marks (0-100) or select Grade directly. Credits are preset to VTU curriculum.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadPreset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Default
            </button>
            <button
              onClick={handleAddSubject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Course
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Course Code &amp; Title</th>
                <th className="py-3 px-4 text-center">Credits (Ci)</th>
                <th className="py-3 px-4 text-center">Marks (0-100)</th>
                <th className="py-3 px-4 text-center">Grade (Gi)</th>
                <th className="py-3 px-4 text-center">Grade Point</th>
                <th className="py-3 px-4 text-center">Credit Points (Ci × Gi)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {subjects.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{sub.name}</div>
                    <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-0.5 font-medium">
                      {sub.code}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="10"
                      value={sub.credits}
                      onChange={(e) => handleCreditsChange(sub.id, parseFloat(e.target.value) || 1)}
                      className="w-16 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 85"
                      value={sub.marks}
                      onChange={(e) => handleMarksChange(sub.id, e.target.value)}
                      className="w-20 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <select
                      value={sub.grade}
                      onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                        sub.grade === 'O'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sub.grade === 'A+' || sub.grade === 'A'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : sub.grade === 'F'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="O">O (Outstanding: 90-100)</option>
                      <option value="A+">A+ (Excellent: 80-89)</option>
                      <option value="A">A (Very Good: 70-79)</option>
                      <option value="B+">B+ (Good: 60-69)</option>
                      <option value="B">B (Above Average: 55-59)</option>
                      <option value="C">C (Average: 50-54)</option>
                      <option value="P">P (Pass: 40-49)</option>
                      <option value="F">F (Fail: &lt;40)</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                    {sub.gradePoint}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-teal-700 font-mono">
                    {(sub.credits * sub.gradePoint).toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      disabled={subjects.length <= 1}
                      title="Remove course"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-50 p-5 md:p-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-slate-600 block text-xs">Total Credits (ΣCi):</span>
              <span className="font-bold text-slate-900 text-lg">{totalCredits}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-xs">Total Credit Points (ΣGi):</span>
              <span className="font-bold text-slate-900 text-lg">{totalEarnedPoints.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-600 block text-xs">SGPA:</span>
              <span className="font-extrabold text-teal-700 text-xl">{sgpa}</span>
            </div>
          </div>
          {onAskGemini && (
            <button
              onClick={() =>
                onAskGemini(
                  `I calculated an SGPA of ${sgpa} for ${selectedBranch} Sem ${selectedSemester} (${selectedScheme} scheme). How can I improve to 9+ SGPA in next semester?`
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Ask Gemini for SGPA Improvement Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
