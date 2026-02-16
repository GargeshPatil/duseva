import { Monitor, BarChart3, Trophy, BrainCircuit } from "lucide-react";

const features = [
    {
        icon: Monitor,
        title: "100% Real Exam Interface",
        description: "Experience the exact NTA exam screen, timer, and navigation to eliminate exam-day anxiety.",
    },
    {
        icon: BarChart3,
        title: "Deep Performance Analytics",
        description: "Get subject-wise breakdown, time management analysis, and accuracy reports to identify weak areas.",
    },
    {
        icon: Trophy,
        title: "All India Rank & Percentile",
        description: "Compete with thousands of serious aspirants and know exactly where you stand with predictive rank.",
    },
    {
        icon: BrainCircuit,
        title: "Detailed Solutions & Logic",
        description: "Don't just see the answer—understand the concept with step-by-step explanations for every question.",
    },
];

export function Features() {
    return (
        <section id="features" className="py-20 bg-slate-50">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Everything You Need to Ace CUET
                    </h2>
                    <p className="text-lg text-slate-600">
                        Designed by top educators to help you maximize your score in minimum time.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-secondary mb-6">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
