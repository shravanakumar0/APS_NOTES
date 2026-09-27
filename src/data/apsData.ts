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

// REAL VTU NOTES CURATED AND PREPARED FOR SUPABASE DATABASE PERSISTENCE
export const REAL_NOTES: SubjectNote[] = [
  {
    id: 'note-1bcs304-os',
    title: 'Operating Systems',
    code: '1BCS304',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2025',
    semester: 3,
    category: 'VTU Exam Handwritten & Faculty Notes',
    author: 'Prof. R. K. Hegde (Department of CSE)',
    updatedDate: '26-09-2026',
    readTime: '15 min read',
    views: 1420,
    downloads: 980,
    rating: 4.9,
    description: 'Comprehensive 5-module verified study notes for VTU 2025/2022 Scheme. Includes CPU scheduling numericals, Peterson algorithm proof, Banker algorithm steps, and Paging schemes.',
    tags: ['1BCS304', 'BCS303', 'Operating Systems', '2025 Scheme', 'Sem 3', 'VTU Notes'],
    isCommunityUploaded: false,
    college: 'APS College of Engineering, Bangalore',
    modules: [
      {
        moduleNumber: 1,
        title: 'Introduction to Operating Systems & System Calls',
        topics: ['OS Objectives & Functions', 'Dual-Mode Operation', 'System Calls Architecture', 'OS Structures (Monolithic, Microkernel, Layered)', 'Virtual Machines'],
        summary: 'Detailed explanation of kernel vs user mode transitions, system call execution mechanism, and comparison between Monolithic and Microkernel architectures with diagrams.'
      },
      {
        moduleNumber: 2,
        title: 'Processes, Threads & CPU Scheduling',
        topics: ['Process Control Block (PCB)', 'Process State Transition', 'FCFS, SJF, SRTF, Round Robin Scheduling', 'Multithreading Models (1:1, M:1, M:N)', 'Context Switching Overhead'],
        summary: 'Step-by-step solved Gantt chart problems for SJF preemptive, Priority, and Round Robin scheduling with turnaround and waiting time calculations.'
      },
      {
        moduleNumber: 3,
        title: 'Process Synchronization & Deadlock Handling',
        topics: ['Critical Section Problem', 'Peterson Solution Proof', 'Counting & Binary Semaphores', 'Classical Problems (Dining Philosophers, Producer-Consumer)', 'Banker Algorithm for Deadlock Avoidance'],
        summary: 'Deadlock necessary conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait), Resource Allocation Graph (RAG), and Banker Algorithm numerical matrix steps.'
      },
      {
        moduleNumber: 4,
        title: 'Main Memory & Virtual Memory Management',
        topics: ['Logical vs Physical Address Space', 'Paging Hardware & TLB Translation', 'Inverted Page Tables', 'Demand Paging & Page Fault Handling', 'Page Replacement (FIFO, LRU, Optimal)'],
        summary: 'Formula-driven TLB effective access time calculations and page fault rate derivations under LRU and Optimal replacement sequences.'
      },
      {
        moduleNumber: 5,
        title: 'File System & Secondary Storage Structure',
        topics: ['File Allocation Methods (Contiguous, Linked, Indexed)', 'Free Space Management (Bit vector, Linked list)', 'Disk Scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK)', 'RAID Levels 0-5'],
        summary: 'Total head movement computations across cylinders for disk scheduling algorithms and comparison of inode directory structures in UNIX.'
      }
    ]
  },
  {
    id: 'note-1bcs302-java',
    title: 'Object-Oriented Programming with Java',
    code: '1BCS302',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2025',
    semester: 3,
    category: 'VTU Faculty Verified Notes',
    author: 'Dr. Meenakshi Sundaram (Dept of ISE)',
    updatedDate: '24-09-2026',
    readTime: '12 min read',
    views: 1890,
    downloads: 1250,
    rating: 4.85,
    description: 'Complete Java module-wise notes with JVM architecture diagrams, dynamic method dispatch, custom exception handling, multi-threading lifecycle, and Java Collection Framework.',
    tags: ['1BCS302', 'BCS306A', 'Java', 'OOP', 'Sem 3', '2025 Scheme'],
    isCommunityUploaded: false,
    college: 'BMS College of Engineering, VTU',
    modules: [
      {
        moduleNumber: 1,
        title: 'Java Architecture & OOP Fundamentals',
        topics: ['JVM, JRE, and JDK Architecture', 'Bytecode & JIT Compiler', 'Primitive Data Types & Type Casting', 'Class, Constructors, this Keyword', 'Garbage Collection & finalize()'],
        summary: 'Comprehensive foundations of OOP: encapsulation, inheritance, polymorphism, and Java memory allocation stack vs heap.'
      },
      {
        moduleNumber: 2,
        title: 'Inheritance, Packages & Interface Design',
        topics: ['super Keyword Usage', 'Method Overriding vs Overloading', 'Dynamic Method Dispatch', 'Abstract Classes vs Interfaces', 'Package Creation & CLASSPATH Configuration'],
        summary: 'Inheritance hierarchy rules, diamond problem resolution in Java via interfaces, and access specifier visibility matrices (public, protected, default, private).'
      },
      {
        moduleNumber: 3,
        title: 'Exception Handling & String Processing',
        topics: ['try-catch-finally Flow Control', 'Multiple Catch & Exception Precedence', 'throw vs throws Keywords', 'Custom User-Defined Exceptions', 'String vs StringBuffer vs StringBuilder'],
        summary: 'Handling runtime and checked exceptions with best practices, immutable String class internals, and memory pool optimization.'
      },
      {
        moduleNumber: 4,
        title: 'Multithreading & Concurrency in Java',
        topics: ['Thread Lifecycle States', 'Extending Thread vs Implementing Runnable', 'Thread Priority & Daemon Threads', 'synchronized Methods & Blocks', 'Inter-Thread Communication (wait, notify, notifyAll)'],
        summary: 'Deadlock avoidance in multi-threading, producer-consumer problem implementation in Java, and thread synchronization mechanics.'
      },
      {
        moduleNumber: 5,
        title: 'Java Generics & Collection Framework',
        topics: ['Generics Syntax & Wildcards (? extends T)', 'List Interface (ArrayList, LinkedList)', 'Set Interface (HashSet, TreeSet)', 'Map Interface (HashMap, TreeMap)', 'Iterator & Enhanced For Loop'],
        summary: 'Performance comparison (Big-O) across Java collections and practical implementations of Comparator and Comparable interfaces.'
      }
    ]
  },
  {
    id: 'note-1bcs301-maths',
    title: 'Mathematics for Computer Science-III',
    code: '1BCS301',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2025',
    semester: 3,
    category: 'VTU Exam Notes & Formula Sheet',
    author: 'Prof. S. Narayana (Department of Mathematics)',
    updatedDate: '22-09-2026',
    readTime: '18 min read',
    views: 2150,
    downloads: 1670,
    rating: 4.95,
    description: 'Master formula sheets, theorem proofs, and solved university question papers for Fourier series, Laplace transforms, Numerical methods, and Joint Probability distributions.',
    tags: ['1BCS301', 'BCS301', 'Engineering Mathematics', 'Probability', 'Linear Algebra', 'Sem 3'],
    isCommunityUploaded: false,
    college: 'RV College of Engineering, Bangalore',
    modules: [
      {
        moduleNumber: 1,
        title: 'Fourier Series & Harmonic Analysis',
        topics: ['Periodic Functions & Euler Formulae', 'Even and Odd Functions', 'Half Range Fourier Sine & Cosine Series', 'Practical Harmonic Analysis'],
        summary: 'Step-by-step evaluation of Fourier coefficients an and bn for discontinuous intervals and practical tabular harmonic expansions.'
      },
      {
        moduleNumber: 2,
        title: 'Fourier Transforms & Z-Transforms',
        topics: ['Infinite Fourier Transforms', 'Fourier Sine and Cosine Transforms', 'Inverse Transforms & Parseval Identity', 'Z-Transforms of Standard Functions', 'Inverse Z-Transform & Difference Equations'],
        summary: 'Properties of linearity, change of scale, shifting, and convolution theorems with solutions for difference equations.'
      },
      {
        moduleNumber: 3,
        title: 'Numerical Methods for ODEs',
        topics: ['Taylor Series Method', 'Modified Euler Method', 'Runge-Kutta 4th Order Method (RK4)', 'Milne Predictor-Corrector Method'],
        summary: 'Clear tabular computation sheets for first-order ODEs with error estimations and VTU examination templates.'
      },
      {
        moduleNumber: 4,
        title: 'Curve Fitting & Statistical Methods',
        topics: ['Method of Least Squares (Straight line, Parabola, Exponential)', 'Correlation Coefficient (Karl Pearson)', 'Rank Correlation (Spearman)', 'Regression Lines y on x and x on y'],
        summary: 'Complete solved formulas for normal equations and covariance computations.'
      },
      {
        moduleNumber: 5,
        title: 'Probability Distributions & Joint Probability',
        topics: ['Random Variables (Discrete & Continuous)', 'Binomial, Poisson, and Normal Distributions', 'Joint Probability Distributions & Marginal Distributions', 'Covariance and Correlation of Random Variables'],
        summary: 'Evaluation of mean, variance, standard normal distribution (Z-table usage), and testing for independence of random variables.'
      }
    ]
  },
  {
    id: 'note-1bcs303-ddco',
    title: 'Digital Design and Computer Organization',
    code: '1BCS303',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2025',
    semester: 3,
    category: 'VTU Faculty Verified Notes',
    author: 'Prof. Anitha Rao (Dept of CSE)',
    updatedDate: '20-09-2026',
    readTime: '14 min read',
    views: 1320,
    downloads: 870,
    rating: 4.8,
    description: 'Hardware diagrams and full derivation notes for Karnaugh Maps, Multiplexers, Counters, ALU design, Bus structures, Cache memory mapping, and RISC vs CISC.',
    tags: ['1BCS303', 'BCS302', 'DDCO', 'Digital Logic', 'Computer Architecture', 'Sem 3'],
    isCommunityUploaded: false,
    college: 'APS College of Engineering',
    modules: [
      {
        moduleNumber: 1,
        title: 'Combinational Logic Design & Simplification',
        topics: ['Karnaugh Maps (3, 4, 5 variables) with Don’t Care Conditions', 'Quine-McCluskey (Tabular) Minimization', 'Adders/Subtractors (Ripple Carry & Lookahead)', 'Encoders, Decoders, and Multiplexers'],
        summary: 'Prime implicant charts and multiplexer tree expansions with practical circuit diagrams.'
      },
      {
        moduleNumber: 2,
        title: 'Sequential Logic Circuits',
        topics: ['Latches vs Flip-Flops (SR, JK, D, T)', 'Master-Slave JK Flip-Flop', 'Excitation Tables & Characteristic Equations', 'Synchronous & Asynchronous Binary Counters', 'Shift Registers (SISO, SIPO, PISO, PIPO)'],
        summary: 'State diagram, state reduction, and transition table derivation for Mod-N synchronous counters.'
      },
      {
        moduleNumber: 3,
        title: 'Basic Structure of Computers & Machine Instructions',
        topics: ['Functional Units & Bus Structures', 'Memory Locations and Addresses', 'Memory Operations & Addressing Modes', 'Instruction Sequencing & Subroutine Calls', 'Encoding of Machine Instructions'],
        summary: 'Evaluation of memory-bus arbitration, accumulator architectures, and direct/indirect/indexed addressing modes.'
      },
      {
        moduleNumber: 4,
        title: 'Input / Output Organization',
        topics: ['Accessing I/O Devices (Memory-Mapped vs I/O Mapped)', 'Interrupts & Interrupt Hardware', 'Vectored Interrupts & Priority Schemes', 'Direct Memory Access (DMA) Controllers', 'Bus Standards (PCI, SCSI, USB)'],
        summary: 'Handshake signals for asynchronous bus transfers and cycle stealing vs burst mode in DMA.'
      },
      {
        moduleNumber: 5,
        title: 'Memory System & Cache Organization',
        topics: ['Memory Hierarchy (Speed, Size, Cost)', 'SRAM vs DRAM Cells', 'Cache Memory Mapping (Direct, Associative, Set-Associative)', 'Cache Replacement & Write Policies', 'Virtual Memory & Secondary Storage'],
        summary: 'Hit ratio, miss penalty, and address breakdown into Tag, Index, and Offset fields for cache configurations.'
      }
    ]
  },
  {
    id: 'note-1bcsl307a-git',
    title: 'Project Management with Git & GitHub',
    code: '1BCSL307A',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2025',
    semester: 3,
    category: 'VTU Practical Lab & Viva Guide',
    author: 'Prof. Sandeep V. (Senior DevOps & Cloud Faculty)',
    updatedDate: '25-09-2026',
    readTime: '10 min read',
    views: 1780,
    downloads: 1410,
    rating: 4.9,
    description: 'Complete hands-on practical lab manual with exact bash commands, merge conflict resolution steps, GitHub PR workflows, and 50+ viva questions with answers.',
    tags: ['1BCSL307A', 'BCS358C', 'Git', 'GitHub', 'DevOps', 'Lab Manual', 'Sem 3'],
    isCommunityUploaded: false,
    college: 'APS College of Engineering',
    modules: [
      {
        moduleNumber: 1,
        title: 'Git Architecture & Local Repository Setup',
        topics: ['Version Control Systems (Centralized vs Distributed)', 'Git Three-Tree Architecture (Working Dir, Staging Area, Repository)', 'git init, git config, git status, git log', 'git diff & git commit conventions'],
        summary: 'Explains SHA-1 hashing, blob objects, commit tree nodes, and file state transitions in Git.'
      },
      {
        moduleNumber: 2,
        title: 'Branching, Merging & Conflict Resolution',
        topics: ['Creating and Switching Branches (git branch, git checkout, git switch)', 'Fast-Forward vs Three-Way Merging', 'Simulating and Resolving Merge Conflicts', 'git stash and git stash pop workflows'],
        summary: 'Real-world merge conflict walk-through with HEAD markers and visual resolution steps.'
      },
      {
        moduleNumber: 3,
        title: 'Remote Collaboration with GitHub',
        topics: ['SSH Key Generation and Configuration', 'Connecting Remote Repositories (git remote add)', 'git push, git pull, and git fetch differences', 'Forking, Pull Requests (PRs), and Code Review Guidelines'],
        summary: 'Upstream remote management and best practices for collaborative open-source team workflows.'
      },
      {
        moduleNumber: 4,
        title: 'Advanced Git Tools & History Rewriting',
        topics: ['git rebase vs git merge (Pros and Cons)', 'Interactive Rebase (squash, fixup, reword)', 'git cherry-pick for selective commits', 'git bisect for automated bug localization', 'git reflog for lost commit recovery'],
        summary: 'Techniques for maintaining clean, linear commit logs and recovering detached HEAD references.'
      },
      {
        moduleNumber: 5,
        title: 'GitHub Actions & Project Management Boards',
        topics: ['GitHub Issues & Milestones', 'GitHub Projects (Kanban Boards)', 'CI/CD Pipeline Basics with GitHub Actions', 'Release Tagging & Semantic Versioning'],
        summary: 'Writing YAML workflow configuration files for automated unit testing on branch pushes.'
      }
    ]
  },
  {
    id: 'note-bcs304-dsa',
    title: 'Data Structures and Applications',
    code: 'BCS304',
    branch: 'CSE-ISE',
    branches: ['CSE-ISE', 'AIML-DS'],
    scheme: '2022',
    semester: 3,
    category: 'VTU Exam Handwritten Notes',
    author: 'Prof. K. Venkatesh (Dept of CSE)',
    updatedDate: '19-09-2026',
    readTime: '16 min read',
    views: 2900,
    downloads: 2100,
    rating: 4.92,
    description: 'In-depth notes on Linear and Non-Linear Data Structures. Includes Infix to Postfix algorithms, Circular Queues, Linked Lists, Binary Search Trees, AVL Trees, Graphs, and Hashing.',
    tags: ['BCS304', 'Data Structures', 'C Programming', 'Sem 3', '2022 Scheme'],
    isCommunityUploaded: false,
    college: 'BMS College of Engineering',
    modules: [
      {
        moduleNumber: 1,
        title: 'Introduction, Arrays & Stacks',
        topics: ['Pointers & Dynamic Memory Allocation (malloc, calloc, realloc, free)', 'Representation of Linear Arrays', 'Stack ADT & Operations (Push, Pop, Display)', 'Infix to Postfix Conversion & Postfix Evaluation Algorithm'],
        summary: 'Operator precedence tables, stack tracing diagrams, and recursion simulation with run-time stack.'
      },
      {
        moduleNumber: 2,
        title: 'Queues & Circular Queues',
        topics: ['Queue ADT (Linear Queue Deficiencies)', 'Circular Queue Enqueue/Dequeue with Modulo Arithmetic', 'Priority Queues & Double-Ended Queues (Deque)', 'Queue Applications in CPU Scheduling'],
        summary: 'Boundary conditions for Queue Full and Queue Empty conditions in circular arrays.'
      },
      {
        moduleNumber: 3,
        title: 'Linked Lists & Dynamic Structures',
        topics: ['Singly Linked List (Insert, Delete at front/end/pos)', 'Header Nodes & Circular Singly Linked Lists', 'Doubly Linked Lists & Operations', 'Polynomial Addition Using Linked Lists'],
        summary: 'Pointer manipulation rules, memory allocation overheads, and comparison between arrays and linked lists.'
      },
      {
        moduleNumber: 4,
        title: 'Trees & Binary Search Trees',
        topics: ['Tree Terminology (Depth, Height, Degree)', 'Binary Tree Traversals (Inorder, Preorder, Postorder - Recursive & Iterative)', 'Binary Search Tree (BST) Operations', 'Threaded Binary Trees & AVL Tree Rotations (LL, RR, LR, RL)'],
        summary: 'Balancing factor computations for AVL trees and deletion cases in Binary Search Trees.'
      },
      {
        moduleNumber: 5,
        title: 'Graphs, Sorting & Hashing Techniques',
        topics: ['Graph Representation (Adjacency Matrix & List)', 'Breadth First Search (BFS) & Depth First Search (DFS)', 'Hashing Functions (Division, Mid-square, Folding)', 'Collision Resolution (Linear Probing, Quadratic, Chaining)'],
        summary: 'Cycle detection algorithms, connected component finding, and open addressing vs closed addressing analysis.'
      }
    ]
  }
];

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
