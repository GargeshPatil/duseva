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
    testId?: string; // Optional (deprecated for new questions, kept for backward compat)
    stream?: 'Science' | 'Commerce' | 'Humanities' | 'General';
    tags?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    subject?: string;
    streams?: string[];
    marks?: number;
    negativeMarks?: number;
}

export interface Test {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    totalMarks: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: 'Subject' | 'General' | 'Full Mock';
    streams: string[]; // Updated: Array to support multiple streams (Science, Commerce, Humanities, General, English)
    price: 'free' | 'paid';
    priceAmount?: number;
    questions?: Question[]; // Legacy: embedded questions
    questionIds?: string[]; // New: references to QuestionBank
    attempts: number;
    createdDate: string;
    status: 'draft' | 'published';
    sections?: any[]; // Keep existing structure if any
    // Backwards compatibility for UI during migration (optional, but helpful if we don't fix all UI immediately, though we should)
    // stream?: string; 
}

export interface Bundle {
    id: string;
    name: string;
    description: string;
    includedTests: string[]; // Array of Test IDs
    price: number;
    originalPrice?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    coverImage?: string;
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
