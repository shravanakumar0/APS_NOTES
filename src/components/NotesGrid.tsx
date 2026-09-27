import React, { useState } from 'react';
import { SubjectNote } from '../data/apsData';
import {
  Calendar,
  Eye,
  Download,
  Star,
  Sparkles,
  Search,
  FileText,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { StudentProfile } from '../types';
import { downloadNotePDF } from '../utils/pdfExport';

interface Props {
  profile: StudentProfile;
  notes?: SubjectNote[];
  onSelectNote: (note: SubjectNote) => void;
  onOpenPdfViewer?: (note: SubjectNote) => void;
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

export const NotesGrid: React.FC<Props> = ({
  profile,
  notes,
  onSelectNote,
  onOpenPdfViewer,
  onAskGemini,
  onOpenUpload,
}) => {
  const allNotes = notes || [];

  // Default to student's profile semester and branch for instant personalization
  const [selectedBranch, setSelectedBranch] = useState<string>(profile.branch || 'CSE-ISE');
  const [selectedSem, setSelectedSem] = useState<string>(profile.semester ? profile.semester.toString() : '3');
  const [selectedScheme, setSelectedScheme] = useState<string>(profile.scheme || '2025');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredNotes = allNotes.filter((note) => {
    const matchBranch =
      selectedBranch === 'all' ||
      note.branch.toLowerCase().includes(selectedBranch.toLowerCase()) ||
      note.branches.some((b) => b.toLowerCase().includes(selectedBranch.toLowerCase()));
    const matchScheme = selectedScheme === 'all' || note.scheme === selectedScheme;
    const matchSem = selectedSem === 'all' || note.semester.toString() === selectedSem;
    const matchSearch =
      searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchBranch && matchScheme && matchSem && matchSearch;
  });

  const branchDisplay =
    selectedBranch === 'all'
      ? 'All Branches'
      : BRANCHES.find((b) => b.id === selectedBranch)?.label || selectedBranch;

  return (
    <div className="space-y-6">
      {/* Sleek Academic Filter & Branch/Semester Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 md:p-6 space-y-5">
        
        {/* Branch Selection Strip */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Branch
            </span>
            <span className="text-xs font-semibold text-teal-700">
              Active: {branchDisplay}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {BRANCHES.map((b) => {
              const isSelected = selectedBranch === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Semester Selection Strip */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Select Semester
            </span>
            <span className="text-xs font-semibold text-teal-700">
              {selectedSem === 'all' ? 'All Semesters' : `Semester ${selectedSem}`}
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
            <button
              onClick={() => setSelectedSem('all')}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSem === 'all'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Sems
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
              const isSelected = selectedSem === s.toString();
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSem(s.toString())}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 ring-2 ring-teal-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Sem {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Scheme Bar */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search uploaded PDF by subject code (e.g. 1BCS304) or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          <div className="sm:col-span-4">
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs md:text-sm font-semibold bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            >
              <option value="all">All Schemes</option>
              <option value="2025">2025 Scheme (NEP)</option>
              <option value="2022">2022 Scheme</option>
              <option value="2021">2021 Scheme</option>
            </select>
          </div>
        </div>
      </div>

      {/* Uploaded PDF Count Indicator */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            {branchDisplay} {selectedSem !== 'all' ? `• Semester ${selectedSem}` : ''}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {filteredNotes.length} PDF{filteredNotes.length === 1 ? '' : 's'} Uploaded
          </span>
        </div>
        {onOpenUpload && (
          <button
            onClick={() =>
              onOpenUpload(
                selectedBranch !== 'all' ? selectedBranch : profile.branch,
                selectedSem !== 'all' ? parseInt(selectedSem, 10) : profile.semester,
                selectedScheme !== 'all' ? selectedScheme : profile.scheme
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-teal-600" />
            <span>Upload New PDF</span>
          </button>
        )}
      </div>

      {/* Grid of Uploaded PDF Cards (ONLY SHOWN WHEN UPLOADED) */}
      {filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group bg-white rounded-3xl border border-slate-200 hover:border-teal-300 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header Tag */}
                <div className="bg-slate-900 p-5 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30">
                      {note.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <span>{note.scheme} Scheme</span>
                      <span>•</span>
                      <span>Sem {note.semester}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-extrabold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-400 truncate max-w-[140px]">{note.category}</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1 text-[10px] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                      <FileCheck className="w-3 h-3 text-emerald-400" /> Original PDF Attached
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                    <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-mono text-[11px] font-bold truncate">
                      {note.pdfFileName || `${note.code}_Document.pdf`}
                    </span>
                    {note.fileSize && (
                      <span className="text-[10px] font-semibold text-slate-500 ml-auto shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {note.fileSize}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {note.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Uploaded by:</span>
                    <span className="truncate">{note.author}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer with 2 Clear Primary Buttons */}
              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mb-3">
                  <span className="flex items-center gap-1 text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>{note.updatedDate}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {note.views}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {note.rating}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenPdfViewer) onOpenPdfViewer(note);
                      else onSelectNote(note);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View PDF</span>
                  </button>
                  <button
                    onClick={() => downloadNotePDF(note)}
                    title="Download PDF"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                  {onAskGemini && (
                    <button
                      onClick={() =>
                        onAskGemini(
                          `What are the most important exam questions and pass marks tips for ${note.title} (${note.code}) in VTU?`
                        )
                      }
                      title="Ask AI about this subject"
                      className="p-2.5 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STRICT EMPTY STATE: ONLY SHOW NO RESOURCES ON THAT PARTICULAR SEMESTER WITH BRANCH */}
      {filteredNotes.length === 0 && (
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
              No PDF study materials have been uploaded for {branchDisplay} {selectedSem !== 'all' ? `Semester ${selectedSem}` : ''} yet. All demo resources have been cleared. Resources will only appear once a student or faculty uploads a PDF.
            </p>
          </div>

          {/* Prominent Direct Upload Button for that Branch & Semester */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenUpload && (
              <button
                onClick={() =>
                  onOpenUpload(
                    selectedBranch !== 'all' ? selectedBranch : profile.branch,
                    selectedSem !== 'all' ? parseInt(selectedSem, 10) : profile.semester,
                    selectedScheme !== 'all' ? selectedScheme : profile.scheme
                  )
                }
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <UploadCloud className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                <span>
                  Upload PDF for {branchDisplay} {selectedSem !== 'all' ? `Sem ${selectedSem}` : `Sem ${profile.semester}`}
                </span>
              </button>
            )}

            {(selectedBranch !== profile.branch || selectedSem !== profile.semester.toString() || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedBranch('all');
                  setSelectedSem('all');
                  setSelectedScheme('all');
                  setSearchQuery('');
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Show All Sems &amp; Branches
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
