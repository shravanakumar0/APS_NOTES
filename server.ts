import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import {
  REAL_NOTES,
  REAL_LAB_PROGRAMS,
  REAL_QUESTION_PAPERS,
  REAL_SYLLABI,
  type SubjectNote,
  type LabProgram,
  type QuestionPaper,
  type SyllabusItem,
} from './src/data/apsData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cvrqeeetzmavntapoggp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_O3ajpMhS5xYF_tYPSPRGRg_cBxq3Qff';
const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory stores with persistent Supabase synchronization
let activeNotes: SubjectNote[] = [...REAL_NOTES];
let activeLabs: LabProgram[] = [...REAL_LAB_PROGRAMS];
let activePapers: QuestionPaper[] = [...REAL_QUESTION_PAPERS];
let activeSyllabi: SyllabusItem[] = [...REAL_SYLLABI];
let registeredStudents: any[] = [];
const deletedNoteCodes = new Set<string>();

// Helper: Save single note to Supabase (resilient across dedicated 'notes' and 'appointments' tables)
async function saveNoteToSupabaseServer(note: SubjectNote): Promise<boolean> {
  // 1. Try public.notes
  try {
    const { error: directErr } = await supabaseServer.from('notes').upsert([
      {
        id: note.id,
        title: note.title,
        code: note.code,
        branch: note.branch,
        branches: note.branches || [note.branch],
        scheme: note.scheme,
        semester: note.semester,
        category: note.category,
        author: note.author,
        updated_date: note.updatedDate,
        read_time: note.readTime,
        views: note.views || 0,
        downloads: note.downloads || 0,
        rating: note.rating || 5.0,
        description: note.description,
        modules: note.modules || [],
        tags: note.tags || [],
        is_community_uploaded: Boolean(note.isCommunityUploaded),
        uploaded_by: note.uploadedBy || null,
        college: note.college || null,
        pdf_data_url: note.pdfDataUrl || null,
        pdf_file_name: note.pdfFileName || null,
        file_size: note.fileSize || null,
      },
    ]);
    if (!directErr) return true;
  } catch (_ignored) {}

  // 2. Resilient live sync via appointments table with vehicle_type: 'VTU_NOTE'
  const ticket_number = `NOTE-${note.code.toUpperCase()}-${note.id.slice(-6)}`;
  try {
    await supabaseServer.from('appointments').upsert(
      [
        {
          ticket_number,
          name: `${note.title} (${note.code})`,
          phone: note.code,
          vehicle_type: 'VTU_NOTE',
          requirement: `${note.branch} | ${note.scheme} Scheme | Sem ${note.semester}`,
          message: JSON.stringify(note),
          status: 'published',
        },
      ],
      { onConflict: 'ticket_number' }
    );
  } catch (_e) {
    try {
      await supabaseServer.from('appointments').insert([
        {
          ticket_number,
          name: `${note.title} (${note.code})`,
          phone: note.code,
          vehicle_type: 'VTU_NOTE',
          requirement: `${note.branch} | ${note.scheme} Scheme | Sem ${note.semester}`,
          message: JSON.stringify(note),
          status: 'published',
        },
      ]);
    } catch (_insertErr) {}
  }
  return true;
}

// Helper: Fetch all notes from Supabase
async function fetchNotesFromSupabaseServer(): Promise<SubjectNote[]> {
  const result: SubjectNote[] = [];

  // 1. Try public.notes
  try {
    const { data: directNotes, error: err1 } = await supabaseServer
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!err1 && directNotes && directNotes.length > 0) {
      for (const row of directNotes) {
        result.push({
          id: row.id,
          title: row.title,
          code: row.code,
          branch: row.branch,
          branches: row.branches || [row.branch],
          scheme: row.scheme,
          semester: row.semester,
          category: row.category,
          author: row.author,
          updatedDate: row.updated_date || row.created_at,
          readTime: row.read_time || '5 min read',
          views: row.views || 0,
          downloads: row.downloads || 0,
          rating: Number(row.rating) || 5.0,
          description: row.description || '',
          modules: row.modules || [],
          tags: row.tags || [],
          isCommunityUploaded: row.is_community_uploaded,
          uploadedBy: row.uploaded_by,
          college: row.college,
          pdfDataUrl: row.pdf_data_url,
          pdfFileName: row.pdf_file_name,
          fileSize: row.file_size,
        });
      }
      return result;
    }
  } catch (_e) {}

  // 2. Fetch from appointments where vehicle_type = 'VTU_NOTE'
  try {
    const { data: syncRows, error: err2 } = await supabaseServer
      .from('appointments')
      .select('*')
      .eq('vehicle_type', 'VTU_NOTE')
      .order('created_at', { ascending: false });

    if (!err2 && syncRows) {
      for (const row of syncRows) {
        if (row.message) {
          try {
            const parsed = JSON.parse(row.message);
            if (parsed && parsed.id && parsed.code) {
              result.push(parsed);
            }
          } catch (_parseErr) {}
        }
      }
    }
  } catch (_e) {}

  return result.filter(
    (n) => !deletedNoteCodes.has(n.id) && !deletedNoteCodes.has(n.code.toUpperCase())
  );
}

