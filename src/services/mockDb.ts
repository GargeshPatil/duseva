import { User, Test, CMSContent, DashboardStats, Transaction, MediaAsset, SiteSettings } from "@/types/admin";

// Initial Mock Data
const INITIAL_USERS: User[] = [
    { id: '1', name: 'Arjun Kumar', email: 'arjun@example.com', role: 'student', joinedAt: '2025-01-15', testsTaken: 12, avgScore: 85, isActive: true, paymentStatus: 'paid' },
    { id: '2', name: 'Priya Sharma', email: 'priya@example.com', role: 'student', joinedAt: '2025-01-20', testsTaken: 5, avgScore: 72, isActive: true, paymentStatus: 'free' },
    { id: '3', name: 'Rahul Verma', email: 'rahul@example.com', role: 'student', joinedAt: '2025-02-01', testsTaken: 8, avgScore: 78, isActive: true, paymentStatus: 'paid' },
    { id: '4', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'student', joinedAt: '2025-02-10', testsTaken: 2, avgScore: 65, isActive: true, paymentStatus: 'free' },
];

const INITIAL_TESTS: Test[] = [
    {
        id: '1', title: 'English Language - Mock 1', description: 'Comprehensive English mock test covering reading comprehension and grammar.',
        duration: 45, totalMarks: 200, difficulty: 'Medium', category: 'Subject', price: 'free',
        questions: [], attempts: 120, createdDate: '2025-01-10', status: 'published'
    },
    {
        id: '2', title: 'General Test - Full Mock', description: 'Full syllabus General Test including GK, Current Affairs, and Logical Reasoning.',
        duration: 60, totalMarks: 250, difficulty: 'Hard', category: 'General', price: 'paid',
        questions: [], attempts: 85, createdDate: '2025-01-25', status: 'published'
    },
    {
        id: '3', title: 'Physics Domain - Chapterwise', description: 'Focusing on Electrostatics and Current Electricity.',
        duration: 60, totalMarks: 200, difficulty: 'Hard', category: 'Subject', price: 'paid',
        questions: [], attempts: 45, createdDate: '2025-02-05', status: 'draft'
    },
];

const INITIAL_CMS: CMSContent[] = [
    { id: '1', section: 'hero', key: 'headline', value: 'Crack CUET with Real Exam-Level Mock Tests' },
    { id: '2', section: 'hero', key: 'subheadline', value: 'Boost your speed, accuracy, and percentile with India\'s most advanced mock test platform.' },
    { id: '3', section: 'pricing', key: 'title', value: 'Simple, Transparent Pricing' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 'tx_101', userId: '1', userName: 'Arjun Kumar', amount: 999, status: 'success', date: '2025-01-15', testTitle: 'All-In-One Bundle' },
    { id: 'tx_102', userId: '3', userName: 'Rahul Verma', amount: 499, status: 'success', date: '2025-02-01', testTitle: 'General Test Only' },
    { id: 'tx_103', userId: '5', userName: 'Vikram Singh', amount: 999, status: 'failed', date: '2025-02-12', testTitle: 'All-In-One Bundle' },
];

const INITIAL_MEDIA: MediaAsset[] = [
    { id: 'm1', name: 'hero-banner.jpg', url: 'https://placehold.co/800x400?text=Hero+Banner', type: 'image', size: '1.2 MB', uploadedAt: '2025-01-05' },
    { id: 'm2', name: 'logo-dark.png', url: 'https://placehold.co/200x50?text=Logo', type: 'image', size: '45 KB', uploadedAt: '2025-01-05' },
    { id: 'm3', name: 'question-diagram-1.png', url: 'https://placehold.co/400x300?text=Diagram', type: 'image', size: '250 KB', uploadedAt: '2025-02-10' },
];

const INITIAL_SETTINGS: SiteSettings = {
    siteName: 'CUET Prep',
    supportEmail: 'support@cuetprep.com',
    currency: 'INR',
    maintenanceMode: false,
};

class MockDatabase {
    private users: User[] = [...INITIAL_USERS];
    private tests: Test[] = [...INITIAL_TESTS];
    private cms: CMSContent[] = [...INITIAL_CMS];
    private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
    private media: MediaAsset[] = [...INITIAL_MEDIA];
    private settings: SiteSettings = { ...INITIAL_SETTINGS };

    // --- Users ---
    async getUsers(): Promise<User[]> {
        return new Promise((resolve) => setTimeout(() => resolve(this.users), 500));
    }

    async toggleUserStatus(id: string): Promise<User | undefined> {
        const user = this.users.find(u => u.id === id);
        if (user) {
            user.isActive = !user.isActive;
        }
        return user;
    }

    // --- Tests ---
    async getTests(): Promise<Test[]> {
        return new Promise((resolve) => setTimeout(() => resolve(this.tests), 500));
    }

    async createTest(test: Omit<Test, 'id' | 'questions' | 'attempts' | 'createdDate'>): Promise<Test> {
        const newTest: Test = {
            ...test,
            id: Math.random().toString(36).substr(2, 9),
            questions: [],
            attempts: 0,
            createdDate: new Date().toISOString().split('T')[0],
        };
        this.tests.push(newTest);
        return newTest;
    }

    async updateTest(id: string, updates: Partial<Test>): Promise<Test | undefined> {
        const index = this.tests.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tests[index] = { ...this.tests[index], ...updates };
            return this.tests[index];
        }
        return undefined;
    }

    async deleteTest(id: string): Promise<boolean> {
        this.tests = this.tests.filter(t => t.id !== id);
        return true;
    }

    // --- CMS ---
    async getCMSContent(): Promise<CMSContent[]> {
        return this.cms;
    }

    async updateCMSContent(id: string, value: string): Promise<CMSContent | undefined> {
        const item = this.cms.find(c => c.id === id);
        if (item) {
            item.value = value;
            return item;
        }
        return undefined;
    }

    // --- Transactions ---
    async getTransactions(): Promise<Transaction[]> {
        return new Promise((resolve) => setTimeout(() => resolve(this.transactions), 500));
    }

    // --- Media ---
    async getMediaAssets(): Promise<MediaAsset[]> {
        return new Promise((resolve) => setTimeout(() => resolve(this.media), 500));
    }

    async uploadMedia(file: { name: string, size: string }): Promise<MediaAsset> {
        const newAsset: MediaAsset = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: `https://placehold.co/400x300?text=${file.name}`,
            type: 'image',
            size: file.size,
            uploadedAt: new Date().toISOString().split('T')[0]
        };
        this.media.push(newAsset);
        return newAsset;
    }

    async deleteMedia(id: string): Promise<boolean> {
        this.media = this.media.filter(m => m.id !== id);
        return true;
    }

    // --- Settings ---
    async getSettings(): Promise<SiteSettings> {
        return this.settings;
    }

    async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
        this.settings = { ...this.settings, ...updates };
        return this.settings;
    }

    // --- Dashboard Stats ---
    async getDashboardStats(): Promise<DashboardStats> {
        return {
            totalUsers: this.users.length,
            activeUsers: this.users.filter(u => u.isActive).length,
            activeTests: this.tests.filter(t => t.status === 'published').length,
            revenue: this.transactions.filter(t => t.status === 'success').reduce((acc, curr) => acc + curr.amount, 0),
            recentRegistrations: this.users.slice(0, 5),
        };
    }
}

export const mockDb = new MockDatabase();
