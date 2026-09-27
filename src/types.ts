export interface StudentProfile {
  name: string;
  branch: string;
  scheme: '2022' | '2025' | '2021';
  semester: number;
  college: string;
  usn?: string;
}

export interface StudentUser {
  id?: string;
  username: string;
  password?: string;
  name: string;
  role: 'student' | 'admin';
  branch: string;
  scheme: '2022' | '2025' | '2021';
  semester: number;
  college: string;
  usn?: string;
  createdAt?: string;
}

export type ActiveTab = 'home' | 'notes' | 'labs' | 'sgpa' | 'cgpa' | 'syllabus' | 'papers' | 'support' | 'upload' | 'admin';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}