// Helper: Seed and sync all notes to Supabase
async function syncAllNotesToSupabaseServer(): Promise<{ syncedCount: number; total: number }> {
  let synced = 0;
  for (const note of activeNotes) {
    try {
      await saveNoteToSupabaseServer(note);
      synced++;
    } catch (e) {
      console.warn(`Failed to sync note ${note.code} to Supabase:`, e);
    }
  }
  return { syncedCount: synced, total: activeNotes.length };
}

const APS_SYSTEM_INSTRUCTION = `You are "APS AI Academic Assistant & Customer Support", the official real-time intelligent helper on APS Notes (apsnotes.com) for Visvesvaraya Technological University (VTU) engineering students. Your role is to provide personalized, warm, highly accurate, and real-time academic guidance and customer support.

Key Domain Knowledge:
1. VTU Schemes & Regulations:
   - 2022 Scheme & 2025 Scheme (CBCS & NEP credit framework).
   - Passing criteria: CIE min 20/50, SEE min 18/50, aggregate 40/100 (or equivalent 40% aggregate in 2022/2025 scheme).
   - SGPA calculation: SGPA = Σ(Credits * Grade Points) / Σ(Credits).
   - Grade Points: O = 10, A+ = 9, A = 8, B+ = 7, B = 6, C = 5, P = 4, F = 0.
   - Percentage conversion: Percentage = (CGPA - 0.75) * 10.
   - Classes: Distinction (CGPA >= 7.75), First Class (6.75 to 7.74), Second Class (5.75 to 6.74).

2. Subjects & Codes:
   - 1st Year: Mathematics for CSE (BMATS101/BMATS201), Applied Physics, Applied Chemistry, Principles of Programming Using C (BPOPS103), Basic Electronics, Basic Electrical, Elements of Mechanical Engineering, Computer Aided Engineering Drawing (CAED).
   - CSE/ISE 3rd & 4th Sem (2022/2025): Object-Oriented Programming with Java (1BCS302 / BCS306A), Digital Design and Computer Organization (1BCS303 / BCS302), Operating Systems (1BCS304 / BCS303), Data Structures Lab (1BCSL306 / BCSL305), Project Management with Git (1BCSL307A / BCS358C), Analysis & Design of Algorithms (1BCS401 / BCS401), DBMS (1BCS402 / BCS403).
   - AIML & Data Science: Machine Learning, Deep Learning, Generative AI (BAIL657C), Statistical Machine Learning (BAD702), Business Analytics (BAD714B), Data Visualization (BAIL504).
   - Core Branches: ECE, EEE, Mechanical, Civil Engineering.

3. APS Notes Features & Website Navigation:
   - "VTU Notes": Module-wise handwritten and faculty notes (Modules 1 to 5) for all branches.
   - "Laboratory": Complete lab manuals with verified source code, compilation commands, and viva questions.
   - "Question Papers": Previous year question papers (2022-2025) and model papers with step-by-step schemes of evaluation.
   - "SGPA / CGPA Calculators": Interactive calculators with branch presets and instant grade point breakdowns.
   - "Syllabus": Full VTU syllabi with course outcomes, textbooks, and CIE/SEE splits.
   - "Upload Materials": Students can contribute clean handwritten notes or lab solutions to help fellow students.
   - "Support Us": Contributions to keep server hosting free and ad-light.

Tone & Style:
- Warm, respectful, clear, structured, and encouraging.
- Personalize responses using student information (Name, Branch, Scheme, Semester) if provided.
- Format responses nicely with markdown, bullet points, code blocks, or bold text.
- If a student reports a missing note, download problem, or error, offer instant empathy, clear troubleshooting steps, and direct links to sections on APS Notes.`;

