export interface SubjectNote {
  id: string;
  title: string;
  code: string;
  branch: string;
  branches: string[];
  scheme: '2022' | '2025' | '2021';
  semester: number;
  category: string;
  author: string;
  updatedDate: string;
  readTime: string;
  views: number;
  downloads: number;
  rating: number;
  description: string;
  modules: {
    moduleNumber: number;
    title: string;
    topics: string[];
    summary: string;
  }[];
  downloadUrl?: string;
  tags: string[];
  isCommunityUploaded?: boolean;
  uploadedBy?: string;
  college?: string;
  pdfDataUrl?: string;
  pdfFileName?: string;
  fileSize?: string;
}

export interface LabProgram {
  id: string;
  code: string;
  title: string;
  branch: string;
  scheme: '2022' | '2025';
  semester: number;
  language: string;
  aim: string;
  algorithm: string[];
  sourceCode: string;
  sampleInput: string;
  sampleOutput: string;
  vivaQuestions: { q: string; a: string }[];
  pdfDataUrl?: string;
  pdfFileName?: string;
  fileSize?: string;
}

export interface QuestionPaper {
  id: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  scheme: '2022' | '2025' | '2021';
  semester: number;
  examMonthYear: string;
  type: 'Regular SEE' | 'Make-up / Supplementary' | 'Model Question Paper';
  totalMarks: number;
  duration: string;
  modules: {
    moduleNumber: number;
    questions: { qNum: string; text: string; marks: number }[];
  }[];
  pdfDataUrl?: string;
  pdfFileName?: string;
  fileSize?: string;
}

export interface SyllabusItem {
  code: string;
  title: string;
  credits: number;
  cieMarks: number;
  seeMarks: number;
  examHours: number;
  branch: string;
  scheme: '2022' | '2025';
  semester: number;
  courseObjectives: string[];
  modules: {
    number: number;
    title: string;
    hours: number;
    topics: string;
  }[];
  textbooks: string[];
  referenceBooks: string[];
}

// ALL DEMO RESOURCES REMOVED - ONLY STUDENT & FACULTY UPLOADED PDF RESOURCES WILL APPEAR
export const REAL_NOTES: SubjectNote[] = [];

// ALL DEMO LABS REMOVED - ONLY UPLOADED LAB MANUALS WILL APPEAR
export const REAL_LAB_PROGRAMS: LabProgram[] = [];

// ALL DEMO QUESTION PAPERS REMOVED - ONLY UPLOADED PAPERS WILL APPEAR
export const REAL_QUESTION_PAPERS: QuestionPaper[] = [];

// PRESET BRANCH SUBJECTS FOR SGPA / CGPA CALCULATOR (2022 & 2025 SCHEME)
export interface CalculatorSubject {
  code: string;
  name: string;
  credits: number;
}

