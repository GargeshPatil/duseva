import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            <Navbar />
            <main className="flex-1 container px-4 md:px-6 py-12 max-w-4xl mx-auto prose prose-slate">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
                <p className="text-slate-600 mb-4">Last Updated: February 2026</p>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">1. Introduction</h2>
                <p>Welcome to DU Seva. By using our website and services, you agree to these Terms of Service. Please read them carefully.</p>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">2. Use of Platform</h2>
                <p>Our mock tests are for educational purposes only. You agree not to distribute, copy, or sell any content from our platform without permission.</p>

                <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">3. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</p>

                {/* ... more content ... */}
            </main>
            <Footer />
        </div>
    );
}
