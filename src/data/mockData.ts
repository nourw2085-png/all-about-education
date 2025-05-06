
import { Assignment, Question, Quiz, AttendanceRecord, Message, Student, Assistant, Material } from '@/types';

export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Math Problem Set',
    description: 'Complete problems 1-20 on page 45 of the textbook.',
    dueDate: '2025-05-15',
    status: 'pending',
  },
  {
    id: '2',
    title: 'History Essay',
    description: 'Write a 3-page essay on the Industrial Revolution.',
    dueDate: '2025-05-12',
    status: 'submitted',
    submissionUrl: '/assignments/history-essay.pdf',
  },
  {
    id: '3',
    title: 'Science Lab Report',
    description: 'Complete the lab report for the chemistry experiment.',
    dueDate: '2025-05-08',
    status: 'graded',
    grade: 85,
    feedback: 'Good analysis, but needs more detail in the methodology section.',
  },
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'Student User',
    title: 'Help with calculus problem',
    content: 'I need help solving the integral of x²sin(x)',
    status: 'pending',
    createdAt: '2025-05-06T14:22:00Z',
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'Student User',
    title: 'Physics question about momentum',
    content: 'How do I calculate the momentum of a 2kg object moving at 5m/s?',
    status: 'in-progress',
    createdAt: '2025-05-05T10:15:00Z',
    assistantId: '2',
    assistantName: 'Assistant User',
  },
  {
    id: '3',
    studentId: '1',
    studentName: 'Student User',
    title: 'Grammar check for essay',
    content: 'Could you check my grammar in this paragraph?',
    status: 'answered',
    createdAt: '2025-05-03T16:45:00Z',
    assistantId: '2',
    assistantName: 'Assistant User',
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'Math Quiz: Algebra',
    dueDate: '2025-05-10',
    status: 'pending',
    totalQuestions: 15,
  },
  {
    id: '2',
    title: 'English Vocabulary Quiz',
    dueDate: '2025-05-09',
    status: 'completed',
    totalQuestions: 20,
  },
  {
    id: '3',
    title: 'Science Quiz: Physics',
    dueDate: '2025-05-05',
    status: 'graded',
    grade: 90,
    totalQuestions: 10,
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    date: '2025-05-06',
    status: 'present',
  },
  {
    date: '2025-05-05',
    status: 'present',
  },
  {
    date: '2025-05-04',
    status: 'absent',
    notes: 'Sick leave',
  },
  {
    date: '2025-05-03',
    status: 'present',
  },
  {
    date: '2025-05-02',
    status: 'present',
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    senderName: 'Assistant User',
    senderRole: 'assistant',
    content: 'Hello, how can I help you with your question?',
    contentType: 'text',
    timestamp: '2025-05-06T14:30:00Z',
    read: true,
    questionId: '2',
  },
  {
    id: '2',
    senderId: '1',
    senderName: 'Student User',
    senderRole: 'student',
    content: 'I\'m having trouble understanding how to calculate momentum.',
    contentType: 'text',
    timestamp: '2025-05-06T14:32:00Z',
    read: true,
    questionId: '2',
  },
  {
    id: '3',
    senderId: '2',
    senderName: 'Assistant User',
    senderRole: 'assistant',
    content: 'Momentum is calculated using the formula p = m × v, where m is mass and v is velocity.',
    contentType: 'text',
    timestamp: '2025-05-06T14:35:00Z',
    read: true,
    questionId: '2',
  },
];

export const mockStudent: Student = {
  id: '1',
  name: 'Student User',
  email: 'student@example.com',
  grade: '10th Grade',
  attendance: mockAttendanceRecords,
  assignments: mockAssignments,
  quizzes: mockQuizzes,
  parentId: '4',
};

export const mockAssistant: Assistant = {
  id: '2',
  name: 'Assistant User',
  email: 'assistant@example.com',
  points: 150,
  questionsAnswered: 25,
  assignmentsCorrected: 15,
  quizzesCorrected: 10,
};

export const mockMaterials: Material[] = [
  {
    id: '1',
    title: 'Math Textbook PDF',
    type: 'document',
    url: '/materials/math-textbook.pdf',
    uploadedBy: 'Teacher User',
    uploadDate: '2025-04-15',
  },
  {
    id: '2',
    title: 'Physics Lecture Recording',
    type: 'recording',
    url: '/materials/physics-lecture.mp4',
    uploadedBy: 'Teacher User',
    uploadDate: '2025-05-01',
  },
  {
    id: '3',
    title: 'Chemistry Lab Demonstration',
    type: 'video',
    url: '/materials/chemistry-lab.mp4',
    uploadedBy: 'Teacher User',
    uploadDate: '2025-05-04',
  },
];