export const BRANCH_SEMESTER_SUBJECTS: Record<string, Record<number, CalculatorSubject[]>> = {
  'CSE-ISE-2025': {
    3: [
      { code: '1BCS301', name: 'Mathematics for Computer Science-III', credits: 4 },
      { code: '1BCS302', name: 'Object Oriented Programming with Java', credits: 4 },
      { code: '1BCS303', name: 'Digital Design and Computer Organization', credits: 4 },
      { code: '1BCS304', name: 'Operating Systems', credits: 4 },
      { code: '1BCSL306', name: 'Data Structures Laboratory', credits: 1.5 },
      { code: '1BCSL307A', name: 'Project Management with Git', credits: 1.5 },
      { code: '1BCSK308', name: 'Constitution of India & Professional Ethics', credits: 1 }
    ],
    4: [
      { code: '1BCS401', name: 'Analysis and Design of Algorithms', credits: 4 },
      { code: '1BCS402', name: 'Database Management Systems', credits: 4 },
      { code: '1BCS403', name: 'Discrete Mathematical Structures', credits: 3 },
      { code: '1BCS404', name: 'Microcontrollers & Embedded Systems', credits: 3 },
      { code: '1BCSL406', name: 'Algorithms Laboratory', credits: 1.5 },
      { code: '1BCSL407', name: 'DBMS Laboratory', credits: 1.5 },
      { code: '1BCSU408', name: 'Universal Human Values', credits: 1 }
    ]
  },
  'CSE-ISE-2022': {
    3: [
      { code: 'BCS301', name: 'Mathematics for Computer Science', credits: 4 },
      { code: 'BCS302', name: 'Digital Design & Computer Organization', credits: 4 },
      { code: 'BCS303', name: 'Operating Systems', credits: 4 },
      { code: 'BCS304', name: 'Data Structures and Applications', credits: 3 },
      { code: 'BCSL305', name: 'Data Structures Laboratory', credits: 1.5 },
      { code: 'BCS306A', name: 'Object Oriented Programming with Java', credits: 3 },
      { code: 'BSCK307', name: 'Social Connect and Responsibility', credits: 1 }
    ],
    4: [
      { code: 'BCS401', name: 'Analysis and Design of Algorithms', credits: 4 },
      { code: 'BCS402', name: 'Microcontrollers and Embedded Systems', credits: 4 },
      { code: 'BCS403', name: 'Database Management Systems', credits: 4 },
      { code: 'BCSL404', name: 'ADA Laboratory', credits: 1.5 },
      { code: 'BCS405B', name: 'Discrete Mathematical Structures', credits: 3 },
      { code: 'BCSL456D', name: 'Technical Writing using LaTeX', credits: 1.5 },
      { code: 'BUHK408', name: 'Universal Human Values', credits: 1 }
    ],
    5: [
      { code: 'BCS501', name: 'Software Engineering & Project Management', credits: 3 },
      { code: 'BCS502', name: 'Computer Networks', credits: 4 },
      { code: 'BCS503', name: 'Theory of Computation', credits: 3 },
      { code: 'BCSL504', name: 'Web Technology Lab', credits: 1.5 },
      { code: 'BCS515A', name: 'Professional Elective-I (Cloud Computing)', credits: 3 },
      { code: 'BCS586', name: 'Mini Project', credits: 2 }
    ]
  },
  'AIML-DS-2022': {
    3: [
      { code: 'BAI301', name: 'Mathematics for Machine Learning', credits: 4 },
      { code: 'BAI302', name: 'Digital Design and Computer Architecture', credits: 4 },
      { code: 'BAI303', name: 'Operating Systems for Data Science', credits: 4 },
      { code: 'BAI304', name: 'Data Structures and Applications', credits: 3 },
      { code: 'BAIL305', name: 'Data Structures & Python Lab', credits: 1.5 },
      { code: 'BAI306A', name: 'Object Oriented Programming with Python', credits: 3 },
      { code: 'BSCK307', name: 'Social Connect & Responsibility', credits: 1 }
    ]
  },
  'FIRST-YEAR-P-CYCLE': {
    1: [
      { code: 'BMATS101', name: 'Mathematics-I for Engineering', credits: 4 },
      { code: 'BPHYS102', name: 'Applied Physics', credits: 4 },
      { code: 'BPOPS103', name: 'Principles of Programming Using C', credits: 3 },
      { code: 'BESCK104', name: 'Basic Electrical Engineering', credits: 3 },
      { code: 'BPHYL106', name: 'Physics Laboratory', credits: 1.5 },
      { code: 'BPOPL107', name: 'Programming in C Laboratory', credits: 1.5 },
      { code: 'BENGK108', name: 'Communicative English', credits: 1 }
    ]
  },
  'FIRST-YEAR-C-CYCLE': {
    2: [
      { code: 'BMATS201', name: 'Mathematics-II for Engineering', credits: 4 },
      { code: 'BCHEM202', name: 'Applied Chemistry', credits: 4 },
      { code: 'BCEDK203', name: 'Computer Aided Engineering Drawing (CAED)', credits: 3 },
      { code: 'BETCK204', name: 'Basic Electronics Engineering', credits: 3 },
      { code: 'BCHEL206', name: 'Chemistry Laboratory', credits: 1.5 },
      { code: 'BICOK207', name: 'Indian Constitution & Cyber Law', credits: 1 },
      { code: 'BENGK208', name: 'Professional English', credits: 1 }
    ]
  }
};

