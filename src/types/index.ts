
import { UserRole } from "@/contexts/AuthContext";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  submissionUrl?: string;
}

export interface Question {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  content: string;
  status: 'pending' | 'in-progress' | 'answered';
  createdAt: string;
  assistantId?: string;
  assistantName?: string;
}

export interface Quiz {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'graded';
  grade?: number;
  totalQuestions: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  contentType: 'text' | 'image' | 'voice' | 'video';
  timestamp: string;
  read: boolean;
  questionId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade?: string;
  attendance: AttendanceRecord[];
  assignments: Assignment[];
  quizzes: Quiz[];
  parentId?: string;
}

export interface Assistant {
  id: string;
  name: string;
  email: string;
  points: number;
  questionsAnswered: number;
  assignmentsCorrected: number;
  quizzesCorrected: number;
}

export interface Material {
  id: string;
  title: string;
  type: 'document' | 'video' | 'recording' | 'link';
  url: string;
  uploadedBy: string;
  uploadDate: string;
}
