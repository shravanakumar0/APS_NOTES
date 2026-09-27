import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Trash2,
  Plus,
  BookOpen,
  FileText,
  Users,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  FolderOpen,
  X,
  ExternalLink
} from 'lucide-react';
import { SubjectNote, SyllabusItem } from '../data/apsData';
import { StudentUser } from '../types';

interface Props {
  notes: SubjectNote[];
  onNoteDeleted: (noteId: string) => void;
  onNoteAdded?: (note: SubjectNote) => void;
  onExitAdmin: () => void;
}

export const AdminPanel: React.FC<Props> = ({
  notes,
  onNoteDeleted,
  onNoteAdded,
  onExitAdmin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'syllabus' | 'students' | 'stats'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Syllabus state
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [loadingSyllabus, setLoadingSyllabus] = useState(false);
  const [isAddSyllabusOpen, setIsAddSyllabusOpen] = useState(false);

  // New syllabus form
  const [newSylCode, setNewSylCode] = useState('');
  const [newSylTitle, setNewSylTitle] = useState('');
  const [newSylBranch, setNewSylBranch] = useState('CSE-ISE');
  const [newSylScheme, setNewSylScheme] = useState<'2022' | '2025'>('2025');
  const [newSylSemester, setNewSylSemester] = useState(3);
  const [newSylCredits, setNewSylCredits] = useState(4);
  const [newSylModule1, setNewSylModule1] = useState('');
  const [newSylModule2, setNewSylModule2] = useState('');
  const [newSylModule3, setNewSylModule3] = useState('');
  const [newSylModule4, setNewSylModule4] = useState('');
  const [newSylModule5, setNewSylModule5] = useState('');
  const [newSylTextbook, setNewSylTextbook] = useState('');

  // Registered students state
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load syllabus
  const loadSyllabus = async () => {
    setLoadingSyllabus(true);
    try {
      const res = await fetch('/api/syllabus');
      const data = await res.json();
      if (data.syllabus) setSyllabi(data.syllabus);
    } catch (_e) {
      console.warn('Failed to load syllabus');
    } finally {
      setLoadingSyllabus(false);
    }
  };

  // Load students
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (_e) {
      console.warn('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadSyllabus();
    loadStudents();
  }, []);

  // Delete note handler
  const handleDeleteNote = async (note: SubjectNote) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${note.title} (${note.code})"? This will remove it from the website and Supabase database.`)) {
      return;
    }

    setDeletingId(note.id);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/notes/${encodeURIComponent(note.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        onNoteDeleted(note.id);
        setActionMessage(`Note "${note.title}" was permanently removed.`);
      } else {
        throw new Error(data.error || 'Failed to delete note');
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Delete syllabus handler
  const handleDeleteSyllabus = async (code: string) => {
    if (!window.confirm(`Permanently delete syllabus for "${code}"?`)) return;

    try {
      const res = await fetch(`/api/syllabus/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSyllabi((prev) => prev.filter((s) => s.code.toUpperCase() !== code.toUpperCase()));
        setActionMessage(`Syllabus for ${code} deleted.`);
      }
    } catch (_e) {
      setActionMessage('Failed to delete syllabus item');
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Add syllabus handler
  const handleAddSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSylCode.trim() || !newSylTitle.trim()) {
      alert('Subject code and title are required');
      return;
    }

    const payload = {
      code: newSylCode.trim().toUpperCase(),
      title: newSylTitle.trim(),
      branch: newSylBranch,
      scheme: newSylScheme,
      semester: Number(newSylSemester),
      credits: Number(newSylCredits),
      modules: [
        { number: 1, title: 'Module 1', hours: 8, topics: newSylModule1.trim() || 'Core foundations and objectives' },
        { number: 2, title: 'Module 2', hours: 8, topics: newSylModule2.trim() || 'Intermediate methodologies and models' },
        { number: 3, title: 'Module 3', hours: 10, topics: newSylModule3.trim() || 'Design principles and proofs' },
        { number: 4, title: 'Module 4', hours: 8, topics: newSylModule4.trim() || 'Applied mechanisms and architecture' },
        { number: 5, title: 'Module 5', hours: 8, topics: newSylModule5.trim() || 'Advanced applications and analysis' },
      ],
      textbooks: newSylTextbook.trim() ? [newSylTextbook.trim()] : ['Standard VTU Prescribed Textbook'],
    };

    try {
      const res = await fetch('/api/syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.syllabus) {
        setSyllabi((prev) => [data.syllabus, ...prev.filter((s) => s.code !== data.syllabus.code)]);
        setIsAddSyllabusOpen(false);
        setNewSylCode('');
        setNewSylTitle('');
        setNewSylModule1('');
        setNewSylModule2('');
        setNewSylModule3('');
        setNewSylModule4('');
        setNewSylModule5('');
        setActionMessage(`Syllabus for ${payload.code} added successfully!`);
      }
    } catch (_err) {
      alert('Failed to save syllabus item');
    }
  };

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.code.toLowerCase().includes(q) ||
      n.branch.toLowerCase().includes(q) ||
      (n.uploadedBy && n.uploadedBy.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Dashboard Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-red-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-bold font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Administrator Mode Active • Shravan Endarenu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              APS Notes Administration Control Panel
            </h2>
            <p className="text-xs text-slate-300">
              Manage study materials, delete incorrect notes, register new VTU syllabi, and view registered students.
            </p>
          </div>

          <button
            onClick={onExitAdmin}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Admin View</span>
          </button>
        </div>

        {/* Quick metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Total Notes</span>
            <span className="text-xl font-black text-white font-mono">{notes.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Syllabus Items</span>
            <span className="text-xl font-black text-white font-mono">{syllabi.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Registered Students</span>
            <span className="text-xl font-black text-white font-mono">{students.length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-slate-400 block text-[11px]">Database Provider</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Supabase Live
            </span>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 animate-fade-in font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('notes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'notes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Control Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('syllabus')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'syllabus'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>VTU Syllabus ({syllabi.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('students');
            loadStudents();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Students ({students.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: NOTES CONTROL (DELETE INCORRECT / UNVERIFIED NOTES) */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search notes by subject code, title, or author to manage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-red-500"
              />
            </div>
            <span className="text-xs text-slate-500">
              Showing {filteredNotes.length} of {notes.length} total notes
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Branch &amp; Sem</th>
                    <th className="py-3 px-4">Author / Contributor</th>
                    <th className="py-3 px-4">PDF Attached</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredNotes.map((note) => (
                    <tr key={note.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{note.title}</div>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                          {note.code}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {note.branch} • Sem {note.semester} ({note.scheme} Scheme)
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">{note.author}</div>
                        {note.isCommunityUploaded && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Community Upload
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {note.pdfFileName || (note.pdfDataUrl ? 'PDF attached' : 'Web modules')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteNote(note)}
                          disabled={deletingId === note.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          title="Delete this note permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{deletingId === note.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VTU SYLLABUS MANAGEMENT */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">VTU Course Syllabi &amp; Modules</h3>
            <button
              onClick={() => setIsAddSyllabusOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New VTU Syllabus</span>
            </button>
          </div>

          {/* Add Syllabus Modal */}
          {isAddSyllabusOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-slate-900 text-base">Add New VTU Syllabus</h4>
                  </div>
                  <button onClick={() => setIsAddSyllabusOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSyllabus} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subject Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1BCS401"
                        value={newSylCode}
                        onChange={(e) => setNewSylCode(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Subject Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Design & Analysis of Algorithms"
                        value={newSylTitle}
                        onChange={(e) => setNewSylTitle(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Branch</label>
                      <select
                        value={newSylBranch}
                        onChange={(e) => setNewSylBranch(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="CSE-ISE">CSE-ISE</option>
                        <option value="AIML-DS">AIML-DS</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Mech">Mechanical</option>
                        <option value="Civil">Civil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Scheme</label>
                      <select
                        value={newSylScheme}
                        onChange={(e) => setNewSylScheme(e.target.value as '2022' | '2025')}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="2025">2025 Scheme</option>
                        <option value="2022">2022 Scheme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Semester</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={newSylSemester}
                        onChange={(e) => setNewSylSemester(Number(e.target.value))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                      Module Topics
                    </span>
                    <input
                      type="text"
                      placeholder="Module 1 topics..."
                      value={newSylModule1}
                      onChange={(e) => setNewSylModule1(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Module 2 topics..."
                      value={newSylModule2}
                      onChange={(e) => setNewSylModule2(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Module 3 topics..."
                      value={newSylModule3}
                      onChange={(e) => setNewSylModule3(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Module 4 topics..."
                      value={newSylModule4}
                      onChange={(e) => setNewSylModule4(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Module 5 topics..."
                      value={newSylModule5}
                      onChange={(e) => setNewSylModule5(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prescribed Textbook</label>
                    <input
                      type="text"
                      placeholder="Author, Book Title, Edition, Publisher"
                      value={newSylTextbook}
                      onChange={(e) => setNewSylTextbook(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddSyllabusOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                    >
                      Save Syllabus
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Syllabus Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {syllabi.map((syl) => (
              <div
                key={syl.code}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {syl.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {syl.branch} • Sem {syl.semester} ({syl.scheme} Scheme)
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{syl.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                    <div><strong>Credits:</strong> {syl.credits} | <strong>Exam:</strong> {syl.examHours} Hours</div>
                    <div><strong>Modules:</strong> {syl.modules?.length || 5} units defined</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">VTU Curriculum Entry</span>
                  <button
                    onClick={() => handleDeleteSyllabus(syl.code)}
                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Syllabus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: REGISTERED STUDENTS */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Registered Students in Database</h3>
            <button
              onClick={loadStudents}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStudents ? 'animate-spin' : ''}`} />
              <span>Refresh Students</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Username</th>
                    <th className="py-3 px-4">Branch &amp; Semester</th>
                    <th className="py-3 px-4">USN</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No student registrations recorded yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.username} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{st.name}</td>
                        <td className="py-3 px-4 font-mono text-teal-700 font-semibold">{st.username}</td>
                        <td className="py-3 px-4 text-slate-600">{st.branch} (Sem {st.semester})</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{st.usn || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{st.college || '-'}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Active'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