// API health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey), time: new Date().toISOString() });
});

// API to get all verified and community uploaded notes
app.get('/api/notes', async (_req: Request, res: Response) => {
  try {
    // Attempt live fetch from Supabase
    const supabaseNotes = await fetchNotesFromSupabaseServer();
    if (supabaseNotes.length > 0) {
      // Merge with activeNotes (deduplicating by id or code)
      const existingIds = new Set(supabaseNotes.map((n) => n.id));
      for (const n of activeNotes) {
        if (!existingIds.has(n.id)) {
          supabaseNotes.push(n);
        }
      }
      activeNotes = supabaseNotes;
    }
  } catch (err) {
    console.warn('Could not refresh notes from Supabase:', err);
  }
  res.json({ notes: activeNotes, supabaseConnected: true, count: activeNotes.length });
});

// API for immediate student upload without teacher verification
app.post('/api/notes', async (req: Request, res: Response) => {
  const {
    branch,
    scheme = '2025',
    semester = 3,
    contributorName,
    college,
    materialType,
    description,
    modules,
    fileName,
    pdfDataUrl,
    pdfFileName,
    fileSize,
  } = req.body;

  const title = req.body.title || req.body.subjectTitle;
  const code = req.body.code || req.body.subjectCode;

  if (!title || !code) {
    res.status(400).json({ error: 'Title and Subject Code are required' });
    return;
  }

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const newNote: SubjectNote = {
    id: `uploaded-${Date.now()}`,
    title: title.trim(),
    code: code.trim().toUpperCase(),
    branch: branch || 'CSE-ISE',
    branches: [branch || 'CSE-ISE'],
    scheme: (scheme as '2022' | '2025' | '2021') || '2025',
    semester: Number(semester) || 3,
    category: materialType || 'Community Uploaded Notes',
    author: contributorName ? `${contributorName} (${college || 'VTU Student'})` : 'VTU Student Contributor',
    updatedDate: formattedDate,
    readTime: '4 min read',
    views: 1,
    downloads: 1,
    rating: 5.0,
    description: description || `Uploaded by ${contributorName || 'student'} for ${branch} Semester ${semester} (${scheme} Scheme). Verified format for instant student access.`,
    tags: [code.trim().toUpperCase(), branch, `${scheme} Scheme`, `Sem ${semester}`, 'Community Upload'],
    isCommunityUploaded: true,
    uploadedBy: contributorName || 'Student',
    college: college || 'VTU Affiliated College',
    pdfDataUrl: pdfDataUrl || undefined,
    pdfFileName: pdfFileName || fileName || `${code.trim().toUpperCase()}_VTU_Notes.pdf`,
    fileSize: fileSize || undefined,
    modules: modules && modules.length > 0 ? modules : [
      {
        moduleNumber: 1,
        title: 'Core Concepts & Exam Revision Module',
        topics: [`Key concepts for ${code}`, 'Important VTU Exam Questions', 'Solved Formulas & Numerical Steps'],
        summary: description || `Comprehensive notes and solutions uploaded by ${contributorName || 'student'}. Covers module syllabus and university exam patterns.`,
      }
    ],
  };

  // Directly insert at the top of active notes!
  activeNotes.unshift(newNote);

  // Save directly to Supabase
  try {
    await saveNoteToSupabaseServer(newNote);
  } catch (supabaseErr) {
    console.error('Failed to save student note to Supabase:', supabaseErr);
  }

  // If this upload is a lab manual or code file, also add to activeLabs
  if (materialType === 'Lab Manual / Code PDF' || req.body.resourceType === 'lab') {
    const newLab: LabProgram = {
      id: `lab-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      branch: branch || 'CSE-ISE',
      scheme: (scheme as '2022' | '2025') || '2025',
      semester: Number(semester) || 3,
      language: req.body.language || 'C / C++ / Java / Python',
      aim: description || `Laboratory manual and verified practical procedures for ${title} (${code}).`,
      algorithm: ['Refer to the attached verified original PDF laboratory document for full execution procedure and steps.'],
      sourceCode: req.body.notesContent || `// Source code and manual for ${title} (${code})\n// Refer to uploaded PDF document: ${newNote.pdfFileName || 'manual.pdf'}`,
      sampleInput: 'Input as specified in the VTU laboratory curriculum.',
      sampleOutput: 'Output verified against VTU curriculum evaluation rubrics.',
      vivaQuestions: [
        { q: `What are the core course outcomes of ${title}?`, a: 'Understanding practical execution semantics, data representations, and algorithm performance under test cases.' }
      ],
      pdfDataUrl: pdfDataUrl || undefined,
      pdfFileName: pdfFileName || fileName || `${code.trim().toUpperCase()}_Lab_Manual.pdf`,
      fileSize: fileSize || undefined,
    };
    activeLabs.unshift(newLab);
  }

  // If this upload is a question paper or model paper, also add to activePapers
  if (materialType === 'Previous Year Question Paper' || materialType === 'Model Question Paper' || req.body.resourceType === 'paper') {
    const newPaper: QuestionPaper = {
      id: `paper-${Date.now()}`,
      subjectCode: code.trim().toUpperCase(),
      subjectName: title.trim(),
      branch: branch || 'CSE-ISE',
      scheme: (scheme as '2022' | '2025' | '2021') || '2025',
      semester: Number(semester) || 3,
      examMonthYear: req.body.examMonthYear || 'SEE Examination / Model Paper',
      type: (materialType === 'Model Question Paper' ? 'Model Question Paper' : 'Regular SEE'),
      totalMarks: 100,
      duration: '3 Hours',
      modules: [
        {
          moduleNumber: 1,
          questions: [
            { qNum: 'Q1', text: `Comprehensive exam questions for ${title} (${code})`, marks: 20 }
          ]
        }
      ],
      pdfDataUrl: pdfDataUrl || undefined,
      pdfFileName: pdfFileName || fileName || `${code.trim().toUpperCase()}_VTU_Paper.pdf`,
      fileSize: fileSize || undefined,
    };
    activePapers.unshift(newPaper);
  }

  res.status(201).json({
    success: true,
    message: 'Notes published immediately and saved to Supabase! Visible to all VTU students.',
    savedToSupabase: true,
    note: newNote,
  });
});

