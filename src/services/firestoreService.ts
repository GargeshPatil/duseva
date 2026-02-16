
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    query,
    orderBy,
    Timestamp,
    addDoc,
    deleteDoc,
    where,
    limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Test, Question, CMSContent, SiteSettings, AuditLog, DashboardStats, Transaction } from "@/types/admin";
import { UserData } from "@/context/AuthContext";

export const firestoreService = {
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
    async getTests(): Promise<Test[]> {
        try {
            const testsRef = collection(db, "tests");
            const q = query(testsRef, orderBy("createdAt", "desc"));
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
                    questions: [], // Questions loaded separately or on demand
                    attempts: data.attemptsCount || 0,
                    createdDate: data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleDateString() : 'N/A',
                    status: data.isPublished ? 'published' : 'draft',
                    sections: data.sections || []
                } as Test;
            });
        } catch (error) {
            console.error("Error fetching tests:", error);
            return [];
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
                isPaid: testData.price === 'paid',
                price: testData.price === 'paid' ? 99 : 0, // Default price logic, update as needed
                isVisible: true,
                isPublished: testData.status === 'published',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                sections: [],
                attemptsCount: 0
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
    async getQuestions(testId?: string): Promise<Question[]> {
        try {
            const questionsRef = collection(db, "questions");
            let q;

            if (testId) {
                // Requires index if we sort by createdAt
                // For simplicity without index, just filter
                q = query(questionsRef, where("testId", "==", testId));
            } else {
                q = query(questionsRef, orderBy("createdAt", "desc"), limit(100)); // Limit for performance
            }

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
                    // Add other fields as needed
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
            const settingsRef = doc(db, "settings", "global");
            const docSnap = await getDocs(collection(db, "settings"));
            // Assuming single doc or specific ID 'global'
            // For robustness, let's try to get 'global' doc, if not exists, return default
            // Actually, getDocs on collection is better if we don't know ID, but 'global' is standard.

            // Let's just mock a default for now if standard implies
            // But better: try to fetch 'global'.
            // Actually, let's use getDoc on 'global' ID.
            // Wait, import getDoc is missing? 
            // I see getDocs, doc, updateDoc... but getDoc?
            // I'll check imports.

            // If getDoc is missing, I should add it to imports.
            // Or use getDocs(query(collection(db, "settings"), limit(1))).

            const q = query(collection(db, "settings"), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const data = snapshot.docs[0].data();
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
            // We need to know the ID. If we fetched it, we should store ID. 
            // But SiteSettings interface doesn't have ID.
            // We'll perform a query to find the doc to update, or create 'global'.

            const q = query(collection(db, "settings"), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const docId = snapshot.docs[0].id;
                await updateDoc(doc(db, "settings", docId), { ...settings });
            } else {
                await addDoc(collection(db, "settings"), { ...settings });
            }
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
            const { getCountFromServer } = await import("firebase/firestore");

            const usersColl = collection(db, "users");
            const testsColl = collection(db, "tests");

            const totalUsersSnap = await getCountFromServer(usersColl);
            const totalTestsSnap = await getCountFromServer(testsColl);

            // Active users? e.g. lastLoginAt > 30 days ago. 
            // For now, let's just count all for simplicity or use a simple query if indexed.
            const activeUsersSnap = await getCountFromServer(query(usersColl, where("isActive", "==", true)));

            // Revenue? Needs transactions collection aggregation.
            // Fallback:
            const revenue = 0;

            const recentUsers = await this.getUsers();

            return {
                totalUsers: totalUsersSnap.data().count,
                activeUsers: activeUsersSnap.data().count,
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
