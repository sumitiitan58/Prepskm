export type ExamTarget = 'JEE Main' | 'JEE Advanced' | 'NEET' | 'Class 11' | 'Class 12' | 'Class 10' | 'Class 9' | 'Dropper' | 'Others';

export type SubjectName = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';

export type QuestionType = 'single_choice' | 'multi_choice' | 'numerical';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  text: string;
  imageBase64?: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  targetExam: ExamTarget;
  classLevel: string;
  subject: SubjectName;
  chapter: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  text: string;
  imageBase64?: string;
  options: QuestionOption[];
  numericalAnswer?: number;
  numericalTolerance?: number; // e.g. 0.05
  explanationText: string;
  explanationImageBase64?: string;
  createdAt: string;
}

export type MaterialCategory = 'notes' | 'pyq' | 'formula_sheet' | 'video';

export interface StudyMaterial {
  id: string;
  title: string;
  category: MaterialCategory;
  subject: SubjectName;
  classLevel: string;
  pdfUrl?: string;
  pdfTitle?: string;
  videoUrl?: string;
  description: string;
  downloadsCount: number;
  createdAt: string;
}

export interface BacklogItem {
  id: string;
  subject: SubjectName;
  chapter: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'cleared';
  targetDate: string;
  notes?: string;
}

export interface StudentProfile {
  name: string;
  targetExam: ExamTarget;
  classLevel: string;
  streakCount: number;
  lastActiveDate: string;
  totalTestsTaken: number;
  averageScorePercent: number;
}

export interface MentorshipToken {
  tokenCode: string;
  studentName: string;
  phoneOrWhatsApp: string;
  targetExam: ExamTarget;
  minutesBooked: number;
  amountPaid: number;
  timeSlot: string;
  doubtTopic?: string;
  transactionId?: string;
  status: 'verified' | 'completed' | 'cancelled';
  issuedAt: string;
}

export interface MockTestAttempt {
  id: string;
  studentName: string;
  examTarget: ExamTarget;
  selectedSubjects: SubjectName[];
  selectedChapters: string[];
  totalQuestions: number;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
  timeTakenSeconds: number;
  submittedAt: string;
  answers: Record<
    string,
    {
      selectedOptions?: string[];
      selectedOptionIds?: string[];
      numericalInput?: string;
      isCorrect: boolean;
      status?: string;
      marks?: number;
    }
  >;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