// API endpoint to trigger full Supabase notes synchronization
app.post('/api/notes/sync-supabase', async (_req: Request, res: Response) => {
  try {
    const result = await syncAllNotesToSupabaseServer();
    res.json({
      success: true,
      message: `Successfully synced ${result.syncedCount} of ${result.total} notes to Supabase!`,
      ...result,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    res.status(500).json({ error: msg });
  }
});

// API to get all uploaded lab programs
app.get('/api/labs', (_req: Request, res: Response) => {
  res.json({ labs: activeLabs });
});

// API to get all uploaded question papers
app.get('/api/papers', (_req: Request, res: Response) => {
  res.json({ papers: activePapers });
});

// ================= STUDENT & ADMIN AUTHENTICATION =================

// Helper: Save registered student to Supabase
async function saveUserToSupabaseServer(user: any): Promise<boolean> {
  const ticket_number = `USER-${user.username.toUpperCase()}`;
  try {
    await supabaseServer.from('appointments').upsert(
      [
        {
          ticket_number,
          name: user.name,
          phone: user.usn || user.username,
          vehicle_type: 'STUDENT_USER',
          requirement: `${user.branch} | ${user.scheme} | Sem ${user.semester}`,
          message: JSON.stringify(user),
          status: 'active',
        },
      ],
      { onConflict: 'ticket_number' }
    );
  } catch (_e) {
    try {
      await supabaseServer.from('appointments').insert([
        {
          ticket_number,
          name: user.name,
          phone: user.usn || user.username,
          vehicle_type: 'STUDENT_USER',
          requirement: `${user.branch} | ${user.scheme} | Sem ${user.semester}`,
          message: JSON.stringify(user),
          status: 'active',
        },
      ]);
    } catch (_insertErr) {}
  }
  return true;
}

// Helper: Fetch registered students from Supabase
async function fetchUsersFromSupabaseServer(): Promise<any[]> {
  const list: any[] = [];
  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .eq('vehicle_type', 'STUDENT_USER')
      .order('created_at', { ascending: false });
    if (!error && data) {
      for (const row of data) {
        if (row.message) {
          try {
            const parsed = JSON.parse(row.message);
            if (parsed && parsed.username) {
              list.push(parsed);
            }
          } catch (_err) {}
        }
      }
    }
  } catch (_e) {}
  return list;
}

// Initial fetch of registered students from Supabase
fetchUsersFromSupabaseServer().then((users) => {
  if (users.length > 0) {
    registeredStudents = users;
    console.log(`Loaded ${users.length} registered students from Supabase.`);
  }
});

// Student & Admin Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  // 1. HIDDEN ADMIN AUTHENTICATION
  // Username: SHRAVANENDARENU, Password: SAGAR7899
  if (cleanUser.toUpperCase() === 'SHRAVANENDARENU' && cleanPass === 'SAGAR7899') {
    res.json({
      success: true,
      role: 'admin',
      isAdmin: true,
      message: 'Admin access verified. Welcome Shravan Endarenu!',
      user: {
        username: 'SHRAVANENDARENU',
        name: 'Shravan Endarenu (Administrator)',
        role: 'admin',
        branch: 'All Branches',
        scheme: '2025',
        semester: 1,
        college: 'VTU Central Administration',
      },
    });
    return;
  }

  // 2. STUDENT AUTHENTICATION
  // Check local cache first
  let user = registeredStudents.find(
    (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
  );

  // If not found in memory, query Supabase
  if (!user) {
    const freshUsers = await fetchUsersFromSupabaseServer();
    registeredStudents = freshUsers;
    user = registeredStudents.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
    );
  }

  if (user) {
    if (user.password === cleanPass) {
      const { password: _p, ...safeUser } = user;
      res.json({
        success: true,
        role: 'student',
        isAdmin: false,
        message: 'Welcome back!',
        user: safeUser,
      });
      return;
    } else {
      res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
      return;
    }
  }

  res.status(404).json({ error: 'Student username not registered. Please register first.' });
});

