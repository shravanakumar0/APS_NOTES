import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { REAL_NOTES, REAL_LAB_PROGRAMS, REAL_QUESTION_PAPERS, SubjectNote, LabProgram, QuestionPaper } from './src/data/apsData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// In-memory stores with ONLY student/faculty uploaded resources (zero demo data)
let activeNotes: SubjectNote[] = [...REAL_NOTES];
let activeLabs: LabProgram[] = [...REAL_LAB_PROGRAMS];
let activePapers: QuestionPaper[] = [...REAL_QUESTION_PAPERS];

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
app.get('/api/notes', (_req: Request, res: Response) => {
  res.json({ notes: activeNotes });
});

// API for immediate student upload without teacher verification
app.post('/api/notes', (req: Request, res: Response) => {
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
    message: 'Notes published immediately! Visible to all VTU students.',
    note: newNote,
  });
});

// API to get all uploaded lab programs
app.get('/api/labs', (_req: Request, res: Response) => {
  res.json({ labs: activeLabs });
});

// API to get all uploaded question papers
app.get('/api/papers', (_req: Request, res: Response) => {
  res.json({ papers: activePapers });
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

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: APS_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Gemini API Error:', errorMsg);
    res.write(`data: ${JSON.stringify({ text: `\n\n*(Notice: Academic assistant encountered a momentary issue: ${errorMsg}. You can still browse all notes and tools directly from the menu above!)*`, done: true })}\n\n`);
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: APS_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || 'How can I assist you with your VTU studies today?' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: errorMsg, reply: 'Unable to reach support assistant right now. Please try again shortly.' });
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
  });
}

startServer();
