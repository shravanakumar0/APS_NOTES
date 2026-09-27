import React, { useState } from 'react';
import { QuestionPaper } from '../data/apsData';
import {
  FileText,
  Download,
  Sparkles,
  Search,
  UploadCloud,
  Eye,
  FolderOpen
} from 'lucide-react';
import { StudentProfile } from '../types';
import { downloadQuestionPaperPDF } from '../utils/pdfExport';

interface Props {
  profile: StudentProfile;
  papers?: QuestionPaper[];
  onOpenPdfViewer?: (qp: QuestionPaper) => void;
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

export const QuestionPaperVault: React.FC<Props> = ({
  profile,
  papers = [],
  onOpenPdfViewer,
  onAskGemini,
  onOpenUpload,
}) => {
  const [selectedScheme, setSelectedScheme] = useState<string>(profile.scheme || '2025');
  const [selectedBranch, setSelectedBranch] = useState<string>(profile.branch || 'CSE-ISE');
  const [selectedSem, setSelectedSem] = useState<string>(profile.semester ? profile.semester.toString() : '3');
  const [search, setSearch] = useState<string>('');
  const [activePaper, setActivePaper] = useState<QuestionPaper | null>(papers[0] || null);

  React.useEffect(() => {
    if (papers.length > 0 && (!activePaper || !papers.find((p) => p.id === activePaper.id))) {
      setActivePaper(papers[0]);
    }
  }, [papers, activePaper]);

  const filtered = papers.filter((p) => {
    const matchScheme = selectedScheme === 'all' || p.scheme === selectedScheme;
    const matchBranch =
      selectedBranch === 'all' ||
      p.branch.toLowerCase().includes(selectedBranch.toLowerCase());
    const matchSem = selectedSem === 'all' || p.semester.toString() === selectedSem;
    const matchSearch =
      search === '' ||
      p.subjectName.toLowerCase().includes(search.toLowerCase()) ||
      p.subjectCode.toLowerCase().includes(search.toLowerCase());
    return matchScheme && matchBranch && matchSem && matchSearch;
  });

  const handleDownload = () => {
    if (!activePaper) return;
    downloadQuestionPaperPDF(activePaper);
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
              <FileText className="w-3.5 h-3.5" /> Previous Year Question Papers &amp; Model Papers
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              VTU Question Papers &amp; Solutions Vault
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Model question papers and previous semester end exam (SEE) papers for 2022 &amp; 2025 schemes. Only uploaded PDF question papers are shown.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
              Papers Uploaded
            </span>
            <div className="text-3xl font-black text-teal-400 mt-0.5">
              {papers.length}
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
                placeholder="Search paper by subject code (e.g. 1BCS304) or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

      {/* Main Grid or Empty State */}
      {filtered.length === 0 ? (
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
              No question papers have been uploaded for {branchDisplay} {selectedSem !== 'all' ? `Semester ${selectedSem}` : ''} yet. Only uploaded student/faculty PDFs will appear here.
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
                  Upload Question Paper PDF for {branchDisplay} {selectedSem !== 'all' ? `Sem ${selectedSem}` : `Sem ${profile.semester}`}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Paper Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Question Papers Archive ({filtered.length})
            </div>
            <div className="space-y-2">
              {filtered.map((paper) => {
                const isSelected = activePaper?.id === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => setActivePaper(paper)}
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
                        {paper.subjectCode}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {paper.examMonthYear}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {paper.subjectName}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                      <span>{paper.scheme} Scheme</span>
                      <span className="text-teal-400 font-medium">{paper.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Paper Preview */}
          {activePaper && (
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                {/* Paper Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                        {activePaper.subjectCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {activePaper.scheme} Scheme • {activePaper.type}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                      {activePaper.subjectName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Examination: {activePaper.examMonthYear} • Max Marks: {activePaper.totalMarks} • Duration: {activePaper.duration}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {onOpenPdfViewer && (
                      <button
                        onClick={() => onOpenPdfViewer(activePaper)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View PDF
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Paper PDF
                    </button>
                  </div>
                </div>

                {/* Instructions Notice */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900">
                  <span className="font-bold">Instructions to Students: </span>
                  Answer any FIVE full questions, choosing ONE full question from each module.
                </div>

                {/* Module Questions */}
                <div className="space-y-6">
                  {activePaper.modules.map((mod) => (
                    <div
                      key={mod.moduleNumber}
                      className="rounded-2xl border border-slate-200 p-5 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Module {mod.moduleNumber}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Answer Q1 or Q2
                        </span>
                      </div>
                      <div className="space-y-3">
                        {mod.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-teal-700 mr-2">
                                {q.qNum}
                              </span>
                              <span className="text-slate-800 leading-relaxed font-medium">
                                {q.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700 text-[11px]">
                                {q.marks}M
                              </span>
                              {onAskGemini && (
                                <button
                                  onClick={() =>
                                    onAskGemini(
                                      `Please provide a step-by-step 10-mark standard VTU answer for this question from ${activePaper.subjectName} (${activePaper.subjectCode}): "${q.text}"`
                                    )
                                  }
                                  title="Generate complete solution with AI"
                                  className="p-1 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors cursor-pointer"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
