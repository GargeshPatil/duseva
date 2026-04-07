
import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    query,
    orderBy,
    Timestamp,
    addDoc,
    deleteDoc,
    where,
    limit,
    documentId,
    getCountFromServer,
    QueryConstraint,
    arrayUnion,
    writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Test, Question, CMSContent, SiteSettings, AuditLog, DashboardStats, Transaction, TestAttempt, TestResult } from "@/types/admin";
import { UserData } from "@/context/AuthContext";

// Helper to remove undefined fields recursively
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cleanData(data: any): any {
    if (data === null || data === undefined) return null;
    if (typeof data !== 'object') return data;
    if (data instanceof Date) return data;
    if (data.toMillis && typeof data.toMillis === 'function') return data; // Timestamp

    if (Array.isArray(data)) {
        return data.map(item => cleanData(item)).filter(item => item !== undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = {};
    for (const key in data) {
        if (data[key] !== undefined) {
            cleaned[key] = cleanData(data[key]);
        }
    }
    return cleaned;
}

export const firestoreService = {
    // --- Test Engine ---
    async updateTestAttempt(attemptId: string, data: Partial<TestAttempt>): Promise<boolean> {
        try {
            const attemptRef = doc(db, "testAttempts", attemptId);
            await updateDoc(attemptRef, data);
            return true;
        } catch (error) {
            console.error("Error updating test attempt:", error);
            return false;
        }
    },

    async submitTestAttempt(
        attemptId: string,
        resultData: Omit<TestResult, 'id'>,
        finalAnswers?: Record<string, number>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalStatus?: Record<string, any>,
        finalTimeSpent?: Record<string, number>
    ): Promise<boolean> {
        try {
            const attemptRef = doc(db, "testAttempts", attemptId);

            // We update the attempt with the final score, status, AND the final answers/state
            // This ensures that even if the periodic sync missed the last few seconds, we have the latest data.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatePayload: any = {
                status: 'completed',
                endTime: new Date().toISOString(),
                score: resultData.score,
                timeTaken: resultData.timeTaken,
                resultData: resultData
            };

            if (finalAnswers) updatePayload.answers = finalAnswers;
            if (finalStatus) updatePayload.questionStatus = finalStatus;
            if (finalTimeSpent) updatePayload.timeSpent = finalTimeSpent;

            await updateDoc(attemptRef, updatePayload);

            return true;
        } catch (error) {
            console.error("Error submitting test:", error);
            return false;
        }
    },

    async getTestAttempt(attemptId: string): Promise<TestAttempt | null> {
        try {
            const docRef = doc(db, "testAttempts", attemptId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as TestAttempt;
            }
            return null;
        } catch (error) {
            console.error("Error fetching test attempt:", error);
            return null;
        }
    },

    async getLastTestAttempt(userId: string, testId: string): Promise<TestAttempt | null> {
        try {
            const attempts = await this.getUserAttempts(userId, 'completed');
            const testAttempts = attempts.filter(a => a.testId === testId);
            if (testAttempts.length > 0) {
                return testAttempts[0]; // Already sorted desc by getUserAttempts
            }
            return null;
        } catch (error) {
            console.error("Error fetching last test attempt:", error);
            return null;
        }
    },

    async getUserAttempts(userId: string, status?: 'completed' | 'in_progress'): Promise<TestAttempt[]> {
        try {
            const attemptsRef = collection(db, "testAttempts");
            // To avoid composite index requirements, query only by userId and sort/filter in memory
            const q = query(
                attemptsRef,
                where("userId", "==", userId)
            );

            const snapshot = await getDocs(q);
            let attempts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
            
            if (status) {
                attempts = attempts.filter(a => a.status === status);
            }
            
            // Sort by startTime descending
            attempts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            
            return attempts;
        } catch (error) {
            console.error("Error fetching user attempts:", error);
            return [];
        }
    },

    async getActiveAttempt(userId: string): Promise<TestAttempt | null> {
        try {
            const attemptsRef = collection(db, "testAttempts");
            const q = query(
                attemptsRef,
                where("userId", "==", userId),
                where("status", "==", "in_progress"),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() } as TestAttempt;
            }
            return null;
        } catch (error) {
            console.error("Error fetching active attempt:", error);
            return null;
        }
    },

    // --- Users ---
    async getUsers(): Promise<User[]> {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            const users: User[] = querySnapshot.docs.map((doc) => {
                const data = doc.data() as UserData;

                // Map Firestore UserData to Admin User type
                return {
                    id: data.uid,
                    name: data.name || "Unknown",
                    email: data.email,
                    role: (data.role as 'student' | 'admin' | 'developer') || 'student', // Cast primarily for UI
                    joinedAt: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    testsTaken: data.performanceSummary?.totalTestsAttempted || 0,
                    avgScore: data.performanceSummary?.overallAverageScore || 0,
                    isActive: true, // Logic could be added based on lastLoginAt
                    credits: data.credits || 0,
                    totalCreditsPurchased: data.totalCreditsPurchased || 0
                };
            });
            return users;
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    async updateUserRole(uid: string, newRole: 'student' | 'admin' | 'developer'): Promise<boolean> {
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, { role: newRole });
            return true;
        } catch (error) {
            console.error("Error updating user role:", error);
            return false;
        }
    },

    // --- Tests ---
    async getTests(publicOnly: boolean = false): Promise<Test[]> {
        try {
            const testsRef = collection(db, "tests");
            let q;

            if (publicOnly) {
                // Students MUST filter by isPublished == true to pass security rules
                q = query(testsRef, where("isPublished", "==", true), orderBy("createdAt", "desc"));
            } else {
                q = query(testsRef, orderBy("createdAt", "desc"));
            }

            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    duration: data.durationMinutes,
                    totalMarks: data.totalMarks,
                    difficulty: (data.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
                    category: (data.category || 'Subject') as 'Subject' | 'General' | 'Full Mock',
                    questions: [],
                    attempts: data.attemptsCount || 0,
                    createdDate: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    status: data.isPublished ? 'published' : 'draft',
                    streams: Array.isArray(data.streams) ? data.streams : (data.streams ? [data.streams] : (data.stream ? [data.stream] : [])),
                    questionIds: data.questionIds || [],
                    sections: data.sections || [],
                    isFree: data.isFree || false
                } as Test;
            });
        } catch (error) {
            console.warn("Notice: Error fetching tests (usually permission related):", error);
            return [];
        }
    },

    async getTest(testId: string): Promise<Test | null> {
        try {
            if (!testId || typeof testId !== "string") return null;
            
            const docRef = doc(db, "tests", testId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    title: data.title,
                    description: data.description,
                    duration: data.durationMinutes,
                    totalMarks: data.totalMarks,
                    difficulty: (data.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
                    category: (data.category || 'Subject') as 'Subject' | 'General' | 'Full Mock',
                    questions: [],
                    attempts: data.attemptsCount || 0,
                    createdDate: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    status: data.isPublished ? 'published' : 'draft',
                    streams: Array.isArray(data.streams) ? data.streams : (data.streams ? [data.streams] : (data.stream ? [data.stream] : [])),
                    questionIds: data.questionIds || [],
                    sections: data.sections || [],
                    isFree: data.isFree || false
                } as Test;
            }
            return null;
        } catch (error) {
            console.error("Error fetching test:", error);
            return null;
        }
    },

    async createTest(testData: Partial<Test>): Promise<string | null> {
        try {
            const testsRef = collection(db, "tests");

            // Map UI Test type to Firestore Schema
            const newTest = {
                title: testData.title,
                description: testData.description,
                durationMinutes: testData.duration,
                totalMarks: testData.totalMarks,
                difficulty: testData.difficulty,
                category: testData.category,
                streams: Array.isArray(testData.streams) ? testData.streams : (testData.streams ? [testData.streams] : ['General']), // Default to General
                isVisible: true,
                isPublished: testData.status === 'published',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                sections: [],
                attemptsCount: 0,
                questionIds: testData.questionIds || [],
                isFree: testData.isFree || false
            };

            const docRef = await addDoc(testsRef, cleanData(newTest));
            return docRef.id;
        } catch (error) {
            console.error("Error creating test:", error);
            return null;
        }
    },

    async updateTest(id: string, updates: Partial<Test>): Promise<boolean> {
        try {
            const testRef = doc(db, "tests", id);

            // Map updates back to Firestore fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const firestoreUpdates: any = {
                updatedAt: Timestamp.now()
            };

            if (updates.title) firestoreUpdates.title = updates.title;
            if (updates.description) firestoreUpdates.description = updates.description;
            if (updates.duration) firestoreUpdates.durationMinutes = updates.duration;
            if (updates.totalMarks) firestoreUpdates.totalMarks = updates.totalMarks;
            if (updates.difficulty) firestoreUpdates.difficulty = updates.difficulty;
            if (updates.status) firestoreUpdates.isPublished = updates.status === 'published';
            if (updates.streams) firestoreUpdates.streams = updates.streams;
            if (updates.questionIds) firestoreUpdates.questionIds = updates.questionIds;
            if (updates.isFree !== undefined) firestoreUpdates.isFree = updates.isFree;

            await updateDoc(testRef, cleanData(firestoreUpdates));
            return true;
        } catch (error) {
            console.error("Error updating test:", error);
            return false;
        }
    },

    async deleteTest(id: string): Promise<boolean> {
        try {
            await deleteDoc(doc(db, "tests", id));
            return true;
        } catch (error) {
            console.error("Error deleting test:", error);
            return false;
        }
    },


    // --- Questions ---
    async getQuestions(filters?: { testId?: string, stream?: string, subject?: string, search?: string, limit?: number, ids?: string[] }): Promise<Question[]> {
        try {
            const questionsRef = collection(db, "questions");

            // 1. Fetch by IDs (Chunking)
            if (filters?.ids && filters.ids.length > 0) {
                const chunks = [];
                for (let i = 0; i < filters.ids.length; i += 10) {
                    chunks.push(filters.ids.slice(i, i + 10));
                }

                const promises = chunks.map(chunk => {
                    const q = query(questionsRef, where(documentId(), "in", chunk));
                    return getDocs(q);
                });

                const snapshots = await Promise.all(promises);
                const allDocs = snapshots.flatMap(snap => snap.docs);

                // Sort to exactly match the input order of IDs
                const mappedDocs = allDocs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        text: data.text,
                        options: data.options || [],
                        correctOption: data.correctOption,
                        explanation: data.explanation,
                        testId: data.testId,
                        stream: data.stream,
                        subject: data.subject,
                        tags: data.tags || [],
                        difficulty: data.difficulty,
                        questionType: data.questionType,
                        matchPairs: data.matchPairs,
                        passageId: data.passageId,
                        passageText: data.passageText,
                        subQuestions: data.subQuestions || [],
                        imageUrl: data.imageUrl,
                        contentVersion: data.contentVersion,
                        questionContent: data.questionContent,
                        optionsContent: data.optionsContent,
                        explanationContent: data.explanationContent,
                        passageContent: data.passageContent,
                    } as Question;
                });

                const idOrder = new Map(filters.ids.map((id, index) => [id, index]));
                return mappedDocs.sort((a, b) => (idOrder.get(a.id) ?? Infinity) - (idOrder.get(b.id) ?? Infinity));
            }

            // 2. Standard Filtering
            const constraints: QueryConstraint[] = [];

            if (filters?.testId) {
                constraints.push(where("testId", "==", filters.testId));
            }
            if (filters?.stream) {
                constraints.push(where("stream", "==", filters.stream));
            }
            if (filters?.subject) {
                constraints.push(where("subject", "==", filters.subject));
            }

            // We omit orderBy("createdAt", "desc") from the Firebase query to avoid composite index requirements
            // when combined with where() clauses. We will sort in memory.
            if (constraints.length === 0) {
                constraints.push(orderBy("createdAt", "desc"));
                constraints.push(limit(filters?.limit || 100));
            }

            const q = query(questionsRef, ...constraints);
            const querySnapshot = await getDocs(q);

            let results = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    text: data.text,
                    options: data.options || [],
                    correctOption: data.correctOption,
                    explanation: data.explanation,
                    testId: data.testId,
                    stream: data.stream,
                    subject: data.subject,
                    tags: data.tags || [],
                    difficulty: data.difficulty,
                    questionType: data.questionType,
                    matchPairs: data.matchPairs,
                    passageId: data.passageId,
                    passageText: data.passageText,
                    subQuestions: data.subQuestions || [],
                    imageUrl: data.imageUrl,
                    contentVersion: data.contentVersion,
                    questionContent: data.questionContent,
                    optionsContent: data.optionsContent,
                    explanationContent: data.explanationContent,
                    passageContent: data.passageContent,
                    createdAt: data.createdAt // extract for sorting
                } as Question & { createdAt?: any };
            });

            // If we used where clauses, we must sort and slice in-memory
            if (constraints.length > 0 && !constraints.includes(orderBy("createdAt", "desc") as QueryConstraint)) {
                results.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis?.() || 0;
                    const timeB = b.createdAt?.toMillis?.() || 0;
                    return timeB - timeA; // desc
                });
                if (filters?.limit) {
                    results = results.slice(0, filters.limit);
                }
            }

            // Cleanup injected createdAt before returning
            return results.map(({ createdAt, ...q }) => q as Question);
        } catch (error) {
            console.warn("Notice: Error fetching questions (usually permission related):", error);
            return [];
        }
    },

    async createQuestion(questionData: Partial<Question>): Promise<string | null> {
        try {
            const questionsRef = collection(db, "questions");

            const newQuestion = {
                ...questionData,
                stream: questionData.stream || null,
                subject: questionData.subject || null,
                tags: questionData.tags || [],
                difficulty: questionData.difficulty || 'Medium',
                testId: questionData.testId || null, // Optional now
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(questionsRef, cleanData(newQuestion));
            return docRef.id;
        } catch (error) {
            console.error("Error creating question:", error);
            return null;
        }
    },

    async batchCreateQuestions(
        questions: Partial<Question>[],
        onProgress?: (progress: number) => void
    ): Promise<{ success: number; failed: number; errors: string[] }> {
        try {
            const batchLimit = 450; // Firestore limit is 500, keeping safety margin
            const totalQuestions = questions.length;
            const chunks = [];
            for (let i = 0; i < totalQuestions; i += batchLimit) {
                chunks.push(questions.slice(i, i + batchLimit));
            }

            let successCount = 0;
            const errors: string[] = [];
            let processedCount = 0;

            for (const chunk of chunks) {
                const batch = await import("firebase/firestore").then(mod => mod.writeBatch(db));
                const questionsRef = collection(db, "questions");

                chunk.forEach(q => {
                    // Passage type obsolete

                    const newRef = doc(questionsRef); // Generate ID automatically
                    const newQuestion = {
                        ...q,
                        stream: q.stream || null,
                        subject: q.subject || null,
                        tags: q.tags || [],
                        difficulty: q.difficulty || 'Medium',
                        testId: q.testId || null,
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now()
                    };
                    batch.set(newRef, cleanData(newQuestion));
                });

                try {
                    await batch.commit();
                    successCount += chunk.length;
                } catch (err) {
                    console.error("Batch commit failed:", err);
                    errors.push(`Batch failed: ${(err as Error).message}`);
                }

                processedCount += chunk.length;
                if (onProgress) {
                    onProgress(Math.min(100, Math.round((processedCount / totalQuestions) * 100)));
                }
            }

            return { success: successCount, failed: totalQuestions - successCount, errors };
        } catch (error) {
            console.error("Error in batch create:", error);
            return { success: 0, failed: questions.length, errors: [(error as Error).message] };
        }
    },

    async getQuestionSignatures(): Promise<{ id: string; text: string; subject?: string }[]> {
        try {
            const questionsRef = collection(db, "questions");
            // Select only necessary fields to reduce bandwidth if possible, 
            // but Firestore client SDK doesn't support 'select' fields efficiently in terms of read costs (reads whole doc anyway mostly).
            // However, downloading less data is faster.
            // We'll perform a query to get checks. 
            // Ideally we'd validte on server, but client-side:

            // Optimization: If questions count > 2000, this might be slow to download all.
            // But strict requirement is duplicate detection.
            // Let's assume reasonable size for now.
            const q = query(questionsRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            return snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    text: (data.text || "").trim().toLowerCase(),
                    subject: (data.subject || "").trim().toLowerCase()
                };
            });
        } catch (error) {
            console.error("Error fetching question signatures:", error);
            return [];
        }
    },

    async runMigration(): Promise<{ success: number; failed: number }> {
        try {
            const questionsRef = collection(db, "questions");
            const snapshot = await getDocs(query(questionsRef));
            const batchLimit = 450;
            let successCount = 0;
            const chunks = [];
            for (let i = 0; i < snapshot.docs.length; i += batchLimit) {
                chunks.push(snapshot.docs.slice(i, i + batchLimit));
            }

            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach(docSnap => {
                    const data = docSnap.data();
                    let needsUpdate = false;
                    const updates: any = {};

                    if (!data.questionType) {
                        updates.questionType = "mcq";
                        needsUpdate = true;
                    }
                    if (!data.options || data.options.length === 0) {
                        updates.options = ["", "", "", ""];
                        needsUpdate = true;
                    }
                    if (data.correctOption === undefined || data.correctOption === null) {
                        updates.correctOption = 0;
                        needsUpdate = true;
                    }

                    if (needsUpdate) {
                        updates.updatedAt = Timestamp.now();
                        batch.update(docSnap.ref, updates);
                        successCount++;
                    }
                });
                await batch.commit();
            }
            return { success: successCount, failed: 0 };
        } catch (error) {
            console.error("Migration failed:", error);
            return { success: 0, failed: 1 };
        }
    },

    async updateQuestion(id: string, updates: Partial<Question>): Promise<boolean> {
        try {
            const questionRef = doc(db, "questions", id);
            await updateDoc(questionRef, cleanData({
                ...updates,
                updatedAt: Timestamp.now()
            }));
            return true;
        } catch (error) {
            console.error("Error updating question:", error);
            return false;
        }
    },

    async deleteQuestion(id: string): Promise<boolean> {
        try {
            await deleteDoc(doc(db, "questions", id));
            return true;
        } catch (error) {
            console.error("Error deleting question:", error);
            return false;
        }
    },


    async batchDeleteQuestions(questionIds: string[]): Promise<boolean> {
        try {
            const batch = writeBatch(db);
            questionIds.forEach(id => {
                const ref = doc(db, "questions", id);
                batch.delete(ref);
            });
            await batch.commit();
            return true;
        } catch (error) {
            console.error("Error batch deleting questions:", error);
            return false;
        }
    },

    async addQuestionsToTest(testId: string, questionIds: string[]): Promise<boolean> {
        try {
            const testRef = doc(db, "tests", testId);
            await updateDoc(testRef, {
                questionIds: arrayUnion(...questionIds),
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error("Error adding questions to test:", error);
            return false;
        }
    },

    // --- Passages (Removed - Now using inline nested subQuestions) ---

    // --- CMS ---
    async getCMSContent(): Promise<CMSContent[]> {
        try {
            const contentRef = collection(db, "content");
            const querySnapshot = await getDocs(contentRef);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    section: data.section,
                    key: data.key,
                    value: data.value,
                    image: data.image,
                    editableBy: data.editableBy
                } as CMSContent;
            });
        } catch (error) {
            // Silencing this error to prevent Next.js dev overlay from popping up on the landing page for guests
            return [];
        }
    },

    async updateCMSContent(id: string, value: string): Promise<boolean> {
        try {
            const contentRef = doc(db, "content", id);
            await updateDoc(contentRef, {
                value,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error("Error updating CMS content:", error);
            return false;
        }
    },

    async createCMSContent(data: Omit<CMSContent, 'id'>): Promise<string | null> {
        try {
            const contentRef = collection(db, "content");
            const docRef = await addDoc(contentRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating CMS content:", error);
            return null;
        }
    },
    // --- Settings & Audit ---
    async getSettings(): Promise<SiteSettings> {
        try {
            // Try to find global settings, or specific document ID 'globalConfig' based on rules
            const settingsRef = doc(db, "platformSettings", "globalConfig");
            const docSnap = await getDoc(settingsRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    siteName: data.siteName || "CUET Mock Platform",
                    supportEmail: data.supportEmail || "support@example.com",
                    currency: data.currency || "INR",
                    maintenanceMode: data.maintenanceMode || false,
                    creditPackages: data.creditPackages || []
                } as SiteSettings;
            }

            return {
                siteName: "CUET Mock Platform",
                supportEmail: "support@example.com",
                currency: "INR",
                maintenanceMode: false,
                creditPackages: [
                    { id: "pkg-1", credits: 1, price: 99, isPopular: false },
                    { id: "pkg-3", credits: 3, price: 279, isPopular: false },
                    { id: "pkg-5", credits: 5, price: 449, isPopular: false },
                    { id: "pkg-10", credits: 10, price: 799, isPopular: true },
                    { id: "pkg-20", credits: 20, price: 1499, isPopular: false },
                    { id: "pkg-40", credits: 40, price: 2499, isPopular: false }
                ]
            };
        } catch (error) {
            console.error("Error fetching settings:", error);
            return {
                siteName: "CUET Mock Platform",
                supportEmail: "support@example.com",
                currency: "INR",
                maintenanceMode: false,
                creditPackages: [
                    { id: "pkg-1", credits: 1, price: 99, isPopular: false },
                    { id: "pkg-3", credits: 3, price: 279, isPopular: false },
                    { id: "pkg-5", credits: 5, price: 449, isPopular: false },
                    { id: "pkg-10", credits: 10, price: 799, isPopular: true },
                    { id: "pkg-20", credits: 20, price: 1499, isPopular: false },
                    { id: "pkg-40", credits: 40, price: 2499, isPopular: false }
                ]
            };
        }
    },

    async updateSettings(settings: SiteSettings): Promise<boolean> {
        try {
            const settingsRef = doc(db, "platformSettings", "globalConfig");
            // Use setDoc with merge to ensure it exists
            const { setDoc } = await import("firebase/firestore");
            await setDoc(settingsRef, settings, { merge: true });
            return true;
        } catch (error) {
            console.error("Error updating settings:", error);
            return false;
        }
    },

    async getAuditLogs(): Promise<AuditLog[]> {
        try {
            const logsRef = collection(db, "auditLogs");
            const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    action: data.action,
                    userId: data.userId,
                    userName: data.userName,
                    details: data.details,
                    timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : new Date().toLocaleString()
                } as AuditLog;
            });
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            return [];
        }
    },

    // --- Analytics / Dashboard ---
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const usersColl = collection(db, "users");
            const testsColl = collection(db, "tests");

            const totalUsersSnap = await getCountFromServer(usersColl);
            const totalTestsSnap = await getCountFromServer(testsColl);

            // Active users logic
            // Note: This needs an index. If failed, it returns 0 or error.
            let activeUsers = 0;
            try {
                const activeUsersSnap = await getCountFromServer(query(usersColl, where("isActive", "==", true)));
                activeUsers = activeUsersSnap.data().count;
            } catch {
                // Fallback if index missing
                console.warn("Could not count active users (index missing?)");
            }

            // Revenue?
            const revenue = 0;

            const recentUsers = await this.getUsers();

            return {
                totalUsers: totalUsersSnap.data().count,
                activeUsers: activeUsers,
                activeTests: totalTestsSnap.data().count,
                revenue: revenue,
                recentRegistrations: recentUsers.slice(0, 5)
            };
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                activeTests: 0,
                revenue: 0,
                recentRegistrations: []
            };
        }
    },

    async getRecentTransactions(): Promise<Transaction[]> {
        try {
            const txHandler = collection(db, "transactions");
            const q = query(txHandler, orderBy("date", "desc"), limit(10));
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    userId: data.userId,
                    userName: data.userName,
                    amount: data.amount,
                    status: data.status,
                    date: data.date ? new Date(data.date.toMillis()).toLocaleDateString() : 'N/A',
                    testId: data.testId,
                    testTitle: data.testTitle
                } as Transaction;
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            return [];
        }
    },

    // --- MEDIA ASSETS ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getMediaAssets(): Promise<any[]> {
        const q = query(collection(db, 'mediaAssets'), orderBy('uploadedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async uploadMediaAsset(asset: any): Promise<any> {
        const docRef = await addDoc(collection(db, 'mediaAssets'), asset);
        return { id: docRef.id, ...asset };
    },

    async deleteMediaAsset(id: string): Promise<void> {
        await deleteDoc(doc(db, 'mediaAssets', id));
    }
};