// REAL VTU SYLLABUS LIST
export const REAL_SYLLABI: SyllabusItem[] = [
  {
    code: '1BCS304',
    title: 'Operating Systems',
    credits: 4,
    cieMarks: 50,
    seeMarks: 50,
    examHours: 3,
    branch: 'CSE-ISE',
    scheme: '2025',
    semester: 3,
    courseObjectives: [
      'Understand the architecture and underlying mechanisms of modern operating systems.',
      'Analyze process scheduling, concurrent programming, and synchronization algorithms.',
      'Explore deadlock mitigation techniques, memory virtualization, and paging architectures.',
      'Evaluate disk storage organization, file systems, and secondary storage management.'
    ],
    modules: [
      { number: 1, title: 'Operating-System Structures', hours: 8, topics: 'OS Services, System Calls, System Programs, OS Structure, Virtual Machines' },
      { number: 2, title: 'Processes, Threads & CPU Scheduling', hours: 10, topics: 'Process concept, Process scheduling, Operations on processes, Interprocess communication, Multithreading models, Scheduling criteria & algorithms' },
      { number: 3, title: 'Process Synchronization & Deadlocks', hours: 10, topics: 'Critical-section problem, Peterson solution, Hardware support, Semaphores, Classic synchronization problems, Deadlock characterization, Prevention, Avoidance (Banker algorithm), Detection and Recovery' },
      { number: 4, title: 'Memory Management Strategies', hours: 10, topics: 'Swapping, Contiguous memory allocation, Paging, Structure of the page table, Segmentation, Virtual memory, Demand paging, Page replacement algorithms' },
      { number: 5, title: 'Storage Management & File Systems', hours: 8, topics: 'File concept, Access methods, Directory structure, File system mounting, File sharing, Allocation methods, Free-space management, Disk structure & scheduling' }
    ],
    textbooks: [
      'Abraham Silberschatz, Peter Baer Galvin, Greg Gagne, "Operating System Concepts", 10th Edition, Wiley-India, 2018.'
    ],
    referenceBooks: [
      'William Stallings, "Operating Systems: Internals and Design Principles", 9th Edition, Pearson, 2018.',
      'Andrew S. Tanenbaum, Herbert Bos, "Modern Operating Systems", 4th Edition, Pearson, 2015.'
    ]
  },
  {
    code: '1BCS302',
    title: 'Object-Oriented Programming with Java',
    credits: 4,
    cieMarks: 50,
    seeMarks: 50,
    examHours: 3,
    branch: 'CSE-ISE',
    scheme: '2025',
    semester: 3,
    courseObjectives: [
      'Master object-oriented concepts and JVM execution semantics.',
      'Design modular applications utilizing inheritance, packages, and interfaces.',
      'Handle exceptions gracefully and utilize multi-threaded execution paradigms.',
      'Utilize Java Collection Framework and event handling mechanisms.'
    ],
    modules: [
      { number: 1, title: 'Java Basics & OOP Foundations', hours: 8, topics: 'History of Java, Java features, JVM architecture, Primitive data types, Variables, Arrays, Operators, Control statements, Classes, Objects, Methods, Constructors, Garbage Collection' },
      { number: 2, title: 'Inheritance, Packages and Interfaces', hours: 10, topics: 'Inheritance basics, Super keyword, Multilevel hierarchy, Method overriding, Dynamic method dispatch, Abstract classes, Packages, Access protection, Importing packages, Interfaces' },
      { number: 3, title: 'Exception Handling & String Handling', hours: 8, topics: 'Exception fundamentals, Exception types, Uncaught exceptions, try-catch, Multiple catch, Nested try, throw, throws, finally, Built-in and custom exceptions, String class methods' },
      { number: 4, title: 'Multithreaded Programming', hours: 10, topics: 'Java thread model, Thread priorities, Synchronization, Messaging, Thread class and Runnable interface, Creating multiple threads, isAlive() and join(), Inter-thread communication' },
      { number: 5, title: 'Generics and Collections', hours: 10, topics: 'Generics fundamentals, Bounded types, Wildcards, Collection interfaces (List, Set, Queue, Map), ArrayList, LinkedList, HashSet, HashMap, Iterator' }
    ],
    textbooks: [
      'Herbert Schildt, "Java: The Complete Reference", 12th Edition, McGraw-Hill, 2021.'
    ],
    referenceBooks: [
      'Cay S. Horstmann, "Core Java Volume I - Fundamentals", 11th Edition, Prentice Hall, 2018.'
    ]
  }
];

// REAL VTU CIRCULARS AND NOTIFICATIONS FEED
export const VTU_NOTIFICATIONS = [
  {
    id: 'circ-1',
    date: '24-09-2026',
    title: 'VTU Notification regarding commencement of Odd Semester (3rd, 5th, 7th Sem) CIE-1 examinations',
    category: 'Examination',
    url: 'https://vtu.ac.in/category/examination/'
  },
  {
    id: 'circ-2',
    date: '18-09-2026',
    title: 'Revised Academic Calendar for B.E./B.Tech 2022 & 2025 Scheme programs for AY 2026-27',
    category: 'Academic',
    url: 'https://vtu.ac.in/academic-calendar/'
  },
  {
    id: 'circ-3',
    date: '10-09-2026',
    title: 'Submission of Examination Application Forms and Photocopy/Revaluation details for June/July Examinations',
    category: 'Results & Reval',
    url: 'https://results.vtu.ac.in/'
  }
];
