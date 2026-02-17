import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />
            <main className="flex-1 container px-4 md:px-6 py-12 max-w-4xl mx-auto prose prose-slate">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
                <p className="text-slate-600 mb-4">Last Updated: February 2026</p>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Data Collection</h2>
                <p>We collect your name, email, and academic preferences to personalize your mock test experience.</p>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Usage of Data</h2>
                <p>Your data is used solely for improving our services and providing exam analytics. We do not sell your data to third parties.</p>

                {/* ... more content ... */}
            </main>
            <Footer />
        </div>
    );
}