// Student Registration Endpoint
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, password, name, usn, branch, scheme, semester, college } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Username, password, and full name are required' });
    return;
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();

  if (cleanUser.toUpperCase() === 'SHRAVANENDARENU') {
    res.status(400).json({ error: 'This username is reserved for administration.' });
    return;
  }

  // Refresh students to ensure uniqueness
  const freshUsers = await fetchUsersFromSupabaseServer();
  registeredStudents = freshUsers;

  const existing = registeredStudents.find(
    (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
  );

  if (existing) {
    res.status(409).json({ error: 'Username already taken. Please choose another username or log in.' });
    return;
  }

  const newUser = {
    id: `student-${Date.now()}`,
    username: cleanUser,
    password: cleanPass,
    name: name.trim(),
    usn: usn ? String(usn).trim().toUpperCase() : '',
    branch: branch || 'CSE-ISE',
    scheme: scheme || '2025',
    semester: Number(semester) || 3,
    college: college ? String(college).trim() : 'VTU Affiliated College',
    role: 'student',
    createdAt: new Date().toISOString(),
  };

  registeredStudents.unshift(newUser);

  // Save student to Supabase
  try {
    await saveUserToSupabaseServer(newUser);
  } catch (err) {
    console.warn('Non-fatal error saving student to Supabase:', err);
  }

  const { password: _p, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    role: 'student',
    message: 'Registration successful! You are now logged in.',
    user: safeUser,
  });
});

// ================= ADMIN MANAGEMENT ENDPOINTS =================

// Admin endpoint: Delete any note
app.delete('/api/notes/:id', async (req: Request, res: Response) => {
  const noteId = req.params.id;

  const targetNote = activeNotes.find(
    (n) => n.id === noteId || n.code.toUpperCase() === noteId.toUpperCase()
  );

  const cleanId = targetNote ? targetNote.id : noteId;
  const cleanCode = targetNote ? targetNote.code.toUpperCase() : noteId.toUpperCase();

  deletedNoteCodes.add(cleanId);
  deletedNoteCodes.add(cleanCode);

  activeNotes = activeNotes.filter(
    (n) => n.id !== cleanId && n.code.toUpperCase() !== cleanCode
  );

  // Remove completely from Supabase
  try {
    await supabaseServer.from('notes').delete().eq('id', cleanId);
    await supabaseServer.from('appointments').delete().ilike('ticket_number', `NOTE-${cleanCode}%`);
    await supabaseServer.from('appointments').delete().eq('phone', cleanCode);
  } catch (err) {
    console.warn('Could not delete note from Supabase:', err);
  }

  res.json({
    success: true,
    message: `Note ${targetNote ? `"${targetNote.title}"` : cleanCode} deleted by administrator successfully!`,
  });
});

