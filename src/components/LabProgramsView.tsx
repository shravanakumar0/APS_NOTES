import React, { useState } from 'react';
import { LabProgram } from '../data/apsData';
import {
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  FileCode,
  Terminal,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  UploadCloud,
  FolderOpen
} from 'lucide-react';
import { StudentProfile } from '../types';
import { downloadLabPDF } from '../utils/pdfExport';

interface Props {
  profile: StudentProfile;
  labs?: LabProgram[];
  onOpenPdfViewer?: (lab: LabProgram) => void;
  onAskGemini?: (prompt: string) => void;
  onOpenUpload?: (branch?: string, semester?: number, scheme?: string) => void;
}

const BRANCHES = [
  { id: 'all', label: 'All Branches' },
  { id: 'CSE-ISE', label: 'CSE / ISE' },
  { id: 'AIML-DS', label: 'AIML / AIDS' },
  { id: 'First Year', label: '1st Year' },
  { id: 'ECE', label: 'ECE' },
  { id: 'EEE', label: 'EEE' },
  { id: 'Mech', label: 'Mech' },
  { id: 'Civil', label: 'Civil' },
];

export const LabProgramsView: React.FC<Props> = ({
  profile,
  labs = [],
  onOpenPdfViewer,
  onAskGemini,
  onOpenUpload,
}) => {
  const [selectedScheme, setSelectedScheme] = useState<string>(profile.scheme || '2025');
  const [selectedBranch, setSelectedBranch] = useState<string>(profile.branch || 'CSE-ISE');
  const [selectedSem, setSelectedSem] = useState<string>(profile.semester ? profile.semester.toString() : '3');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProgram, setActiveProgram] = useState<LabProgram | null>(labs[0] || null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showViva, setShowViva] = useState<boolean>(true);

  // Sync active program when labs change
  React.useEffect(() => {
    if (labs.length > 0 && (!activeProgram || !labs.find((l) => l.id === activeProgram.id))) {
      setActiveProgram(labs[0]);
    }
  }, [labs, activeProgram]);

  // Filter programs
  const filtered = labs.filter((p) => {
    const matchScheme = selectedScheme === 'all' || p.scheme === selectedScheme;
    const matchBranch =
      selectedBranch === 'all' ||
      p.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchSem = selectedSem === 'all' || p.semester.toString() === selectedSem;
    const matchSearch =
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.aim.toLowerCase().includes(searchQuery.toLowerCase());
    return matchScheme && matchBranch && matchSem && matchSearch;
  });

  const handleCopyCode = () => {
    if (!activeProgram) return;
    navigator.clipboard.writeText(activeProgram.sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const branchDisplay =
    selectedBranch === 'all'
      ? 'All Branches'
      : BRANCHES.find((b) => b.id === selectedBranch)?.label || selectedBranch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Terminal className="w-3.5 h-3.5" /> 2022 &amp; 2025 Scheme Laboratory Manuals
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTU Laboratory Programs &amp; Viva Voce
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Verified lab manuals, source codes, execution commands, and viva questions. Shows uploaded PDF manuals and programs for your branch and semester.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Lab Manuals Uploaded
            </span>
            <div className="text-3xl font-black text-teal-400 mt-0.5">
              {labs.length}
            </div>
          </div>
        </div>

        {/* Branch Strip */}
        <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Branch
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {BRANCHES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedBranch === b.id
                      ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Semester Strip */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Semester
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
              <button
                onClick={() => setSelectedSem('all')}
                className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSem === 'all'
                    ? 'bg-teal-500 text-slate-950 font-black'
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                }`}
              >
                All Sems
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSem(s.toString())}
                  className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSem === s.toString()
                      ? 'bg-teal-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Sem {s}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search program, lab code, or language..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs md:text-sm font-medium text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/40"
              >
                <option value="all">All VTU Schemes</option>
                <option value="2025">2025 Scheme (Latest)</option>
                <option value="2022">2022 Scheme</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Menu, Right Code Preview (ONLY SHOWN IF LABS EXIST) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Program Selection List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Uploaded Lab Programs ({filtered.length})
            </div>
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filtered.map((prog) => {
                const isSelected = activeProgram?.id === prog.id;
                return (
                  <button
                    key={prog.id}
                    onClick={() => setActiveProgram(prog)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          isSelected
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prog.code}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {prog.language}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {prog.title}
                    </h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {prog.aim}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active Program View */}
          {activeProgram && (
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Top Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                        {activeProgram.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {activeProgram.scheme} Scheme • Sem {activeProgram.semester}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {activeProgram.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {onOpenPdfViewer && (
                      <button
                        onClick={() => onOpenPdfViewer(activeProgram)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> View PDF
                      </button>
                    )}
                    <button
                      onClick={() => downloadLabPDF(activeProgram)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </>
                      )}
                    </button>
                    {onAskGemini && (
                      <button
                        onClick={() =>
                          onAskGemini(
                            `Please explain the logic, algorithm, and common viva questions for this VTU lab program: "${activeProgram.title}" (${activeProgram.code}) in ${activeProgram.language}.`
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-semibold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                      </button>
                    )}
                  </div>
                </div>

                {/* Aim */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Aim &amp; Problem Statement
                  </h3>
                  <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    {activeProgram.aim}
                  </p>
                </div>

                {/* Algorithm */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Step-by-Step Algorithm / Execution
                  </h3>
                  <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    {activeProgram.algorithm.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-semibold text-teal-700">{idx + 1}.</span>
                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Source Code Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-teal-600" />
                      Verified Source Code ({activeProgram.language})
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      UTF-8 • VTU Compliant
                    </span>
                  </div>
                  <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner border border-slate-800">
                    <pre className="leading-relaxed">
                      <code>{activeProgram.sourceCode}</code>
                    </pre>
                  </div>
                </div>

                {/* Sample Output */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-slate-600" />
                    Terminal Execution &amp; Sample Output
                  </h3>
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                    <pre>{activeProgram.sampleOutput}</pre>
                  </div>
                </div>

                {/* Viva Voce Section */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowViva(!showViva)}
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 font-bold text-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-teal-700" />
                      Examiner Viva Voce Questions &amp; Detailed Answers ({activeProgram.vivaQuestions.length})
                    </span>
                    {showViva ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showViva && (
                    <div className="mt-3 space-y-3">
                      {activeProgram.vivaQuestions.map((viva, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs shadow-xs"
                        >
                          <div className="font-bold text-slate-900 flex items-start gap-2">
                            <span className="text-teal-600 font-mono">Q{i + 1}:</span>
                            <span>{viva.q}</span>
                          </div>
                          <div className="text-slate-600 pl-6 leading-relaxed">
                            <span className="font-semibold text-slate-700">Ans: </span>
                            {viva.a}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STRICT EMPTY STATE: ONLY SHOW NO RESOURCES ON THAT PARTICULAR SEMESTER WITH BRANCH */
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border-2 border-dashed border-slate-300 shadow-sm space-y-5 max-w-2xl mx-auto my-6">
          <div className="w-18 h-18 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <FolderOpen className="w-9 h-9 text-amber-600" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
              No Resources Available
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
              No resources on {branchDisplay} {selectedSem !== 'all' ? `Semester ${selectedSem}` : ''}
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No laboratory manuals or verified source codes have been uploaded for {branchDisplay} {selectedSem !== 'all' ? `Semester ${selectedSem}` : ''} yet. Only uploaded student/faculty PDFs will appear here.
            </p>
          </div>

          {onOpenUpload && (
            <div className="pt-2 flex justify-center">
              <button
                onClick={() =>
                  onOpenUpload(
                    selectedBranch !== 'all' ? selectedBranch : profile.branch,
                    selectedSem !== 'all' ? parseInt(selectedSem, 10) : profile.semester,
                    selectedScheme !== 'all' ? selectedScheme : profile.scheme
                  )
                }
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all cursor-pointer inline-flex items-center gap-2 group"
              >
                <UploadCloud className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>
                  Upload Lab Manual PDF for {branchDisplay} {selectedSem !== 'all' ? `Sem ${selectedSem}` : `Sem ${profile.semester}`}
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
