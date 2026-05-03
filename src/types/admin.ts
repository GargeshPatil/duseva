import { JSONContent } from '@tiptap/react';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'admin' | 'developer';
    joinedAt: string;
    testsTaken: number;
    avgScore: number;
    isActive: boolean;
    credits: number;
    totalCreditsPurchased: number;
    stream?: 'Science' | 'Commerce' | 'Humanities';
    targetUniversity?: string;
    onboardingCompleted?: boolean;
}

export interface Question {
    questionType?: 'mcq' | 'match';
    matchPairs?: { left: string; right: string; leftContent?: JSONContent; rightContent?: JSONContent }[];
    passageId?: string; // identity tracking for analysis grouping
    passageText?: string; // standalone context property
    id: string;
    text: string;
    imageUrl?: string;
    options: string[];
    correctOption: number; // Index 0-3
    explanation?: string;
    questionContent?: JSONContent;
    optionsContent?: JSONContent[];
    explanationContent?: JSONContent;
    passageContent?: JSONContent;
    contentVersion?: number;
    testId?: string;
    stream?: 'Science' | 'Commerce' | 'Humanities' | 'General';
    tags?: string[];
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    subject?: string;
    tier1Category?: string; // New: Tier 1 Category marker (formerly chapter)
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
    category: 'Subject' | 'General' | 'Full Mock'; // Legacy category
    tier2Category?: 'Mock' | 'PYQ' | string; // New: Tier 2 Filter
    tier3Category?: 'Chapterwise' | 'Full Mock' | string; // New: Tier 3 Filter
    subject?: string; // New: Tier 1 Filter
    stream?: string; // Primary stream: Science | Commerce | Humanities | Language | General Test
    isFree?: boolean;
    streams: string[]; // Updated: Array to support multiple streams (Science, Commerce, Humanities, General, English)
    questions?: Question[]; // Legacy: embedded questions
    questionIds?: string[]; // New: references to QuestionBank
    attempts: number;
    createdDate: string;
    status: 'draft' | 'published';
    shuffleQuestions?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sections?: any[]; // Keep existing structure if any
    isLegacyOrRandomlyAssigned?: boolean; // Metadata to indicate this needs review
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

export interface MediaAsset {
    id: string;
    url: string;
    name: string;
    size: string;
    uploadedAt: string;
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

export interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    isPopular: boolean;
    description?: string;
}

export interface DashboardHeroConfig {
    headline?: string;        // e.g. "Ready to crack CUET?"
    subtext?: string;         // e.g. "Your journey to top colleges starts here"
    ctaLabel?: string;        // e.g. "Start Test"
    trustBadges?: string[];   // e.g. ["10K+ students", "500+ PYQs"]
    overrideMessage?: string; // Prominent admin broadcast message
}

export interface SiteSettings {
    siteName: string;
    supportEmail: string;
    currency: string;
    maintenanceMode: boolean;
    creditPackages?: CreditPackage[];
    dashboardHero?: DashboardHeroConfig;
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
    timeSpent?: Record<string, number>; // questionId -> seconds spent
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

// ─── Mentorship System ────────────────────────────────────────────────────────

export interface MentorSlotConfig {
    /** How students contact/book — configured later (e.g. Calendly URL, WhatsApp, email) */
    bookingType?: 'calendly' | 'whatsapp' | 'email' | 'custom';
    bookingUrl?: string;   // Calendly link / WhatsApp number / mailto
    bookingNote?: string;  // Display text, e.g. "Book within 24h of purchase"
}

export interface Mentor {
    id: string;
    name: string;
    bio: string;              // Short tagline
    college: string;
    course: string;
    tags: string[];
    headline: string;         // Quote-style display text
    description?: any;        // TipTap JSONContent for rich description
    media?: string[];         // Extra image/video URLs
    photoUrl?: string;
    price: number;            // Credits required
    isActive: boolean;
    slotConfig?: MentorSlotConfig; // Future booking config — null-safe
    createdAt: string;        // ISO string
}

export interface MentorPurchase {
    id: string;
    userId: string;
    mentorId: string;
    mentorName: string;
    creditsUsed: number;
    timestamp: string;        // ISO string
    status: 'pending' | 'confirmed'; // Confirmed after admin/mentor acknowledges
}

