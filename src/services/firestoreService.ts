
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
    getCountFromServer
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Test, Question, CMSContent, SiteSettings, AuditLog, DashboardStats, Transaction, TestAttempt, TestResult } from "@/types/admin";
import { UserData } from "@/context/AuthContext";

export const firestoreService = {
    // --- Test Engine ---
    async startTestAttempt(userId: string, testId: string, durationMinutes: number): Promise<string | null> {
        try {
            const attemptsRef = collection(db, "testAttempts");

            // Check if there's an active attempt first?
            const q = query(
                attemptsRef,
                where("userId", "==", userId),
                where("testId", "==", testId),
                where("status", "==", "in_progress")
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log("Resuming existing attempt:", snapshot.docs[0].id);
                return snapshot.docs[0].id;
            }

            const newAttempt: Omit<TestAttempt, 'id'> = {
                userId,
                testId,
                startTime: new Date().toISOString(),
                answers: {},
                timeRemaining: durationMinutes * 60,
                status: 'in_progress',
                currentQuestionIndex: 0,
                questionStatus: {}
            };

            const docRef = await addDoc(attemptsRef, newAttempt);
            return docRef.id;
        } catch (error) {
            console.error("Error starting test attempt:", error);
            return null;
        }
    },

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
        finalStatus?: Record<string, any>
    ): Promise<boolean> {
        try {
            const attemptRef = doc(db, "testAttempts", attemptId);

            // We update the attempt with the final score, status, AND the final answers/state
            // This ensures that even if the periodic sync missed the last few seconds, we have the latest data.
            const updatePayload: any = {
                status: 'completed',
                endTime: new Date().toISOString(),
                score: resultData.score,
                timeTaken: resultData.timeTaken,
                resultData: resultData
            };

            if (finalAnswers) updatePayload.answers = finalAnswers;
            if (finalStatus) updatePayload.questionStatus = finalStatus;

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
            const attemptsRef = collection(db, "testAttempts");
            // Index required: userId ASC, testId ASC, startTime DESC
            // If index missing, might fail. 
            // Workaround: Filter by user and test, then sort in memory if needed, or rely on simple query?
            // "where" clauses can be combined. sorting by startTime requires index.

            const q = query(
                attemptsRef,
                where("userId", "==", userId),
                where("testId", "==", testId),
                where("status", "==", "completed"),
                orderBy("startTime", "desc"),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() } as TestAttempt;
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
            let q;

            if (status) {
                q = query(
                    attemptsRef,
                    where("userId", "==", userId),
                    where("status", "==", status),
                    orderBy("startTime", "desc")
                );
            } else {
                q = query(
                    attemptsRef,
                    where("userId", "==", userId),
                    orderBy("startTime", "desc")
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestAttempt));
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
                    paymentStatus: Object.keys(data.purchasedTests || {}).length > 0 ? 'paid' : 'free'
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
                // Students MUST filter by isVisible == true to pass security rules
                q = query(testsRef, where("isVisible", "==", true), orderBy("createdAt", "desc"));
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
                    price: data.isPaid ? 'paid' : 'free',
                    priceAmount: data.price ? Number(data.price) : (data.isPaid ? 99 : 0),
                    questions: [],
                    attempts: data.attemptsCount || 0,
                    createdDate: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    status: data.isPublished ? 'published' : 'draft',
                    stream: data.stream,
                    questionIds: data.questionIds || [],
                    sections: data.sections || []
                } as Test;
            });
        } catch (error) {
            console.error("Error fetching tests:", error);
            return [];
        }
    },

    async getTest(testId: string): Promise<Test | null> {
        try {
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
                    price: data.isPaid ? 'paid' : 'free',
                    priceAmount: data.price ? Number(data.price) : (data.isPaid ? 99 : 0),
                    questions: [],
                    attempts: data.attemptsCount || 0,
                    createdDate: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    status: data.isPublished ? 'published' : 'draft',
                    stream: data.stream,
                    questionIds: data.questionIds || [],
                    sections: data.sections || []
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
                stream: testData.stream || 'General', // Default to General
                isPaid: testData.price === 'paid',
                price: testData.price === 'paid' ? 99 : 0, // Default price logic, update as needed
                isVisible: true,
                isPublished: testData.status === 'published',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                sections: [],
                attemptsCount: 0,
                questionIds: testData.questionIds || []
            };

            const docRef = await addDoc(testsRef, newTest);
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
            const firestoreUpdates: any = {
                updatedAt: Timestamp.now()
            };

            if (updates.title) firestoreUpdates.title = updates.title;
            if (updates.description) firestoreUpdates.description = updates.description;
            if (updates.duration) firestoreUpdates.durationMinutes = updates.duration;
            if (updates.totalMarks) firestoreUpdates.totalMarks = updates.totalMarks;
            if (updates.difficulty) firestoreUpdates.difficulty = updates.difficulty;
            if (updates.status) firestoreUpdates.isPublished = updates.status === 'published';
            if (updates.price) firestoreUpdates.isPaid = updates.price === 'paid';
            if (updates.stream) firestoreUpdates.stream = updates.stream;
            if (updates.questionIds) firestoreUpdates.questionIds = updates.questionIds;

            await updateDoc(testRef, firestoreUpdates);
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

                // Sort to match input order if needed, or by created? 
                // For now, just return them.
                return allDocs.map(doc => {
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
                    } as Question;
                });
            }

            // 2. Standard Filtering
            let constraints: any[] = [];

            if (filters?.testId) {
                constraints.push(where("testId", "==", filters.testId));
            }
            if (filters?.stream) {
                constraints.push(where("stream", "==", filters.stream));
            }
            if (filters?.subject) {
                constraints.push(where("subject", "==", filters.subject));
            }

            constraints.push(orderBy("createdAt", "desc"));
            constraints.push(limit(filters?.limit || 100));

            const q = query(questionsRef, ...constraints);
            const querySnapshot = await getDocs(q);

            return querySnapshot.docs.map(doc => {
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
                } as Question;
            });
        } catch (error) {
            console.error("Error fetching questions:", error);
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

            const docRef = await addDoc(questionsRef, newQuestion);
            return docRef.id;
        } catch (error) {
            console.error("Error creating question:", error);
            return null;
        }
    },

    async updateQuestion(id: string, updates: Partial<Question>): Promise<boolean> {
        try {
            const questionRef = doc(db, "questions", id);
            await updateDoc(questionRef, {
                ...updates,
                updatedAt: Timestamp.now()
            });
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
            console.error("Error fetching CMS content:", error);
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
                    maintenanceMode: data.maintenanceMode || false
                } as SiteSettings;
            }

            return {
                siteName: "CUET Mock Platform",
                supportEmail: "support@example.com",
                currency: "INR",
                maintenanceMode: false
            };
        } catch (error) {
            console.error("Error fetching settings:", error);
            return {
                siteName: "CUET Mock Platform",
                supportEmail: "support@example.com",
                currency: "INR",
                maintenanceMode: false
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
    }
};