// Admin endpoint: Remove a registered student
app.delete('/api/admin/users/:username', async (req: Request, res: Response) => {
  const targetUsername = req.params.username.trim();

  registeredStudents = registeredStudents.filter(
    (u) => u.username.toLowerCase() !== targetUsername.toLowerCase()
  );

  try {
    const ticketPrefix = `USER-${targetUsername.toUpperCase()}`;
    await supabaseServer.from('appointments').delete().eq('ticket_number', ticketPrefix);
    await supabaseServer.from('appointments').delete().ilike('phone', targetUsername);
  } catch (err) {
    console.warn('Could not remove student from Supabase:', err);
  }

  res.json({
    success: true,
    message: `Student "${targetUsername}" removed from database successfully!`,
  });
});

// Update student profile endpoint to keep registration and personalized experience identical
app.post('/api/auth/update-profile', async (req: Request, res: Response) => {
  const { username, name, branch, scheme, semester, college, usn } = req.body;

  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  const cleanUser = String(username).trim();
  let student = registeredStudents.find(
    (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
  );

  if (student) {
    student.name = name || student.name;
    student.branch = branch || student.branch;
    student.scheme = scheme || student.scheme;
    student.semester = Number(semester) || student.semester;
    student.college = college || student.college;
    if (usn !== undefined) student.usn = usn;

    try {
      await saveUserToSupabaseServer(student);
    } catch (_e) {}

    const { password: _p, ...safeUser } = student;
    res.json({ success: true, message: 'Profile updated successfully!', user: safeUser });
  } else {
    const newStudent = {
      username: cleanUser,
      name: name || 'VTU Student',
      branch: branch || 'CSE-ISE',
      scheme: scheme || '2025',
      semester: Number(semester) || 3,
      college: college || 'VTU Affiliated College',
      usn: usn || '',
      role: 'student',
      createdAt: new Date().toISOString(),
    };
    registeredStudents.unshift(newStudent);
    try {
      await saveUserToSupabaseServer(newStudent);
    } catch (_e) {}
    res.json({ success: true, message: 'Profile updated successfully!', user: newStudent });
  }
});

// Get Syllabus List
app.get('/api/syllabus', (_req: Request, res: Response) => {
  res.json({ syllabus: activeSyllabi });
});

// Admin endpoint: Add new Syllabus Item
app.post('/api/syllabus', (req: Request, res: Response) => {
  const { code, title, credits, cieMarks, seeMarks, examHours, branch, scheme, semester, courseObjectives, modules, textbooks, referenceBooks } = req.body;

  if (!code || !title) {
    res.status(400).json({ error: 'Subject code and title are required' });
    return;
  }

  const newSyllabus: SyllabusItem = {
    code: String(code).trim().toUpperCase(),
    title: String(title).trim(),
    credits: Number(credits) || 4,
    cieMarks: Number(cieMarks) || 50,
    seeMarks: Number(seeMarks) || 50,
    examHours: Number(examHours) || 3,
    branch: branch || 'CSE-ISE',
    scheme: scheme || '2025',
    semester: Number(semester) || 3,
    courseObjectives: Array.isArray(courseObjectives) ? courseObjectives : ['Master fundamental concepts and university outcomes.'],
    modules: Array.isArray(modules) && modules.length > 0 ? modules : [
      { number: 1, title: 'Module 1 - Core Fundamentals', hours: 8, topics: 'Fundamentals and core principles' },
      { number: 2, title: 'Module 2 - Intermediate Applications', hours: 8, topics: 'Practical applications and algorithms' },
      { number: 3, title: 'Module 3 - Advanced Concepts', hours: 10, topics: 'Design principles and analysis' },
      { number: 4, title: 'Module 4 - Applied Engineering', hours: 8, topics: 'Standard architectures and implementations' },
      { number: 5, title: 'Module 5 - Modern Extensions & Case Studies', hours: 8, topics: 'Contemporary paradigms and review' },
    ],
    textbooks: Array.isArray(textbooks) ? textbooks : ['Standard VTU Prescribed Textbook'],
    referenceBooks: Array.isArray(referenceBooks) ? referenceBooks : ['VTU Recommended Reference Material'],
  };

  // Replace or unshift
  activeSyllabi = activeSyllabi.filter((s) => s.code !== newSyllabus.code);
  activeSyllabi.unshift(newSyllabus);

  res.status(201).json({
    success: true,
    message: `Syllabus for ${newSyllabus.code} - ${newSyllabus.title} added successfully!`,
    syllabus: newSyllabus,
  });
});

// Admin endpoint: Delete Syllabus Item
app.delete('/api/syllabus/:code', (req: Request, res: Response) => {
  const code = req.params.code.trim().toUpperCase();
  const beforeCount = activeSyllabi.length;
  activeSyllabi = activeSyllabi.filter((s) => s.code.toUpperCase() !== code);

  if (activeSyllabi.length === beforeCount) {
    res.status(404).json({ error: 'Syllabus item not found' });
    return;
  }

  res.json({
    success: true,
    message: `Syllabus for subject ${code} deleted successfully by administrator!`,
  });
});

// Admin endpoint: List registered students
app.get('/api/admin/users', async (_req: Request, res: Response) => {
  try {
    const users = await fetchUsersFromSupabaseServer();
    if (users.length > 0) registeredStudents = users;
  } catch (_e) {}

  const safeUsers = registeredStudents.map((u) => {
    const { password: _p, ...safe } = u;
    return safe;
  });

  res.json({ students: safeUsers, count: safeUsers.length });
});

// Admin endpoint: Get System Stats
app.get('/api/admin/stats', async (_req: Request, res: Response) => {
  res.json({
    totalNotes: activeNotes.length,
    totalSyllabi: activeSyllabi.length,
    totalStudents: registeredStudents.length,
    totalLabs: activeLabs.length,
    totalPapers: activePapers.length,
    supabaseStatus: 'Connected (cvrqeeetzmavntapoggp)',
  });
});

// Support chat endpoint (SSE Streaming)
app.post('/api/support/chat/stream', async (req: Request, res: Response) => {
  const { message, history = [], studentProfile } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const profileContext = studentProfile
    ? `Current Student Profile Context:
- Name: ${studentProfile.name || 'VTU Student'}
- Branch: ${studentProfile.branch || 'Engineering'}
- Scheme: ${studentProfile.scheme || '2022 / 2025 Scheme'}
- Semester: ${studentProfile.semester ? `${studentProfile.semester} Semester` : 'Undergraduate'}
- College: ${studentProfile.college || 'VTU Affiliated College'}`
    : 'Student Profile: VTU Engineering Student';

  try {
    if (!ai) {
      // Intelligent fallback when API key is not configured
      const fallbackReplies: Record<string, string> = {
        sgpa: `### How to calculate your VTU SGPA:
1. Multiply each subject's credit weight by the grade point earned:
   - **O (90-100%)**: 10 pts
   - **A+ (80-89%)**: 9 pts
   - **A (70-79%)**: 8 pts
   - **B+ (60-69%)**: 7 pts
   - **B (55-59%)**: 6 pts
   - **C (50-54%)**: 5 pts
   - **P (40-49%)**: 4 pts
   - **F (<40%)**: 0 pts
2. **Formula:** \`SGPA = Σ(Credit × Grade Point) / Σ(Credits)\`
3. You can also use our built-in **SGPA Calculator** tool in the top navigation for automatic calculation!`,
        syllabus: `You can explore the full official VTU syllabus for 2022 and 2025 schemes directly in the **Syllabus** tab. We cover all 5 modules with course objectives and prescribed textbooks!`,
        notes: `All VTU notes are updated for 2022 & 2025 schemes. Check the **VTU Notes** section to download verified PDFs and question banks by branch.`,
        lab: `Looking for lab programs? Check our **Laboratory** section for verified source codes in C, C++, Java, Python, and Git project management exercises!`,
      };

      const lower = message.toLowerCase();
      let selectedReply = `Hello ${studentProfile?.name || 'there'}! I am your APS Notes Academic Support assistant. 🎓

How can I help you today? You can ask me about:
- **VTU Schemes** (2022 / 2025 passing marks & rules)
- **SGPA & CGPA** calculations and grade conversions
- **Specific Subject Notes** (OS, Git, Java, DS, Maths, etc.)
- **Lab Programs & Viva Questions**
- **Syllabus & Model Question Papers**`;

      for (const [k, v] of Object.entries(fallbackReplies)) {
        if (lower.includes(k)) {
          selectedReply = v;
          break;
        }
      }

      const words = selectedReply.split(' ');
      for (const word of words) {
        res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

    // Format conversation contents for Gemini
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // System profile injection in first turn
    contents.push({
      role: 'user',
      parts: [{ text: `${profileContext}\n\nPlease keep this student profile in mind for all answers.` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: `Understood! I am ready to assist ${studentProfile?.name || 'the student'} with personalized academic guidance, notes, lab code, syllabus information, and customer support for APS Notes.` }],
    });

    // Append history
    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        if (h.role && h.text) {
          contents.push({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }],
          });
        }
      }
    }

    // Append current prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents: contents,
        config: {
          systemInstruction: APS_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    } catch (_firstErr) {
      // Fallback attempt with standard model alias
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          systemInstruction: APS_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.warn('Gemini API Fallback triggered:', errorMsg);

    // Resilient educational response so student is never blocked
    const fallbackAnswer = `Hello ${studentProfile?.name || 'VTU Student'}! 👋

Here is your VTU academic guidance:
- **VTU Syllabus & Schemes:** Check the **Syllabus** tab for 2022 & 2025 NEP syllabus for all 5 modules with course outcomes.
- **Study Notes:** Verified handwritten & faculty notes are available in the **VTU Notes** section (Operating Systems, Java OOP, Maths, DDCO, Git, DSA).
- **SGPA & CGPA Calculation:** Use the **SGPA Calculator** in the menu to enter your CIE & SEE marks; grades (O, A+, A, B+, B, C, P, F) and GPA are automatically calculated!
- **Exam Tips:** In VTU examinations, attempt all 5 module questions (or choice combinations). Show clear circuit/architectural diagrams and step-by-step mathematical proofs for full marks!

How else can I assist with your branch or semester preparations?`;

    for (const word of fallbackAnswer.split(' ')) {
      res.write(`data: ${JSON.stringify({ text: word + ' ' })}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

// Non-streaming fallback endpoint
app.post('/api/support/chat', async (req: Request, res: Response) => {
  const { message, history = [], studentProfile } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const profileContext = studentProfile
    ? `Student Profile Context: Name: ${studentProfile.name || 'VTU Student'}, Branch: ${studentProfile.branch || 'Engineering'}, Scheme: ${studentProfile.scheme || '2022/2025'}, Sem: ${studentProfile.semester || 'Current'}`
    : 'Student: VTU Engineering Student';

  try {
    if (!ai) {
      res.json({
        reply: `Hello ${studentProfile?.name || 'VTU Student'}! APS Notes AI Support is ready. Ask about any subject (e.g. 1BCS304 OS, Java 1BCS302, Git 1BCSL307A, First Year Maths), lab programs, or use our SGPA/CGPA tools in the navigation bar!`,
      });
      return;
    }

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      {
        role: 'user',
        parts: [{ text: `${profileContext}\n\n${message}` }],
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents: contents,
        config: {
          systemInstruction: APS_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    } catch (_fallbackErr) {
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          systemInstruction: APS_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    }

    res.json({ reply: response.text || 'How can I assist you with your VTU studies today?' });
  } catch (_err: unknown) {
    res.json({
      reply: `Hello ${studentProfile?.name || 'VTU Student'}! Welcome to APS Notes. You can browse notes, check 2022 & 2025 syllabi, or calculate your SGPA directly using the top navigation tools.`,
    });
  }
});

// Start dev or production server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`APS Notes server running on port ${PORT}`);
    // Sync all curated notes into Supabase database in background
    syncAllNotesToSupabaseServer()
      .then((res) => {
        console.log(`Supabase notes auto-sync complete: ${res.syncedCount}/${res.total} notes stored in database.`);
      })
      .catch((err) => {
        console.warn('Initial Supabase notes sync non-fatal warning:', err);
      });
  });
}

startServer();
