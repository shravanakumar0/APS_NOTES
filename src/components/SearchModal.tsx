import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Terminal, FileText, Calculator, ArrowRight, FolderOpen } from 'lucide-react';
import { REAL_NOTES, REAL_LAB_PROGRAMS, REAL_QUESTION_PAPERS, SubjectNote } from '../data/apsData';
import { ActiveTab } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: ActiveTab, payload?: any) => void;
  notes?: SubjectNote[];
}

export const SearchModal: React.FC<Props> = ({ isOpen, onClose, onSelectAction, notes }) => {
  const [query, setQuery] = useState('');
  const allNotes = notes && notes.length > 0 ? notes : REAL_NOTES;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedNotes = q
    ? allNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.code.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      )
    : allNotes.slice(0, 3);

  const matchedLabs = q
    ? REAL_LAB_PROGRAMS.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.language.toLowerCase().includes(q)
      )
    : REAL_LAB_PROGRAMS.slice(0, 2);

  const matchedPapers = q
    ? REAL_QUESTION_PAPERS.filter(
        (p) =>
          p.subjectName.toLowerCase().includes(q) ||
          p.subjectCode.toLowerCase().includes(q)
      )
    : REAL_QUESTION_PAPERS.slice(0, 2);

  const totalFound = matchedNotes.length + matchedLabs.length + matchedPapers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 backdrop-blur-xs p-4 pt-16 md:pt-24 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search uploaded notes, subject codes (e.g. 1BCS304), lab code, papers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm md:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-slate-100">
          {/* Quick Tools */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Academic Tools
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectAction('sgpa');
                  onClose();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">VTU SGPA Calculator</div>
                  <div className="text-[10px] text-slate-500">2022 &amp; 2025 scheme</div>
                </div>
              </button>
              <button
                onClick={() => {
                  onSelectAction('cgpa');
                  onClose();
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition-colors cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">VTU CGPA to Percentage</div>
                  <div className="text-[10px] text-slate-500">(CGPA - 0.75) * 10</div>
                </div>
              </button>
            </div>
          </div>

          {/* Notes */}
          {matchedNotes.length > 0 && (
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Uploaded Notes &amp; Documents ({matchedNotes.length})
              </span>
              <div className="space-y-1">
                {matchedNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => {
                      onSelectAction('notes', note);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{note.title}</span>
                          <span className="font-mono text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-bold">
                            {note.code}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {note.scheme} Scheme • Semester {note.semester} • {note.branch}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lab Programs */}
          {matchedLabs.length > 0 && (
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Laboratory Programs ({matchedLabs.length})
              </span>
              <div className="space-y-1">
                {matchedLabs.map((lab) => (
                  <button
                    key={lab.id}
                    onClick={() => {
                      onSelectAction('labs', lab);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{lab.title}</span>
                          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                            {lab.language}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">{lab.code}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Papers */}
          {matchedPapers.length > 0 && (
            <div className="pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Question Papers ({matchedPapers.length})
              </span>
              <div className="space-y-1">
                {matchedPapers.map((qp) => (
                  <button
                    key={qp.id}
                    onClick={() => {
                      onSelectAction('papers', qp);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{qp.subjectName}</span>
                          <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {qp.subjectCode}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {qp.examMonthYear} • {qp.type}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* If no items found */}
          {totalFound === 0 && (
            <div className="pt-8 pb-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <FolderOpen className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                {q ? `No uploaded resources matching "${query}"` : 'No resources uploaded yet'}
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Only PDFs uploaded by students or faculty will appear in search results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
