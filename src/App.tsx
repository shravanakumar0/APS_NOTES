import { useState, useEffect } from 'react';
import { ActiveTab, StudentProfile } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NotesGrid } from './components/NotesGrid';
import { LabProgramsView } from './components/LabProgramsView';
import { SgpaCalculator } from './components/SgpaCalculator';
import { CgpaCalculator } from './components/CgpaCalculator';
import { SyllabusView } from './components/SyllabusView';
import { QuestionPaperVault } from './components/QuestionPaperVault';
import { GeminiSupportBot } from './components/GeminiSupportBot';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { StudentProfileModal } from './components/StudentProfileModal';
import { SearchModal } from './components/SearchModal';
import { UploadModal } from './components/UploadModal';
import { SupportUsModal } from './components/SupportUsModal';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { PdfViewerModal } from './components/PdfViewerModal';
import { SubjectNote, LabProgram, QuestionPaper } from './data/apsData';

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Shravan Kumar',
  branch: 'CSE-ISE',
  scheme: '2025',
  semester: 3,
  college: 'APS College of Engineering, Bangalore',
};

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('aps_student_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // STRICTLY UPLOADED ONLY: zero demo notes, zero demo labs, zero demo question papers
  const [notesList, setNotesList] = useState<SubjectNote[]>(() => {
    try {
      const localUploaded = localStorage.getItem('aps_uploaded_notes');
      return localUploaded ? JSON.parse(localUploaded) : [];
    } catch {
      return [];
    }
  });

  const [labsList, setLabsList] = useState<LabProgram[]>(() => {
    try {
      const localLabs = localStorage.getItem('aps_uploaded_labs');
      return localLabs ? JSON.parse(localLabs) : [];
    } catch {
      return [];
    }
  });

  const [papersList, setPapersList] = useState<QuestionPaper[]>(() => {
    try {
      const localPapers = localStorage.getItem('aps_uploaded_papers');
      return localPapers ? JSON.parse(localPapers) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');

  // PDF Viewer Modal State
  const [activePdfDoc, setActivePdfDoc] = useState<
    | { type: 'note'; data: SubjectNote }
    | { type: 'lab'; data: LabProgram }
    | { type: 'paper'; data: QuestionPaper }
    | null
  >(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSupportUsModalOpen, setIsSupportUsModalOpen] = useState(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');

  // Prefill state for upload modal
  const [uploadPrefill, setUploadPrefill] = useState<{
    branch?: string;
    semester?: number;
    scheme?: '2022' | '2025' | '2021';
  }>({});

  const handleOpenPdfForNote = (note: SubjectNote) => {
    setActivePdfDoc({ type: 'note', data: note });
    setIsPdfModalOpen(true);
  };

  const handleOpenPdfForLab = (lab: LabProgram) => {
    setActivePdfDoc({ type: 'lab', data: lab });
    setIsPdfModalOpen(true);
  };

  const handleOpenPdfForPaper = (qp: QuestionPaper) => {
    setActivePdfDoc({ type: 'paper', data: qp });
    setIsPdfModalOpen(true);
  };

  const handleTriggerUpload = (branch?: string, semester?: number, scheme?: string) => {
    setUploadPrefill({
      branch: branch || profile.branch,
      semester: semester || profile.semester,
      scheme: (scheme as '2022' | '2025' | '2021') || profile.scheme,
    });
    setIsUploadModalOpen(true);
  };

  // Fetch server notes, labs, papers on mount to sync with backend
  useEffect(() => {
    fetch('/api/notes')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.notes)) {
          setNotesList((prev) => {
            const serverIds = new Set(data.notes.map((n: SubjectNote) => n.id));
            const localOnly = prev.filter((n) => !serverIds.has(n.id));
            return [...localOnly, ...data.notes];
          });
        }
      })
      .catch((err) => console.log('Notes sync ready', err));

    fetch('/api/labs')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.labs)) {
          setLabsList((prev) => {
            const serverIds = new Set(data.labs.map((l: LabProgram) => l.id));
            const localOnly = prev.filter((l) => !serverIds.has(l.id));
            return [...localOnly, ...data.labs];
          });
        }
      })
      .catch((err) => console.log('Labs sync ready', err));

    fetch('/api/papers')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.papers)) {
          setPapersList((prev) => {
            const serverIds = new Set(data.papers.map((p: QuestionPaper) => p.id));
            const localOnly = prev.filter((p) => !serverIds.has(p.id));
            return [...localOnly, ...data.papers];
          });
        }
      })
      .catch((err) => console.log('Papers sync ready', err));
  }, []);

  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('aps_student_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Immediate publication when any student uploads a note
  const handleNoteUploaded = (newNote: SubjectNote) => {
    setNotesList((prev) => {
      const updated = [newNote, ...prev.filter(n => n.id !== newNote.id)];
      try {
        localStorage.setItem('aps_uploaded_notes', JSON.stringify(updated));
      } catch (quotaError) {
        console.warn('Quota reached, caching metadata:', quotaError);
      }
      return updated;
    });

    handleOpenPdfForNote(newNote);
  };

  // When a lab is uploaded
  const handleLabUploaded = (newLab: LabProgram) => {
    setLabsList((prev) => {
      const updated = [newLab, ...prev.filter(l => l.id !== newLab.id)];
      try {
        localStorage.setItem('aps_uploaded_labs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Quota warning:', e);
      }
      return updated;
    });
  };

  // When a question paper is uploaded
  const handlePaperUploaded = (newPaper: QuestionPaper) => {
    setPapersList((prev) => {
      const updated = [newPaper, ...prev.filter(p => p.id !== newPaper.id)];
      try {
        localStorage.setItem('aps_uploaded_papers', JSON.stringify(updated));
      } catch (e) {
        console.warn('Quota warning:', e);
      }
      return updated;
    });
  };

  const handleAskGemini = (prompt: string) => {
    setAiAssistantPrompt(prompt);
    setActiveTab('support');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSelect = (tab: ActiveTab, payload?: any) => {
    setActiveTab(tab);
    if (tab === 'notes' && payload) {
      handleOpenPdfForNote(payload as SubjectNote);
    } else if (tab === 'labs' && payload) {
      handleOpenPdfForLab(payload as LabProgram);
    } else if (tab === 'papers' && payload) {
      handleOpenPdfForPaper(payload as QuestionPaper);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to top when active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenUpload={() => handleTriggerUpload()}
        onOpenSupportUs={() => setIsSupportUsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <div className="space-y-10">
            {/* Hero Banner */}
            <Hero
              profile={profile}
              setActiveTab={setActiveTab}
              onOpenAiChat={() => setActiveTab('support')}
              onOpenUpload={() => handleTriggerUpload()}
            />

            {/* Layout with Main Column & Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left/Main Column: Notes & Quick Access */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        VTU Notes &amp; PDF Repository
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Only student &amp; faculty uploaded PDF resources appear below. Select your branch and semester.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <NotesGrid
                    profile={profile}
                    notes={notesList}
                    onSelectNote={handleOpenPdfForNote}
                    onOpenPdfViewer={handleOpenPdfForNote}
                    onAskGemini={handleAskGemini}
                    onOpenUpload={handleTriggerUpload}
                  />
                </div>

                {/* Right Column: Authentic Sidebar */}
                <div className="lg:col-span-4">
                  <Sidebar
                    setActiveTab={setActiveTab}
                    onOpenUpload={() => handleTriggerUpload()}
                    onOpenSupportUs={() => setIsSupportUsModalOpen(true)}
                    onOpenAiChat={() => setActiveTab('support')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  VTU Study Notes &amp; Revision Material
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Categorized by branch and semester. Only verified uploaded PDF materials are displayed.
                </p>
              </div>
            </div>

            <NotesGrid
              profile={profile}
              notes={notesList}
              onSelectNote={handleOpenPdfForNote}
              onOpenPdfViewer={handleOpenPdfForNote}
              onAskGemini={handleAskGemini}
              onOpenUpload={handleTriggerUpload}
            />
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <LabProgramsView
              profile={profile}
              labs={labsList}
              onOpenPdfViewer={handleOpenPdfForLab}
              onAskGemini={handleAskGemini}
              onOpenUpload={handleTriggerUpload}
            />
          </div>
        )}

        {activeTab === 'sgpa' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <SgpaCalculator profile={profile} onAskGemini={handleAskGemini} />
          </div>
        )}

        {activeTab === 'cgpa' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <CgpaCalculator profile={profile} onAskGemini={handleAskGemini} />
          </div>
        )}

        {activeTab === 'syllabus' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <SyllabusView profile={profile} onAskGemini={handleAskGemini} />
          </div>
        )}

        {activeTab === 'papers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <QuestionPaperVault
              profile={profile}
              papers={papersList}
              onOpenPdfViewer={handleOpenPdfForPaper}
              onAskGemini={handleAskGemini}
              onOpenUpload={handleTriggerUpload}
            />
          </div>
        )}

        {activeTab === 'support' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="mb-4">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                APS AI Customer Support &amp; Academic Helpdesk
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time, personalized AI support powered by Gemini for VTU syllabus, exam preparation, and technical doubts.
              </p>
            </div>
            <GeminiSupportBot
              profile={profile}
              isFullPage={true}
              initialTopic={aiAssistantPrompt}
            />
          </div>
        )}
      </main>

      {/* Floating Action Button (Active on all tabs) */}
      <FloatingSupportWidget profile={profile} initialTopic={aiAssistantPrompt} />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiChat={() => setActiveTab('support')}
      />

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenSupportUs={() => setIsSupportUsModalOpen(true)}
        onOpenUpload={() => handleTriggerUpload()}
      />

      {/* Modals */}
      <StudentProfileModal
        profile={profile}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Dedicated Interactive PDF Document Viewer */}
      <PdfViewerModal
        document={activePdfDoc}
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectAction={handleSearchSelect}
        notes={notesList}
      />

      <UploadModal
        profile={profile}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onNoteUploaded={handleNoteUploaded}
        onLabUploaded={handleLabUploaded}
        onPaperUploaded={handlePaperUploaded}
        onOpenPdfViewer={handleOpenPdfForNote}
        initialBranch={uploadPrefill.branch}
        initialSemester={uploadPrefill.semester}
        initialScheme={uploadPrefill.scheme}
      />

      <SupportUsModal
        isOpen={isSupportUsModalOpen}
        onClose={() => setIsSupportUsModalOpen(false)}
      />
    </div>
  );
}
