export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'developer';
    joinedAt: string;
    testsTaken: number;
    avgScore: number;
    isActive: boolean;
    paymentStatus: 'free' | 'paid';
    stream?: 'Science' | 'Commerce' | 'Humanities';
    targetUniversity?: string;
    onboardingCompleted?: boolean;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOption: number; // Index 0-3
    explanation?: string;
    testId: string;
}

export interface Test {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    totalMarks: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: 'Subject' | 'General' | 'Full Mock';
    price: 'free' | 'paid';
    priceAmount?: number;
    questions: Question[]; // For simplicity in mock
    attempts: number;
    createdDate: string;
    status: 'draft' | 'published';
}

export interface CMSContent {
    id: string;
    section: string; // e.g., 'hero', 'pricing', 'features'
    key: string;     // e.g., 'headline', 'subheadline'
    value: string;   // The text content
    image?: string;
    editableBy?: 'admin' | 'developer';
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number; // New metric
    activeTests: number;
    revenue: number;
    recentRegistrations: User[];
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    date: string;
    testId?: string; // Optional: which test was bought
    testTitle?: string;
}

export interface MediaAsset {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document';
    size: string;
    uploadedAt: string;
}

export interface SiteSettings {
    siteName: string;
    supportEmail: string;
    currency: string;
    maintenanceMode: boolean;
}

export interface AuditLog {
    id: string;
    action: string;
    userId: string;
    userName: string;
    details: string;
    timestamp: string;
}

export interface QuestionStatus {
    questionId: string;
    status: 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked_for_review';
    visited: boolean;
}

export interface TestAttempt {
    id: string;
    userId: string;
    testId: string;
    startTime: string; // ISO string
    endTime?: string;
    answers: Record<string, number>; // questionId -> optionIndex
    timeRemaining: number; // in seconds
    status: 'in_progress' | 'completed' | 'abandoned';
    currentQuestionIndex: number;
    questionStatus: Record<string, QuestionStatus>; // questionId -> status
    tabSwitches?: number; // Track focus loss
    resultData?: Omit<TestResult, 'id'>; // Store full result details
}

export interface TestResult {
    id: string;
    attemptId: string;
    userId: string;
    testId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    accuracy: number;
    timeTaken: number; // seconds
    completedAt: string;
    improvement?: {
        scoreDiff: number;
        accuracyDiff: number;
        timeDiff: number; // seconds
    };
}
